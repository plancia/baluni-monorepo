import erc20Abi from 'baluni-contracts/abis/common/ERC20.json';
import { ethers, Signer } from 'ethers';
import { INFRA, PROTOCOLS } from '../../constants';
import { Builder } from '../../classes/builder';
import { BuildResponse, TransactionBase } from '../../types';
import { TradeType } from '@uniswap/sdk';
import { route } from '../../modules/uniswap-v3/module.best-quote';

export type Tswap = {
  address: string;
  token0: string;
  token1: string;
  chainId: string;
  amount: bigint;
  slippage: number;
};

export class SwapTokenLogic {
  static id = 'swap-token';
  static protocolId = 'uniswap-v3';
  public uniswapRouterAddress: string | undefined;
  public baluniRouterAddress: string | undefined;
  public signer: Signer;

  constructor(_signer: Signer) {
    this.signer = _signer;
    this.baluniRouterAddress = undefined;
  }

  get id() {
    return SwapTokenLogic.id;
  }

  get protocolId() {
    return SwapTokenLogic.protocolId;
  }

  async setup(chainId: number) {
    this.uniswapRouterAddress = PROTOCOLS[chainId]?.['uni-v3']?.ROUTER;
    this.baluniRouterAddress = INFRA[chainId]?.ROUTER;

    if (!this.uniswapRouterAddress || !this.baluniRouterAddress) {
      throw new Error('::API::ODOS::ROUTER_NOT_FOUND, SETUP_REQUIRED');
    }
  }

  async build(sender: string, swaps: Array<Tswap>): Promise<BuildResponse> {
    const builder = new Builder(this.signer);
    await builder.setup();

    if (!this.uniswapRouterAddress) {
      throw new Error('::API::UNISWAP::ROUTER_NOT_FOUND, SETUP_REQUIRED');
    }

    const approvals: TransactionBase[] = [];
    const calldatas: TransactionBase[] = [];

    // const outputs: TokenData[] = swaps.map((swap) => {
    //   return {
    //     tokenAddress: swap.token1,
    //     amount: swap.amount,
    //   };
    // });
    // let tokens_return = outputs.map((token) => token.tokenAddress);

    let tokens_return: string[] = [];
    const _tokens_return = new Set<string>();

    if (builder.sender != sender) {
      throw new Error('::API::ODOS::SENDER_NOT_MATCHED');
    }

    if (builder.agentAddress !== sender) {
      const agentAddress = builder.agentAddress;

      for (const swap of swaps) {
        const token0Contract = new ethers.Contract(
          swap.token0,
          erc20Abi,
          this.signer
        );

        const token1Contract = new ethers.Contract(
          swap.token1,
          erc20Abi,
          this.signer
        );

        // const token0Decimals = await token0Contract.decimals();

        const token1Decimals = await token1Contract.decimals();
        const allowanceFromAgentToUniswap = await token0Contract?.allowance(
          builder.agentAddress,
          this.uniswapRouterAddress
        );

        const adjAmount = ethers.BigNumber.from(swap.amount);

        if (adjAmount.gt(allowanceFromAgentToUniswap)) {
          const approvalTxData = await builder.buildApprovals(
            token0Contract,
            this.uniswapRouterAddress,
            BigInt(String(ethers.constants.MaxUint256))
          );

          calldatas.push(approvalTxData);
        }

        const allowanceFromSenderToAgentAddress =
          await token0Contract?.allowance(sender, agentAddress);

        if (adjAmount.gt(allowanceFromSenderToAgentAddress)) {
          const approvalTxData = await builder.buildApprovals(
            token0Contract,
            agentAddress,
            BigInt(String(ethers.constants.MaxUint256))
          );

          approvals.push(approvalTxData);
        } else {
          console.log('::API::ODOS::FOUND_ALLOWANCE_SENDER_AGENT');
        }

        const currency = {
          address: token1Contract.address,
          decimals: token1Decimals,
          symbol: await token1Contract.symbol(),
          name: await token1Contract.name(),
        };

        const currencyAmount = {
          address: token0Contract.address,
          decimals: token1Decimals,
          symbol: await token0Contract.symbol(),
          name: await token0Contract.name(),
        };

        const bestRoute = await route({
          chainId: Number(137),
          recipient: agentAddress,
          amount: adjAmount,
          tradeType: TradeType.EXACT_INPUT,
          currencyAmount: currencyAmount,
          currency: currency,
          slippage: swaps[0].slippage,
        });

        const allowanceAgentToUniswapRouter = await token0Contract?.allowance(
          agentAddress,
          this.uniswapRouterAddress
        );

        if (adjAmount.gt(allowanceAgentToUniswapRouter)) {
          const approvalAgentToUniswap = await builder.buildApprovals(
            token0Contract,
            this.uniswapRouterAddress,
            BigInt(String(ethers.constants.MaxUint256))
          );

          calldatas.push(approvalAgentToUniswap);
        }

        for (let i = 0; i < (bestRoute?.route.length ?? 0); i++) {
          bestRoute?.route[i].tokenPath.forEach((token) =>
            _tokens_return.add(token.address)
          );
        }

        const swapMultiAgentToUniswap = {
          to: String(bestRoute?.methodParameters?.to),
          value: BigInt(String(bestRoute?.methodParameters?.value)),
          data: String(bestRoute?.methodParameters?.calldata),
        };

        const transferFromSenderToAgent = await builder.buildTransferFrom(
          token0Contract,
          agentAddress,
          sender,
          BigInt(String(adjAmount))
        );

        calldatas.push(transferFromSenderToAgent);
        calldatas.push(swapMultiAgentToUniswap);
        tokens_return = Array.from(_tokens_return);
      }
    } else {
      for (const swap of swaps) {
        const token0Contract = new ethers.Contract(
          swap.token0,
          erc20Abi,
          this.signer
        );

        const token1Contract = new ethers.Contract(
          swap.token1,
          erc20Abi,
          this.signer
        );

        // const token0Decimals = await token0Contract.decimals();
        const token1Decimals = await token1Contract.decimals();
        const adjAmount = ethers.BigNumber.from(swap.amount);
        const allowanceFromSenderToUniswap = await token0Contract?.allowance(
          sender,
          this.uniswapRouterAddress
        );

        if (adjAmount.gt(allowanceFromSenderToUniswap)) {
          const approvalTxData = await builder.buildApprovals(
            token0Contract,
            this.uniswapRouterAddress,
            BigInt(String(ethers.constants.MaxUint256))
          );

          calldatas.push(approvalTxData);
        }

        const currency = {
          address: token1Contract.address,
          decimals: token1Decimals,
          symbol: await token1Contract.symbol(),
          name: await token1Contract.name(),
        };

        const currencyAmount = {
          address: token0Contract.address,
          decimals: token1Decimals,
          symbol: await token0Contract.symbol(),
          name: await token0Contract.name(),
        };

        const bestRoute = await route({
          chainId: Number(137),
          recipient: sender,
          amount: adjAmount,
          tradeType: TradeType.EXACT_INPUT,
          currencyAmount: currencyAmount,
          currency: currency,
          slippage: swaps[0].slippage,
        });

        for (let i = 0; i < (bestRoute?.route.length ?? 0); i++) {
          bestRoute?.route[i].tokenPath.forEach((token) =>
            _tokens_return.add(token.address)
          );
        }

        const swapMultiAgentToRouter = {
          to: String(bestRoute?.methodParameters?.to),
          value: BigInt(String(bestRoute?.methodParameters?.value)),
          data: String(bestRoute?.methodParameters?.calldata),
        };

        calldatas.push(swapMultiAgentToRouter);
        tokens_return = Array.from(_tokens_return);
      }
    }

    return { approvals, calldatas, tokens_return };
  }
}

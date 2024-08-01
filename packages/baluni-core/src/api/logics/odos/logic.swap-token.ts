import erc20Abi from 'baluni-contracts/abis/common/ERC20.json';
import { ethers, Signer } from 'ethers';
import { INFRA, PROTOCOLS } from '../../constants';
import { Builder } from '../../classes/builder';
import { BuildResponse, TransactionBase } from '../../types';

export interface QuoteParams {
  chainId: number; // Replace with desired chainId
  inputTokens: { tokenAddress: string; amount: string }[];
  outputTokens: { tokenAddress: string; proportion: number }[];
  userAddr: string;
  slippageLimitPercent: number; // set your slippage limit percentage (1 = 1%)
}

export interface QuoteRequestBody {
  chainId: number;
  inputTokens: { tokenAddress: string; amount: string }[];
  outputTokens: { tokenAddress: string; proportion: number }[];
  gasPrice: number;
  userAddr: string;
  slippageLimitPercent: number;
  sourceBlacklist: string[];
  sourceWhitelist: string[];
  disableRFQs: boolean;
  referralCode: number;
  compact: boolean;
  pathViz: boolean; // Può essere specificato meglio se si conosce il tipo esatto

  pathVizImage: boolean;
}

export interface QuoteRequestResponse {
  inTokens: string[];
  outTokens: string[];
  inAmounts: string[];
  outAmounts: string[];
  gasEstimate: number;
  dataGasEstimate: number;
  gweiPerGas: number;
  gasEstimateValue: number;
  inValues: number[];
  outValues: number[];
  netOutValue: number;
  priceImpact: number;
  percentDiff: number;
  partnerFeePercent: number;
  pathId: string;
  blockNumber: number;
}

interface TokenData {
  tokenAddress: string;
  amount: string;
}

export class SwapTokenLogic {
  static id = 'swap-token';
  static protocolId = 'odos';
  public odosRouterAddress: string | undefined;
  public baluniRouterAddress: string | undefined;
  public signer: Signer;

  constructor(_signer: Signer) {
    this.signer = _signer;
    this.odosRouterAddress = undefined;
    this.baluniRouterAddress = undefined;
  }

  get id() {
    return SwapTokenLogic.id;
  }

  get protocolId() {
    return SwapTokenLogic.protocolId;
  }

  async setup(chainId: number) {
    this.odosRouterAddress = PROTOCOLS[chainId]?.odos?.ROUTER;
    this.baluniRouterAddress = INFRA[chainId]?.ROUTER;

    if (!this.odosRouterAddress || !this.baluniRouterAddress) {
      throw new Error('::API::ODOS::ROUTER_NOT_FOUND, SETUP_REQUIRED');
    }
  }

  async quote(params: QuoteParams): Promise<QuoteRequestResponse> {
    if (!this.odosRouterAddress) {
      throw new Error('::API::ODOS::ROUTER_NOT_FOUND, SETUP_REQUIRED');
    }

    const quoteRequestBody: QuoteRequestBody = {
      chainId: params.chainId,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      gasPrice: 80,
      userAddr: params.userAddr,
      slippageLimitPercent: params.slippageLimitPercent,
      sourceBlacklist: [],
      sourceWhitelist: [],
      disableRFQs: true,
      referralCode: 3844415834,
      compact: true,
      pathVizImage: true,
      pathViz: true,
    };

    console.log('Get Response from ODOS api.........', quoteRequestBody);

    const responseQuote = await fetch('https://api.odos.xyz/sor/quote/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quoteRequestBody),
    });

    console.log('Response from ODOS api..', responseQuote);

    if (responseQuote.status === 200) {
      return await responseQuote.json();
    } else {
      throw new Error('Error in Quote');
    }
  }

  async build(
    sender: string,
    quote: QuoteRequestResponse
  ): Promise<BuildResponse> {
    const builder = new Builder(this.signer);
    await builder.setup();

    const agentAddress = builder.agentAddress;

    if (!this.odosRouterAddress) {
      throw new Error('::API::ODOS::ROUTER_NOT_FOUND, SETUP_REQUIRED');
    }

    const approvals: TransactionBase[] = [];
    const calldatas: TransactionBase[] = [];

    const outputs: TokenData[] = quote.outTokens.map((token, index) => ({
      tokenAddress: token,
      amount: quote.outAmounts[index],
    }));

    const tokens_return = outputs.map((token) => token.tokenAddress);

    if (builder.sender != sender) {
      throw new Error('::API::ODOS::SENDER_NOT_MATCHED');
    }

    if (builder.agentAddress !== sender) {
      for (const token of quote.inTokens) {
        const tokenContract = new ethers.Contract(token, erc20Abi, this.signer);
        const allowanceFromAgentToOdosRouter = await tokenContract?.allowance(
          agentAddress,
          this.odosRouterAddress
        );

        const adjAmount = ethers.BigNumber.from(
          quote.inAmounts[quote.inTokens.indexOf(token)]
        );

        if (adjAmount.gt(allowanceFromAgentToOdosRouter)) {
          const approvalTxData = await builder.buildApprovals(
            tokenContract,
            this.odosRouterAddress,
            BigInt(String(ethers.constants.MaxUint256))
          );

          calldatas.push(approvalTxData);
        }

        const allowanceFromSenderToAgentAddress =
          await tokenContract?.allowance(sender, agentAddress);

        if (adjAmount.gt(allowanceFromSenderToAgentAddress)) {
          const approvalTxData = await builder.buildApprovals(
            tokenContract,
            agentAddress,
            BigInt(String(ethers.constants.MaxUint256))
          );

          approvals.push(approvalTxData);
        } else {
          console.log('::API::ODOS::FOUND_ALLOWANCE_SENDER_AGENT');
        }

        const transferDataParams = await builder.buildTransferFrom(
          tokenContract,
          sender,
          agentAddress,
          BigInt(String(adjAmount))
        );

        calldatas.push(transferDataParams);
      }

      const assembleRequestBody = {
        userAddr: agentAddress,
        pathId: quote.pathId,
        simulate: false,
      };

      const responseAssemble = await fetch(
        'https://api.odos.xyz/sor/assemble',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assembleRequestBody),
        }
      );

      if (responseAssemble.status === 200) {
        const assembledTransaction = await responseAssemble.json();
        console.log('Assembled Tx', assembledTransaction);

        const tx = {
          to: assembledTransaction.transaction.to,
          value: BigInt(assembledTransaction.transaction.value),
          data: assembledTransaction.transaction.data,
          gasLimit: BigInt(assembledTransaction.transaction.gasPrice),
          gasPrice: BigInt(assembledTransaction.transaction.gas),
        };
        calldatas.push(tx);
      } else {
        console.error('Error in Transaction Assembly:', responseAssemble);
      }
    } else {
      for (const token of quote.inTokens) {
        const tokenContract = new ethers.Contract(token, erc20Abi, this.signer);

        const adjAmount = ethers.BigNumber.from(
          quote.inAmounts[quote.inTokens.indexOf(token)]
        );

        const allowanceFromSenderToAgentAddress =
          await tokenContract?.allowance(sender, this.odosRouterAddress);

        if (adjAmount.gt(allowanceFromSenderToAgentAddress)) {
          const approvalTxData = await builder.buildApprovals(
            tokenContract,
            this.odosRouterAddress,
            BigInt(String(ethers.constants.MaxUint256))
          );

          calldatas.push(approvalTxData);
        }
      }
      const assembleRequestBody = {
        userAddr: sender,
        pathId: quote.pathId,
        simulate: false,
      };

      const responseAssemble = await fetch(
        'https://api.odos.xyz/sor/assemble',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assembleRequestBody),
        }
      );

      if (responseAssemble.status === 200) {
        const assembledTransaction = await responseAssemble.json();
        console.log('Assembled Tx', assembledTransaction);

        const tx = {
          to: assembledTransaction.transaction.to,
          value: BigInt(assembledTransaction.transaction.value),
          data: assembledTransaction.transaction.data,
          gasLimit: BigInt(assembledTransaction.transaction.gasPrice),
          gasPrice: BigInt(assembledTransaction.transaction.gas),
        };
        calldatas.push(tx);
      } else {
        console.error('Error in Transaction Assembly:', responseAssemble);
      }
    }

    return { approvals, calldatas, tokens_return };
  }
}

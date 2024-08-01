import { Contract, ContractInterface, ethers, Signer } from 'ethers';
import YEARN_VAULT_ABI from '../../abis/yearn/YearnVault.json';
import ERC20ABI from 'baluni-contracts/abis/common/ERC20.json';
import { Builder } from '../../classes/builder';
import { BuildResponse, TransactionBase } from '../../types';

export class RedeemTokenLogic {
  static id = 'redeem-token';
  static protocolId = 'yearn';

  public signer: Signer;

  constructor(_signer: Signer) {
    this.signer = _signer;
  }

  get id() {
    return RedeemTokenLogic.id;
  }

  get protocolId() {
    return RedeemTokenLogic.protocolId;
  }

  async build(
    redeems: Array<{
      pool: string;
      amount: string;
      receiver: string;
      chainId: string;
    }>
  ): Promise<BuildResponse> {
    const builder = new Builder(this.signer);
    await builder.setup();

    const approvals: TransactionBase[] = [];
    const calldatas: TransactionBase[] = [];
    const tokens_return = [];

    for (const data of redeems) {
      const i = redeems.indexOf(data);
      const pool = redeems[i].pool;
      const amount = redeems[i].amount;
      const receiver = redeems[i].receiver;
      const vault = new ethers.Contract(
        pool,
        YEARN_VAULT_ABI as ContractInterface,
        this.signer
      );
      const vaultBalance = await vault.balanceOf(receiver);
      console.log(
        '::API::YEARN::REDEEM:BATCHED VAULT_BALANCE',
        Number(vaultBalance)
      );

      console.log('::API::YEARN::REDEEM:BATCHED AMOUNT', Number(amount));

      if (vaultBalance.lt(amount)) {
        throw new Error('::API::YEARN::REDEEM:BATCHED Insufficient balance');
      }

      if (builder.agentAddress === builder.sender) {
        const sender = builder.sender;
        const allowanceYearn = await vault?.allowance(sender, pool);

        // Approve sender to vault and push in calldatas
        if (allowanceYearn.lt(amount)) {
          const approvalCalldata = await builder.buildApprovals(
            vault,
            pool,
            BigInt(String(ethers.constants.MaxUint256))
          );
          calldatas.push(approvalCalldata);
        }

        const redeemData = await this.buildRedeem(
          vault,
          receiver,
          BigInt(amount)
        );

        calldatas.push(redeemData);
      } else {
        const agentAddress = builder.agentAddress;
        const allowanceAgent = await vault?.allowance(
          builder.sender,
          builder.agentAddress
        );

        if (allowanceAgent.lt(amount)) {
          const approvalCallData = await builder.buildApprovals(
            vault,
            agentAddress,
            BigInt(String(ethers.constants.MaxUint256))
          );

          approvals.push(approvalCallData);
        }

        const allowanceAgentYearn = await vault?.allowance(agentAddress, pool);

        // Allowance for Yearn Vault
        // -------------------------------------------------------------------------
        if (allowanceAgentYearn.lt(amount)) {
          const approvalCalldata = await builder.buildApprovals(
            vault,
            pool,
            BigInt(String(ethers.constants.MaxUint256))
          );

          calldatas.push(approvalCalldata);
        }

        // Transfer From
        // -------------------------------------------------------------------------
        // -------------------------------------------------------------------------
        const transferFromCalldata = await builder.buildTransferFrom(
          vault,
          receiver,
          agentAddress,
          BigInt(amount)
        );

        calldatas.push(transferFromCalldata);

        // Redeem
        // -------------------------------------------------------------------------
        // -------------------------------------------------------------------------

        const redeemCalldata = await this.buildRedeem(
          vault,
          agentAddress,
          BigInt(amount)
        );

        calldatas.push(redeemCalldata);

        const asset = await vault.asset();
        tokens_return.push(asset);
      }
    }

    return {
      approvals,
      calldatas,
      tokens_return,
    };
  }

  async buildRedeem(contract: Contract, to: string, amount: bigint) {
    const redeemData = contract.interface.encodeFunctionData(
      'redeem(uint256,address,address,uint256)',
      [amount, to, to, BigInt(200)]
    );

    return {
      to: contract.to,
      value: BigInt(0),
      data: redeemData,
    };
  }
}

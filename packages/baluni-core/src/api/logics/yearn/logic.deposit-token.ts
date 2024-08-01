import { Contract, ethers, Signer } from 'ethers';
import YEARN_VAULT_ABI from '../../abis/yearn/YearnVault.json';
import ERC20ABI from 'baluni-contracts/abis/common/ERC20.json';
import { Builder } from '../../classes/builder';
import { BuildResponse } from '../../types';
export class DepositTokenLogic {
  static id = 'deposit-token';
  static protocolId = 'yearn';

  public signer: Signer;

  constructor(_signer: Signer) {
    this.signer = _signer;
  }

  get id() {
    return DepositTokenLogic.id;
  }

  get protocolId() {
    return DepositTokenLogic.protocolId;
  }

  async build(
    deposits: Array<{
      chainId: string;
      tokenAddr: string;
      pool: string;
      amount: string;
      receiver: string;
    }>
  ): Promise<BuildResponse> {
    const builder = new Builder(this.signer);
    await builder.setup();

    const approvals = [];
    const calldatas = [];
    const tokens_return = [];

    for (const deposit of deposits) {
      const i = deposits.indexOf(deposit);
      const vaultAddress = deposits[i].pool;
      const amount = BigInt(deposits[i].amount);
      const receiver = deposits[i].receiver;
      const tokenAddr = deposits[i].tokenAddr;
      const token = new ethers.Contract(tokenAddr, ERC20ABI, this.signer);
      const vault = new ethers.Contract(
        vaultAddress,
        YEARN_VAULT_ABI,
        this.signer
      );
      const tokenBalance = await token.balanceOf(receiver);

      if (tokenBalance.lt(amount)) {
        throw new Error('::API::YEARN::DEPOSIT:BATCHED Insufficient balance');
      }

      if (builder.agentAddress === builder.sender) {
        const sender = builder.sender;
        const allowanceYearn = await token?.allowance(sender, vaultAddress);

        // Approve sender to vault and push in calldatas
        if (allowanceYearn.lt(amount)) {
          const approvalCalldata = await builder.buildApprovals(
            token,
            vaultAddress,
            BigInt(String(ethers.constants.MaxUint256)) as bigint
          );
          calldatas.push(approvalCalldata);
        }

        // Deposit to vault and push in calldatas
        const depositCalldata = await this.buildDeposit(vault, sender, amount);
        calldatas.push(depositCalldata);
        tokens_return.push(vault.address);
      } else {
        const allowanceAgent = await token?.allowance(
          builder.sender,
          builder.agentAddress
        );
        const allowanceYearn = await token?.allowance(
          builder.agentAddress,
          vaultAddress
        );

        // Approve sender to agent and push in approvals
        if (allowanceAgent.lt(amount)) {
          const approvalCalldata = await builder.buildApprovals(
            token,
            builder.agentAddress,
            BigInt(String(ethers.constants.MaxUint256)) as bigint
          );
          approvals.push(approvalCalldata);
        }

        // Approve agent to vault and push in calldatas
        if (allowanceYearn.lt(amount)) {
          const approvalCalldata = await builder.buildApprovals(
            token,
            vaultAddress,
            BigInt(String(ethers.constants.MaxUint256)) as bigint
          );

          calldatas.push(approvalCalldata);
        }

        // Transfer from sender to agent and push in calldatas
        const transferFromData = await builder.buildTransferFrom(
          token,
          receiver,
          builder.agentAddress,
          amount
        );

        calldatas.push(transferFromData);

        // Deposit to vault and push in calldatas
        const depositCalldata = await this.buildDeposit(
          vault,
          builder.agentAddress,
          amount
        );

        calldatas.push(depositCalldata);
        tokens_return.push(vault.address);
      }
    }

    return {
      approvals,
      calldatas,
      tokens_return,
    };
  }

  async buildDeposit(contract: Contract, to: string, amount: bigint) {
    const depositData = contract.interface.encodeFunctionData('deposit', [
      amount,
      to,
    ]);

    return {
      to: contract.address,
      value: BigInt(0),
      data: depositData,
    };
  }
}

import { Contract, Signer, ethers } from 'ethers';
import routerAbi from 'baluni-contracts/artifacts/contracts/orchestators/BaluniV1Router.sol/BaluniV1Router.json';
import factoryAbi from 'baluni-contracts/artifacts/contracts/orchestators/BaluniV1AgentFactory.sol/BaluniV1AgentFactory.json';
import registryAbi from 'baluni-contracts/artifacts/contracts/registry/BaluniV1Registry.sol/BaluniV1Registry.json';
import { INFRA } from '../constants';
import { BuildResponse } from '../types/Builder';

/**
 * Represents a Builder class.
 * @class
 */
export class Builder {
  public registryCtx: Contract | null;
  public baluniRouterCtx: Contract | null;
  public agentFactoryCtx: Contract | null;
  public agentAddress: string;
  public signer: Signer;
  public sender: string;

  /**
   * Represents a Builder class.
   * @class
   */
  constructor(_signer: Signer) {
    this.signer = _signer;
    this.registryCtx = null;
    this.baluniRouterCtx = null;
    this.agentFactoryCtx = null;
    this.agentAddress = ethers.constants.AddressZero;
    this.sender = ethers.constants.AddressZero;
  }

  /**
   * Sets up the builder by initializing the necessary contracts and addresses.
   * @param chainId - The chain ID to use for contract initialization.
   */
  async setup() {
    const chainId = await this.signer.getChainId();

    this.registryCtx = new Contract(
      INFRA[chainId].REGISTRY,
      registryAbi.abi,
      this.signer
    );

    const baluniRouterAddress = await this.registryCtx.getBaluniRouter();
    const agentFactoryAddress = await this.registryCtx.getBaluniAgentFactory();

    this.agentFactoryCtx = new Contract(
      agentFactoryAddress,
      factoryAbi.abi,
      this.signer
    );
    this.baluniRouterCtx = new Contract(
      baluniRouterAddress,
      routerAbi.abi,
      this.signer
    );
    this.sender = await this.signer.getAddress();
    this.agentAddress = await this.baluniRouterCtx?.getAgentAddress(
      this.sender
    );

    if (this.agentAddress === ethers.constants.AddressZero) {
      this.agentAddress = this.sender;
    }
  }

  /**
   * Builds a transaction by performing various operations such as checking agent existence,
   * creating agent if necessary, checking and setting allowances, and generating calldatas.
   *
   * @param approvalsForAgent - An array of objects representing approvals for the agent.
   * Each object should have properties: `to` (string), `data` (string), and `value` (string).
   * @param calldatas - An array of objects representing calldatas.
   * Each object should have properties: `to` (string), `data` (string), and `value` (string).
   * @param inputs - An array of objects representing input tokens.
   * Each object should have properties: `tokenAddress` (string) and `amount` (number).
   * @param outputs - An array of objects representing output tokens.
   * Each object should have properties: `tokenAddress` (string) and `amount` (number).
   * @returns An object containing the generated `approvals_sender`, `calldatas`, and `tokens_return`.
   * `approvals_sender` is an array of objects representing approvals for the sender.
   * `calldatas` is an array of objects representing the generated calldatas.
   * `tokens_return` is an array of token addresses.
   * @throws Error if the baluniRouterCtx is not set up or if failed to create agent.
   */
  async buildTransaction(
    approvals: Array<{ to: string; data: string; value: bigint }>,
    calldatas: Array<{ to: string; data: string; value: bigint }>,
    tokens_return: string[]
  ): Promise<BuildResponse> {
    const isForAgent = this.agentAddress !== this.sender;

    if (this.baluniRouterCtx === null) {
      throw new Error('::API::ODOS::BALUNI_ROUTER_NOT_FOUND, SETUP_REQUIRED');
    }

    const txs = [];

    if (isForAgent) {
      const routerAddress = this.baluniRouterCtx.address;
      for (const approval of approvals) {
        txs.push(approval);
      }

      const encodeFunctionData =
        this.baluniRouterCtx.interface.encodeFunctionData('execute', [
          calldatas,
          tokens_return,
        ]);

      const simulate = await this.baluniRouterCtx.callStatic.execute(
        calldatas,
        tokens_return
      );

      if (!simulate) {
        throw new Error('::API::FAILED_TO_EXECUTE');
      }

      txs.push({
        to: routerAddress,
        value: BigInt(0),
        data: encodeFunctionData,
      });
    } else {
      for (const approval of approvals) {
        txs.push(approval);
      }

      for (const calldata of calldatas) {
        const simulate = await this.baluniRouterCtx.callStatic.execute(
          calldatas,
          tokens_return
        );

        if (!simulate) {
          throw new Error('::API::FAILED_TO_EXECUTE');
        }

        txs.push(calldata);
      }
    }

    return {
      txs: txs,
      isForAgent: isForAgent,
    };
  }

  async createAgent() {
    const tx = await this.agentFactoryCtx?.getOrCreateAgent(this.sender);
    await tx.wait();
    const agentAddressOnChain = await this.baluniRouterCtx?.getAgentAddress(
      this.sender
    );

    if (agentAddressOnChain === ethers.constants.AddressZero) {
      throw new Error('::API::ODOS::FAILED_TO_CREATE_AGENT');
    }
    this.agentAddress = agentAddressOnChain;
  }

  async buildApprovals(contract: Contract, to: string, amount: bigint) {
    const approvalData = contract.interface.encodeFunctionData('approve', [
      to,
      amount,
    ]);

    return {
      to: contract.address,
      value: BigInt(0),
      data: approvalData,
    };
  }

  async buildTransferFrom(
    contract: Contract,
    from: string,
    to: string,
    amount: bigint
  ) {
    const transferData = contract.interface.encodeFunctionData('transferFrom', [
      from,
      to,
      amount,
    ]);

    return {
      to: contract.address,
      value: BigInt(0),
      data: transferData,
    };
  }
}

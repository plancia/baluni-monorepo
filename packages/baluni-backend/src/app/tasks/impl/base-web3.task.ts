import { Inject, Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { baluniContracts } from 'baluni-contracts';
import { BaseTask } from './base.task';

@Injectable()
export abstract class BaseWeb3Task extends BaseTask {
  registryCtx: any;
  constructor(
    @Inject('rpcProvider') protected provider,
    @Inject('wallet') protected signer
  ) {
    super()
  }

  async setupRegistry(
    provider: ethers.providers.JsonRpcProvider,
    signer: ethers.Signer
  ) {
    const chainId = await provider
      .getNetwork()
      .then((network: { chainId: any }) => network.chainId);

    let registryCtx;

    if (chainId === 137) {
      const registryAddress =
        baluniContracts.baluniDeploiedContracts[137].BaluniV1Registry;

      if (!registryAddress) {
        console.error(`Address not found for chainId: ${chainId}`);
        return;
      }
      registryCtx = new ethers.Contract(
        registryAddress,
        baluniContracts.baluniRegistryAbi.abi,
        signer
      );
    }

    return registryCtx;
  }

  async initRegistry() {
    this.registryCtx = await this.setupRegistry(this.provider, this.signer);
  }

  abstract execute(...args: any[]): Promise<any>;
}

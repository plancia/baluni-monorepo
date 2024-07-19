import { Inject, Injectable } from '@nestjs/common';
import { setupRegistry } from './setupRegistry';

@Injectable()
export class BaseWeb3Repository {
  registryCtx: any;
  constructor(
    @Inject('rpcProvider') protected provider,
    @Inject('wallet') protected signer
  ) {}

  async initRegistry() {
    this.registryCtx = await setupRegistry(this.provider, this.signer);
  }
}

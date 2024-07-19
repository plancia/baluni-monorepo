import { Inject, Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { BaseWeb3Task } from './base-web3.task';
import { baluniContracts } from 'baluni-contracts';

@Injectable()
export class PoolRebalanceTask extends BaseWeb3Task {
  constructor(
    @Inject('rpcProvider') protected provider,
    @Inject('wallet') protected signer
  ) {
    super(provider, signer);
  }

  async execute() {
    await this.initRegistry();

    if (!this.registryCtx) {
      console.error('Registry context not initialized');
      return;
    }

    try {
      const poolsRegistry = await this.registryCtx.getBaluniPoolRegistry();
      const poolsRegistryCtx = new ethers.Contract(
        String(poolsRegistry),
        baluniContracts.baluniPoolsRegistryAbi.abi,
        this.provider
      );
      const pools = await poolsRegistryCtx.getAllPools();

      for (const pool of pools) {
        const poolContract = new ethers.Contract(
          pool,
          baluniContracts.baluniPoolAbi.abi,
          this.signer
        );

        try {
          const canRebalance = await poolContract.isRebalanceNeeded();
          console.log('IsRebalanceNeeded:', canRebalance, pool);

          if (canRebalance) {
            const gasEstimate = await poolContract.estimateGas.rebalance();
            console.log(
              `Estimated gas for systemDeposit in vault ${pool}: ${gasEstimate.toString()}`
            );

            // Call static method to simulate
            await poolContract.callStatic.rebalance();
            console.log(`Simulation successful for pool: ${pool}`);

            const gasPrice = await this.provider.getGasPrice();
            console.log(`Gas Price: ${gasPrice.toString()}`);
            const gasLimit = gasEstimate.mul(120).div(100); // Add 20% buffer

            // If simulation is successful, send the transaction
            const tx = await poolContract.rebalance({ gasLimit, gasPrice });
            console.log(
              `Transaction sent for pool: ${pool}, tx hash: ${tx.hash}`
            );

            const receipt = await tx.wait();
            console.log(
              `Transaction confirmed for pool: ${pool}, block number: ${receipt.blockNumber}`
            );
          }
        } catch (error) {
          console.error(`Error executing Rebalancefor pool ${pool}:`, error);
        }
      }
    } catch (error) {
      console.error('Error fetching pool or  pool registry:', error);
    }
  }
}

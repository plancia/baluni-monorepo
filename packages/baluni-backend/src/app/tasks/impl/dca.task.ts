import { ConnectionManager } from '@homeofthings/nestjs-sqlite3';
import { Inject, Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { BaseWeb3Task } from './base-web3.task';
import { baluniContracts } from 'baluni-contracts';

@Injectable()
export class DcaTask extends BaseWeb3Task {
  constructor(
    private connectionManager: ConnectionManager,
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
      const dcaVaultRegistry =
        await this.registryCtx.getBaluniDCAVaultRegistry();
      const dcaVaultRegistryCtx = new ethers.Contract(
        String(dcaVaultRegistry),
        baluniContracts.baluniDCAVaultRegistryAbi.abi,
        this.provider
      );
      const vaults = await dcaVaultRegistryCtx.getAllVaults();

      for (const vault of vaults) {
        const vaultContract = new ethers.Contract(
          vault,
          baluniContracts.baluniDCAVaultAbi.abi,
          this.signer
        );

        try {
          const dcaTrigger = await vaultContract.canSystemDeposit();
          console.log('DCA Trigger:', vault, dcaTrigger);

          if (dcaTrigger) {
            // Simulate the transaction
            const gasEstimate = await vaultContract.estimateGas.systemDeposit();
            console.log(
              `Estimated gas for systemDeposit in vault ${vault}: ${gasEstimate.toString()}`
            );

            // Call static method to simulate
            await vaultContract.callStatic.systemDeposit();
            console.log(`Simulation successful for vault: ${vault}`);

            const gasPrice = await this.provider.getGasPrice();
            console.log(`Gas Price: ${gasPrice.toString()}`);
            const gasLimit = gasEstimate.mul(120).div(100); // Add 20% buffer

            // If simulation is successful, send the transaction
            const tx = await vaultContract.systemDeposit({
              gasLimit,
              gasPrice,
            });
            console.log(
              `Transaction sent for vault: ${vault}, tx hash: ${tx.hash}`
            );

            const receipt = await tx.wait();
            console.log(
              `Transaction confirmed for vault: ${vault}, block number: ${receipt.blockNumber}`
            );
          }
        } catch (error) {
          console.error(`Error executing DCA for vault ${vault}:`, error);
        }
      }
    } catch (error) {
      console.error('Error fetching vaults or DCA vault registry:', error);
    }
  }
}

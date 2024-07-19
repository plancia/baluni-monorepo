import { Inject, Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { BaseWeb3Task } from './base-web3.task';
import { baluniContracts } from 'baluni-contracts';

@Injectable()
export class ReinverstEarningsTask extends BaseWeb3Task {
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
      const yearnVaultRegistry =
        await this.registryCtx.getBaluniYearnVaultRegistry();
      const yearnVaultRegistryCtx = new ethers.Contract(
        String(yearnVaultRegistry),
        baluniContracts.baluniYearnVaultRegistryAbi.abi,
        this.provider
      );
      const vaults = await yearnVaultRegistryCtx.getAllVaults();

      for (const vault of vaults) {
        const vaultContract = new ethers.Contract(
          vault,
          baluniContracts.baluniYearnVaultAbi.abi,
          this.signer
        );
        const baseAsset = await vaultContract.baseAsset();
        const baseAssetCtx = new ethers.Contract(
          baseAsset,
          baluniContracts.erc20Abi,
          this.provider
        );
        const baseDecimals = await baseAssetCtx.decimals();

        try {
          const interestEarned = await vaultContract.interestEarned();
          console.log(
            'Interest Earned:',
            ethers.utils.formatUnits(interestEarned, baseDecimals)
          );

          if (
            Number(ethers.utils.formatUnits(interestEarned, baseDecimals)) >
            0.01
          ) {
            const gasEstimate = await vaultContract.estimateGas.buy();
            console.log(
              `Estimated gas for systemDeposit in vault ${vault}: ${gasEstimate.toString()}`
            );

            // Call static method to simulate
            await vaultContract.callStatic.buy();
            console.log(`Simulation successful for vault: ${vault}`);

            const gasPrice = await this.provider.getGasPrice();
            console.log(`Gas Price: ${gasPrice.toString()}`);
            const gasLimit = gasEstimate.mul(120).div(100); // Add 20% buffer

            // If simulation is successful, send the transaction
            const tx = await vaultContract.buy({
              gasLimit: gasLimit,
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
          console.error(`Error executing Reinvest for vault ${vault}:`, error);
        }
      }
    } catch (error) {
      console.error('Error fetching vaults or vault registry:', error);
    }
  }
}

import { ConnectionManager } from '@homeofthings/nestjs-sqlite3';
import { Inject, Injectable } from '@nestjs/common';
import { baluniVaultAbi, baluniVaultRegistryAbi } from 'baluni-contracts';
import { ethers } from 'ethers';
import { erc20Abi, formatUnits } from 'viem';
import { BaseWeb3Task as BaseWeb3Task } from './base-web3.task';

@Injectable()
export class InterestEarnedTask extends BaseWeb3Task {
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
    const db = await this.connectionManager.getConnectionPool().get();

    await db.exec(`
          CREATE TABLE IF NOT EXISTS totalInterestEarned (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            interestEarned TEXT NOT NULL,
            address TEXT NOT NULL
          )
      `);

    const vaultRegistry = await this.registryCtx.getBaluniYearnVaultRegistry();
    const registryContract = new ethers.Contract(
      String(vaultRegistry),
      baluniVaultRegistryAbi.abi,
      this.provider
    );

    const vaults = await registryContract.getAllVaults();

    for (const vault of vaults) {
      const vaultContract = new ethers.Contract(
        vault,
        baluniVaultAbi.abi,
        this.provider
      );

      try {
        const interestEarned = await vaultContract.interestEarned();
        const interestData = {
          timestamp: new Date().toISOString(),
          interestEarned: interestEarned.toString(),
          address: vault,
        };
        const baseToken = await vaultContract.baseAsset();
        const baseCtx = new ethers.Contract(
          String(baseToken),
          erc20Abi,
          this.provider
        );
        const decimals = await baseCtx.decimals();

        await db.run(
          'INSERT INTO totalInterestEarned (timestamp, interestEarned, address) VALUES (?, ?, ?)',
          [
            interestData.timestamp,
            formatUnits(interestData.interestEarned, decimals),
            interestData.address,
          ]
        );

        console.log('Vaults Interest data updated:', interestData);
      } catch (error) {
        console.error(
          `Error fetching interest earned for vault ${vault}:`,
          error
        );
      }
    }

    await db.close();
  }
}

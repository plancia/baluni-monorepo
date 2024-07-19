import { ConnectionManager } from '@homeofthings/nestjs-sqlite3';
import { Inject, Injectable } from '@nestjs/common';
import { baluniVaultAbi, baluniVaultRegistryAbi } from 'baluni-contracts';
import { Contract, ethers } from 'ethers';
import { formatUnits } from 'viem';
import { baluniContracts } from 'baluni-contracts';
import { BaseWeb3Task } from './base-web3.task';

@Injectable()
export class UnitPriceTask extends BaseWeb3Task {
  constructor(
    private connectionManager: ConnectionManager,
    @Inject('rpcProvider') protected provider,
    @Inject('wallet') protected signer
  ) {
    super(provider, signer);
  }
  async fetchAndStoreUnitPrice(contract: Contract, address: string, db: any) {
    try {
      const unitPrice = await contract.unitPrice();
      const unitPriceData = {
        timestamp: new Date().toISOString(),
        unitPrice: unitPrice.toString(),
        address: address,
      };

      await db.run(
        'INSERT INTO unitPrices (timestamp, unitPrice, address) VALUES (?, ?, ?)',
        unitPriceData.timestamp,
        formatUnits(unitPriceData.unitPrice, 18),
        unitPriceData.address
      );

      console.log('Unit Price data updated:', unitPriceData);
    } catch (error) {
      console.error(`Error fetching unit price for address ${address}:`, error);
    }
  }

  async execute() {
    await this.initRegistry();

    if (!this.registryCtx) {
      return;
    }

    const db = await this.connectionManager.getConnectionPool().get();

    await db.exec(`
      CREATE TABLE IF NOT EXISTS unitPrices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        unitPrice TEXT NOT NULL,
        address TEXT NOT NULL
      )
    `);

    try {
      const poolRegistry = await this.registryCtx.getBaluniPoolRegistry();
      const poolRegistryContract = new ethers.Contract(
        String(poolRegistry),
        baluniContracts.baluniPoolRegistryAbi.abi,
        this.provider
      );
      const pools = await poolRegistryContract.getAllPools();

      for (const pool of pools) {
        const poolContract = new ethers.Contract(
          pool,
          baluniContracts.baluniPoolAbi.abi,
          this.provider
        );
        await this.fetchAndStoreUnitPrice(poolContract, pool, db);
      }
    } catch (error) {
      console.error('Error processing pool registry:', error);
    }

    try {
      const vaultRegistry =
        await this.registryCtx.getBaluniYearnVaultRegistry();
      const vaultRegistryContract = new ethers.Contract(
        String(vaultRegistry),
        baluniVaultRegistryAbi.abi,
        this.provider
      );
      const vaults = await vaultRegistryContract.getAllVaults();

      for (const vault of vaults) {
        const vaultContract = new ethers.Contract(
          vault,
          baluniVaultAbi.abi,
          this.provider
        );
        await this.fetchAndStoreUnitPrice(vaultContract, vault, db);
      }
    } catch (error) {
      console.error('Error processing vault registry:', error);
    }

    try {
      const dcaVaultRegistry =
        await this.registryCtx.getBaluniDCAVaultRegistry();
      const dcaVaultRegistryContract = new ethers.Contract(
        String(dcaVaultRegistry),
        baluniContracts.baluniDCAVaultRegistryAbi.abi,
        this.provider
      );
      const dcaVaults = await dcaVaultRegistryContract.getAllVaults();

      for (const vault of dcaVaults) {
        const vaultContract = new ethers.Contract(
          vault,
          baluniContracts.baluniDCAVaultAbi.abi,
          this.provider
        );
        await this.fetchAndStoreUnitPrice(vaultContract, vault, db);
      }
    } catch (error) {
      console.error('Error processing DCA vault registry:', error);
    }

    await db.close();
  }
}

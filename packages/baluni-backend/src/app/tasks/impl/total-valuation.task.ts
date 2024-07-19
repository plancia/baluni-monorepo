import { ConnectionManager } from '@homeofthings/nestjs-sqlite3';
import { Inject, Injectable } from '@nestjs/common';
import { baluniContracts, baluniVaultAbi, baluniVaultRegistryAbi } from 'baluni-contracts';
import { Contract, ethers } from 'ethers';
import { formatUnits } from 'viem';
import { BaseWeb3Task } from './base-web3.task';

@Injectable()
export class TotalValuationTask extends BaseWeb3Task {
  constructor(
    private connectionManager: ConnectionManager,
    @Inject('rpcProvider') protected provider,
    @Inject('wallet') protected signer
  ) {
    super(provider, signer);
  }

  async fetchAndStoreValuation(
    vaultContract: Contract,
    address: string,
    db: any
  ) {
    try {
      const totalValuation = await vaultContract.totalValuation();
      const valuationData = {
        timestamp: new Date().toISOString(),
        totalValuation: Array.isArray(totalValuation)
          ? totalValuation[0].toString()
          : totalValuation.toString(),
        address: address,
      };

      await db.run(
        'INSERT INTO totalValuations (timestamp, totalValuation, address) VALUES (?, ?, ?)',
        valuationData.timestamp,
        formatUnits(valuationData.totalValuation, 6),
        valuationData.address
      );

      console.log('Valuation data updated:', valuationData);
    } catch (error) {
      console.error(
        `Error fetching totalValuation for address ${address}:`,
        error
      );
    }
  }

  async execute() {
    await this.initRegistry();

    if (!this.registryCtx) {
      return;
    }

    const db = await this.connectionManager.getConnectionPool().get();

    await db.exec(`
    CREATE TABLE IF NOT EXISTS totalValuations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      totalValuation TEXT NOT NULL,
      address TEXT NOT NULL
    )
  `);

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
        await this.fetchAndStoreValuation(vaultContract, vault, db);
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
        await this.fetchAndStoreValuation(vaultContract, vault, db);
      }
    } catch (error) {
      console.error('Error processing DCA vault registry:', error);
    }

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
        await this.fetchAndStoreValuation(poolContract, pool, db);
      }
    } catch (error) {
      console.error('Error processing pool registry:', error);
    }

    await db.close();
  }
}

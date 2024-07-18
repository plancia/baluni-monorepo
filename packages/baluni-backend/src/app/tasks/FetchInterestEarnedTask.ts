import { ConnectionManager } from '@homeofthings/nestjs-sqlite3';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Contract, ethers } from 'ethers';
// import { open } from "sqlite";
import { baluniVaultAbi, baluniVaultRegistryAbi } from 'baluni-contracts';
import { formatUnits } from 'ethers/lib/utils';
import { erc20Abi } from 'viem';
import { setupRegistry } from './setupRegistry';
// import { setupRegistry } from './setupRegistry';

@Injectable()
export class TasksService {
  provider: ethers.providers.JsonRpcProvider;
  signer: ethers.Wallet;
  registryCtx: Contract | null | undefined = null;

  constructor(private connectionManager: ConnectionManager) {
    this.provider = new ethers.providers.JsonRpcProvider(
      String(process.env.RPC_URL)
    );
    this.signer = new ethers.Wallet(
      String(process.env.PRIVATE_KEY),
      this.provider
    );
  }
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_5_SECONDS)
  handleCron() {
    console.log('ciao');
    this.logger.debug('Called when the current second is 45');
    this.fetchInterestEarned();
  }

  async fetchInterestEarned() {
    this.registryCtx = await setupRegistry(this.provider, this.signer);

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

import { Module } from '@nestjs/common';

import {
  Sqlite3ConnectionOptions,
  Sqlite3Module,
} from '@homeofthings/nestjs-sqlite3';
import { ScheduleModule } from '@nestjs/schedule';
import { ethers } from 'ethers';
import path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DcaRepository } from './repositories/dca.repository';
import { InterestEarnedRepository } from './repositories/interest-earned.repository';
import { PoolRebalanceRepository } from './repositories/pool-rebalance-repository';
import { ReinverstEarningsRespository } from './repositories/reinvest-earnings.repository';
import { StatsRepository } from './repositories/stats.repository';
import { TotalValuationRepository } from './repositories/total-valuation-repository';
import { UnitPriceRepository } from './repositories/unit-price-repository';
import { RecurringTasksService } from './tasks/RecurringTasks';
import { DeleteAllRecordsRepository } from './repositories/delete-old-records.repository';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    Sqlite3Module.registerAsync({
      imports: [], // optional
      useFactory: (): Promise<Sqlite3ConnectionOptions> => {
        return Promise.resolve({
          file: path.join(__dirname, 'assets/baluniData.db'),
        });
      },
      inject: [], // optional inject params for useFactory method
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: 'rpcProvider',
      useFactory: async () => {
        const provider = new ethers.providers.JsonRpcProvider(
          String(process.env.RPC_URL)
        );
        return provider;
      },
    },
    {
      provide: 'wallet',
      useFactory: async (rpcProvider: ethers.providers.JsonRpcProvider) => {
        const wallet = new ethers.Wallet(
          String(process.env.PRIVATE_KEY),
          rpcProvider
        );
        return wallet;
      },
      inject: ['rpcProvider'],
    },
    AppService,
    StatsRepository,
    RecurringTasksService,
    InterestEarnedRepository,
    PoolRebalanceRepository,
    ReinverstEarningsRespository,
    TotalValuationRepository,
    UnitPriceRepository,
    DcaRepository,
    DeleteAllRecordsRepository
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';

import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import {
  Sqlite3ConnectionOptions,
  Sqlite3Module,
} from '@homeofthings/nestjs-sqlite3';
import { ScheduleModule } from '@nestjs/schedule';
import { ethers } from 'ethers';
import path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StatsRepository } from './repositories/stats.repository';
import { DcaTask } from './tasks/impl/dca.task';
import { DeleteAllRecordsTask } from './tasks/impl/delete-old-records.task';
import { HyperPoolsTask } from './tasks/impl/hyper-pools.task';
import { InterestEarnedTask } from './tasks/impl/interest-earned.task';
import { PoolRebalanceTask } from './tasks/impl/pool-rebalance.task';
import { ReinverstEarningsTask } from './tasks/impl/reinvest-earnings.task';
import { TotalValuationTask } from './tasks/impl/total-valuation.task';
import { UnitPriceTask } from './tasks/impl/unit-price.task';
import { RecurringTasksService } from './tasks/RecurringTasksService';

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
    {
      provide: 'gql',
      useFactory: async () => {
        const UNISWAP_GRAPHQL_ENDPOINT = process.env.UNISWAP_GRAPHQL_ENDPOINT;
        const client = new ApolloClient({
          uri: UNISWAP_GRAPHQL_ENDPOINT,
          cache: new InMemoryCache(),
        });
        return client;
      },
    },
    AppService,
    StatsRepository,
    RecurringTasksService,
    InterestEarnedTask,
    PoolRebalanceTask,
    ReinverstEarningsTask,
    TotalValuationTask,
    UnitPriceTask,
    DcaTask,
    DeleteAllRecordsTask,
    HyperPoolsTask,
  ],
})
export class AppModule {}

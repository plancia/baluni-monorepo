import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  Sqlite3ConnectionOptions,
  Sqlite3Module,
} from '@homeofthings/nestjs-sqlite3';
import path from 'path';
import { fsync } from 'fs';
import fs from 'fs';
import { StatsRepository } from './repository/stats.repository';
import { ScheduleModule } from '@nestjs/schedule';

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
  providers: [AppService, StatsRepository],
})
export class AppModule {}

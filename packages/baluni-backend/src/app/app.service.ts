import { ConnectionManager } from '@homeofthings/nestjs-sqlite3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { StatsRepository } from './repositories/stats.repository';

@Injectable()
export class AppService {
  constructor(
    private connectionManager: ConnectionManager,
    private statsRepository: StatsRepository,
  ) {}

  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  async getHyperPoolsData() {
    try {
      const db = await this.connectionManager.getConnectionPool().get();

      const hyperpoolsData = await db.all('SELECT * FROM hyperPoolsData');
      return hyperpoolsData;
    } catch (error) {
      throw new BadRequestException('Failed to fetch hyper pools data');
    }
  }

  async getValuationData() {
    try {
      const db = await this.connectionManager.getConnectionPool().get();

      const valuations = await db.all('SELECT * FROM totalValuations');
      return valuations;
    } catch (error) {
      throw new BadRequestException('Failed to fetch valuation data');
    }
  }

  async getTotalInterestEarnedData() {
    try {
      const db = await this.connectionManager.getConnectionPool().get();

      const results = await db.all('SELECT * FROM totalInterestEarned');
      return results;
    } catch (error) {
      throw new BadRequestException('Failed to fetch total interest data');
    }
  }

  async getUnitPricesData() {
    try {
      const db = await this.connectionManager.getConnectionPool().get();

      const results = await db.all('SELECT * FROM unitPrices');
      return results;
    } catch (error) {
      throw new BadRequestException('Failed to fetch unit prices data');
    }
  }

  async getStatistics() {
    try {
      const statistics = await this.statsRepository.calculateStatistics();
      return statistics;
    } catch (error) {
      throw new BadRequestException('Failed to fetch statistics data');
    }
  }
}

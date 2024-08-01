import { ConnectionManager } from '@homeofthings/nestjs-sqlite3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { StatsRepository } from './repositories/stats.repository';
import { ExternalRepository } from './repositories/external.repository';

@Injectable()
export class AppService {
  constructor(
    private connectionManager: ConnectionManager,
    private statsRepository: StatsRepository,
    private externalRepository: ExternalRepository
  ) {}

  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  async getUniswapTokens(chainId: number) {
    try {
      const tokens = await this.externalRepository.getUniswapTokens(chainId);
      return tokens;
    } catch {
      throw new BadRequestException('Failed to fetch statistics data');
    }
  }

  async getUniswapToken(chainId: number, symbol: string) {
    try {
      const token = await this.externalRepository.getUniswapToken(
        chainId,
        symbol
      );
      return token;
    } catch {
      throw new BadRequestException('Failed to fetch statistics data');
    }
  }

  async getYearnVaults(chainId: number) {
    try {
      const vaults = await this.externalRepository.getYearnVaults(chainId);
      return vaults;
    } catch {
      throw new BadRequestException('Failed to fetch statistics data');
    }
  }

  async getYearnVault(
    chainId: number,
    symbol: string,
    strategyType: string,
    boosted: string
  ) {
    try {
      const data = { chainId, symbol, strategyType, boosted };
      const vault = await this.externalRepository.getYearnVault(
        data.chainId,
        data.symbol,
        data.strategyType,
        data.boosted
      );
      return vault;
    } catch {
      throw new BadRequestException('Failed to fetch statistics data');
    }
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

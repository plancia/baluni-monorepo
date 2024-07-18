import { ConnectionManager } from '@homeofthings/nestjs-sqlite3';
import { Injectable } from '@nestjs/common';
import { formatISO, subDays } from 'date-fns';
@Injectable()
export class StatsRepository {
  constructor(private connectionManager: ConnectionManager) {}

  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  calculatePercentageChange(oldValue: number, newValue: number) {
    return ((newValue - oldValue) / oldValue) * 100;
  }

  async getChangeForPeriod(
    tableName: string,
    dateField: string,
    valueField: string,
    address: string,
    days: number
  ) {
    const db = await this.connectionManager.getConnectionPool().get();

    const now = new Date();
    const pastDate = subDays(now, days);

    const latestData = await db.get(
      `SELECT ${valueField} FROM ${tableName} WHERE address = ? ORDER BY ${dateField} DESC LIMIT 1`,
      address
    );
    const pastData = await db.get(
      `SELECT ${valueField} FROM ${tableName} WHERE address = ? AND ${dateField} <= ? ORDER BY ${dateField} DESC LIMIT 1`,
      [address, formatISO(pastDate)]
    );

    await db.close();

    if (!latestData || !pastData) {
      throw new Error('Insufficient data to calculate percentage change');
    }

    return this.calculatePercentageChange(
      parseFloat(pastData[valueField]),
      parseFloat(latestData[valueField])
    );
  }

  async calculateStatistics() {
    // const db = await open({ filename: dbPath, driver: sqlite3.Database });
    const db = await this.connectionManager.getConnectionPool().get();
    try {
      const addresses = await db.all('SELECT DISTINCT address FROM unitPrices');
      const results = [];

      for (const { address } of addresses) {
        const dailyUnitPriceChange = await this.getChangeForPeriod(
          'unitPrices',
          'timestamp',
          'unitPrice',
          address,
          1
        );
        const dailyValuationChange = await this.getChangeForPeriod(
          'totalValuations',
          'timestamp',
          'totalValuation',
          address,
          1
        );

        results.push({
          address,
          unitPrice: { daily: dailyUnitPriceChange },
          valuation: { daily: dailyValuationChange },
        });
      }

      return results;
    } catch (error) {
      console.error('Error calculating statistics:', error);
      throw error;
    } finally {
      await db.close();
    }
  }
}

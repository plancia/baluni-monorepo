import { ConnectionManager } from '@homeofthings/nestjs-sqlite3';
import { Injectable } from '@nestjs/common';
import { BaseTask } from './base.task';

@Injectable()
export class DeleteAllRecordsTask extends BaseTask {
  constructor(private connectionManager: ConnectionManager) {
    super();
  }

  async execute() {
    try {
      const db = await this.connectionManager.getConnectionPool().get();

      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const timestampLimit = threeDaysAgo.toISOString();

      await db.run(
        'DELETE FROM totalValuations WHERE timestamp < ?',
        timestampLimit
      );
      await db.run(
        'DELETE FROM totalInterestEarned WHERE timestamp < ?',
        timestampLimit
      );
      await db.run(
        'DELETE FROM unitPrices WHERE timestamp < ?',
        timestampLimit
      );
      await db.run(
        'DELETE FROM hyperPoolsData WHERE timestamp < ?',
        timestampLimit
      );

      console.log('Old records deleted successfully');
    } catch (error) {
      console.error('Failed to delete old records:', error);
    }
  }
}

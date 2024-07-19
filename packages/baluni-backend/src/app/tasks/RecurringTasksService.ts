import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Contract } from 'ethers';
import { InterestEarnedTask } from './impl/interest-earned.task';
import { UnitPriceTask } from './impl/unit-price.task';
import { TotalValuationTask } from './impl/total-valuation.task';
import { DcaTask } from './impl/dca.task';
import { PoolRebalanceTask } from './impl/pool-rebalance.task';
import { ReinverstEarningsTask } from './impl/reinvest-earnings.task';
import { HyperPoolsTask } from './impl/hyper-pools.task';
import { DeleteAllRecordsTask } from './impl/delete-old-records.task';

@Injectable()
export class RecurringTasksService {
  registryCtx: Contract | null | undefined = null;

  constructor(
    private interestEarnedTask: InterestEarnedTask,
    private poolRebalanceTask: PoolRebalanceTask,
    private reinverstEarningsTask: ReinverstEarningsTask,
    private totalValuationTask: TotalValuationTask,
    private unitPriceTask: UnitPriceTask,
    private dcaTask: DcaTask,
    private deleteRecordsTask: DeleteAllRecordsTask,
    private hyperPoolsTask: HyperPoolsTask
  ) {}
  private readonly logger = new Logger(RecurringTasksService.name);

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    this.logger.debug('Called when the current second is 45');
    try {
      await this.unitPriceTask.execute();
    } catch (err) {
      this.logger.error('Error fetching unit prices:', err);
    }

    try {
      await this.totalValuationTask.execute();
    } catch (err) {
      this.logger.error('Error fetching total valuation:', err);
    }

    try {
      await this.interestEarnedTask.execute();
    } catch (err) {
      this.logger.error('Error fetching interest earned:', err);
    }

    try {
      await this.dcaTask.execute();
    } catch (err) {
      this.logger.error('Error executing DCA:', err);
    }

    try {
      await this.reinverstEarningsTask.execute();
    } catch (err) {
      this.logger.error('Error reinvesting earnings:', err);
    }

    try {
      await this.poolRebalanceTask.execute();
    } catch (err) {
      this.logger.error('Error rebalancing pools:', err);
    }

    try {
      await this.hyperPoolsTask.execute();
    } catch (err) {
      this.logger.error('Error fetching hyper pools data:', err);
    }

    try {
      await this.deleteRecordsTask.execute();
    } catch (err) {
      this.logger.error('Error deleting old records:', err);
    }
  }
}

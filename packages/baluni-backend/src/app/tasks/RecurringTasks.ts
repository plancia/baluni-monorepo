import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Contract } from 'ethers';
import { InterestEarnedRepository } from '../repositories/interest-earned.repository';
import { UnitPriceRepository } from '../repositories/unit-price-repository';
import { TotalValuationRepository } from '../repositories/total-valuation-repository';
import { DcaRepository } from '../repositories/dca.repository';
import { PoolRebalanceRepository } from '../repositories/pool-rebalance-repository';
import { ReinverstEarningsRespository } from '../repositories/reinvest-earnings.repository';
import { HyperPoolsRepository } from '../repositories/hyper-pools.repository';
import { DeleteAllRecordsRepository } from '../repositories/delete-old-records.repository';

@Injectable()
export class RecurringTasksService {
  registryCtx: Contract | null | undefined = null;

  constructor(
    private interestEarnedRepository: InterestEarnedRepository,
    private poolRebalanceRepository: PoolRebalanceRepository,
    private reinverstEarningsRespository: ReinverstEarningsRespository,
    private totalValuationRepository: TotalValuationRepository,
    private unitPriceRepository: UnitPriceRepository,
    private dcaRepository: DcaRepository,
    private deleteRecordsRepository: DeleteAllRecordsRepository,
    private hyperPoolsRepository: HyperPoolsRepository
  ) {}
  private readonly logger = new Logger(RecurringTasksService.name);

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    this.logger.debug('Called when the current second is 45');
    try {
      await this.unitPriceRepository.fetchUnitPrices();
    } catch (err) {
      this.logger.error('Error fetching unit prices:', err);
    }

    try {
      await this.totalValuationRepository.fetchTotalValuation();
    } catch (err) {
      this.logger.error('Error fetching total valuation:', err);
    }

    try {
      await this.interestEarnedRepository.fetchInterestEarned();
    } catch (err) {
      this.logger.error('Error fetching interest earned:', err);
    }

    try {
      await this.dcaRepository.dcaExecutor();
    } catch (err) {
      this.logger.error('Error executing DCA:', err);
    }

    try {
      await this.reinverstEarningsRespository.reinvestEarnings();
    } catch (err) {
      this.logger.error('Error reinvesting earnings:', err);
    }

    try {
      await this.poolRebalanceRepository.rebalancePools();
    } catch (err) {
      this.logger.error('Error rebalancing pools:', err);
    }

    try {
      await this.hyperPoolsRepository.fetchHyperPools();
    } catch (err) {
      this.logger.error('Error fetching hyper pools data:', err);
    }

    try {
      await this.deleteRecordsRepository.deleteOldRecords();
    } catch (err) {
      this.logger.error('Error deleting old records:', err);
    }
  }
}

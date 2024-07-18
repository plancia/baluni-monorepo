import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('hyperpools-data')
  getHyperPoolsData() {
    return this.appService.getHyperPoolsData();
  }

  @Get('valuation-data')
  getValuationData() {
    return this.appService.getValuationData();
  }

  @Get('totalInterestEarned-data')
  getTotalInterestEarnedData() {
    return this.appService.getTotalInterestEarnedData();
  }

  @Get('unitPrices-data')
  getUnitPricesData() {
    return this.appService.getUnitPricesData();
  }

  @Get('statistics')
  getStatistics() {
    return this.appService.getStatistics();
  }
}

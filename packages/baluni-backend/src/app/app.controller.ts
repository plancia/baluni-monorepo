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

  @Get('uniswap-token')
  getUniswapToken(chainId: number, symbol: string) {
    return this.appService.getUniswapToken(chainId, symbol);
  }

  @Get('uniswap-tokens')
  getUniswapTokens(chainId: number) {
    return this.appService.getUniswapTokens(chainId);
  }

  @Get('yearn-vault')
  getYearnVault(
    chainId: number,
    symbol: string,
    strategyType?: string,
    boosted?: string
  ) {
    return this.appService.getYearnVault(
      chainId,
      symbol,
      strategyType,
      boosted
    );
  }

  @Get('yearn-vaults')
  getYearnVaults(chainId: number) {
    return this.appService.getYearnVaults(chainId);
  }
}

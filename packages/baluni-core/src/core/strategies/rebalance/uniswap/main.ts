import { initializeWallet } from '../../../utils/web3/dexWallet';
import { rebalancePortfolio } from './execute';
import { predict } from '../../../features/ml/predict';
import { welcomeMessage } from '../../../welcome';
import { formatConfig } from '../../../utils/formatConfig';
import * as blocks from '../../../utils/logBlocks';
import { TConfigReturn } from '../../../types/config';
import * as _config from './config.json';
import { NETWORKS, USDC } from '../../../../api/constants';
import { checkWeightsSum } from '../../../utils/checkWeights';
import { getTokenAddressUniV3 } from '../../../utils';

interface LinearRegressionResult {
  predicted: number;
  actual: number;
}

export async function executeRebalance(
  config: TConfigReturn,
  log: boolean,
  pk?: string
) {
  blocks.print1starry();
  console.log('Checking portfolio');
  const dexWallet = await initializeWallet(
    NETWORKS[config?.SELECTED_CHAINID],
    pk
  );
  let selectedWeights = config?.WEIGHTS_UP;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { kstCross, getDetachSourceFromOHLCV } = require('trading-indicator');

  let kstResult;

  if (config?.TREND_FOLLOWING) {
    const { input } = await getDetachSourceFromOHLCV(
      'binance',
      'BTC/USDT',
      config?.KST_TIMEFRAME,
      false
    );
    kstResult = await kstCross(input, 10, 15, 20, 30, 10, 10, 10, 15, 9);
    console.log('KST:', await kstResult.direction, await kstResult.cross);
  }

  let signalAI = 'none';

  if (config?.PREDICTION) {
    const linearRegression: LinearRegressionResult = (await predict(
      config?.PREDICTION_ALGO,
      config?.PREDICTION_SYMBOL,
      config?.PREDICTION_PERIOD,
      config?.PREDICTION_EPOCHS
    )) as LinearRegressionResult;
    if (linearRegression.predicted > linearRegression.actual) {
      signalAI = 'up';
    } else if (linearRegression.predicted < linearRegression.actual) {
      signalAI = 'down';
    }
  }
  console.log(
    '🤖 Signal AI:',
    config?.PREDICTION ? signalAI : 'None',
    '📈 KST trend:',
    config?.TREND_FOLLOWING ? kstResult.direction : 'None',
    '❎ KST cross:',
    config?.TREND_FOLLOWING ? kstResult.cross : 'None'
  );
  let TREND: boolean = true;
  let LAST_TREND: boolean = true;

  if (config?.TREND_FOLLOWING && signalAI !== 'none') {
    if (kstResult.direction === 'up' && signalAI === 'up' && kstResult.cross) {
      TREND = true;
      LAST_TREND = true;
    } else if (
      kstResult.direction === 'down' &&
      signalAI === 'down' &&
      kstResult.cross
    ) {
      TREND = false;
      LAST_TREND = false;
    } else if (kstResult.direction === 'none' && !kstResult.cross) {
      TREND = LAST_TREND;
    }
  } else if (config?.TREND_FOLLOWING && signalAI == 'none') {
    if (kstResult.direction === 'up' && kstResult.cross) {
      TREND = true;
      LAST_TREND = true;
    } else if (kstResult.direction === 'down' && kstResult.cross) {
      TREND = false;
      LAST_TREND = false;
    } else if (kstResult.direction === 'none' && !kstResult.cross) {
      TREND = LAST_TREND;
    }
  } else if (!config?.TREND_FOLLOWING && signalAI == 'none') {
    TREND = true;
    LAST_TREND = true;
  }

  const tokenAddressList: string[] = [];

  await Promise.all(
    config?.TOKENS.map(async (token) => {
      const tokenAddress = await getTokenAddressUniV3(
        token,
        config?.SELECTED_CHAINID
      );
      if (!tokenAddress) {
        console.error(`Token address not found for ${token}`);
        return;
      }
      tokenAddressList.push(tokenAddress);
    })
  );

  console.log('🔭 Trend:', TREND);
  if (TREND) {
    selectedWeights = config?.WEIGHTS_UP;
    console.log('🦄 Selected weights:', JSON.stringify(selectedWeights));
    const isWeightSumCorrect = checkWeightsSum(selectedWeights);

    if (!isWeightSumCorrect) return console.error('Weight Sum is not 10000');
    await rebalancePortfolio(
      dexWallet,
      tokenAddressList,
      selectedWeights,
      USDC[config?.SELECTED_CHAINID],
      config
    );
  } else if (!TREND) {
    selectedWeights = config?.WEIGHTS_DOWN;
    console.log('🦄 Selected weights:', JSON.stringify(selectedWeights));
    const isWeightSumCorrect = checkWeightsSum(selectedWeights);

    if (!isWeightSumCorrect) return console.error('Weight Sum is not 10000');

    await rebalancePortfolio(
      dexWallet,
      tokenAddressList,
      selectedWeights,
      USDC[config?.SELECTED_CHAINID],
      config
    );
  }

  if (!log) return;

  blocks.print1starry();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fs = require('fs');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const path = require('path');
  const date = new Date();
  const kstResultPath = path.join(__dirname, 'kstResult.json');
  let results = [];

  if (fs.existsSync(kstResultPath)) {
    const data = fs.readFileSync(kstResultPath, 'utf-8');
    try {
      results = JSON.parse(data);
    } catch (error) {
      console.error(`Error parsing JSON from ${kstResultPath}:`, error);
    }
  }
  const newResult = {
    KST: kstResult,
    AI: signalAI,
    selectedWeights: selectedWeights,
    time: date,
  };
  results.push(newResult);
  fs.writeFileSync(kstResultPath, JSON.stringify(results), 'utf-8');
}

async function main() {
  welcomeMessage();
  const config: TConfigReturn = await formatConfig(_config);
  await executeRebalance(config, true);
  try {
    setInterval(async () => {
      try {
        await executeRebalance(config, true);
      } catch (error) {
        console.error('Error during rebalancing:', error);
      }
    }, config.INTERVAL ?? 1000); // Add nullish coalescing operator to provide a default value
  } catch (error) {
    console.error('Error during initialization:', error);
  }
}

// main().catch(error => {
//   console.error('An error occurred:', error)
// })

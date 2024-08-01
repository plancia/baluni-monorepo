import { ethers, BigNumber } from 'ethers';
import { DexWallet, initializeWallet } from '../../../utils/web3/dexWallet';
import { NETWORKS, NATIVETOKENS, ORACLE, Builder } from '../../../../api';
import { getTokenMetadata } from '../../../utils/getTokenMetadata';
import { getTokenBalance } from '../../../utils/getTokenBalance';
import { OffChainOracleAbi } from '../../../../api';
import * as config from './config.json';
import { Token } from '@uniswap/sdk-core';
import { SwapTokenLogic } from 'packages/baluni-core/src/api/logics/uniswap';

// 🏦 This script executes a Dollar Cost Averaging (DCA) strategy
// based on price variations. It swaps a percentage of your balance
// from the native token of the selected chain to the selected token address.
// The percentage is determined based on price movements.

let transactionHistory: { buyPrice: number; amount: BigNumber }[] = [];
let startPrice: number | null = null;
let lastPriceStep: number | null = null;

const priceThresholdPercentage = 0.01; // Define the percentage threshold (e.g., 1%)

export const getInitialPrice = async () => {
  const dexWallet = await initializeWallet(
    String(NETWORKS[config.SELECTED_CHAINID])
  );
  const offChainOracleAddress =
    ORACLE[config.SELECTED_CHAINID]['1inch-spot-agg'].OFFCHAINORACLE;

  const offchainOracle = new ethers.Contract(
    offChainOracleAddress,
    OffChainOracleAbi,
    dexWallet.walletProvider
  );
  const fromTokenMetadata = await getTokenMetadata(
    config?.FROMADDRESS,
    dexWallet.walletProvider
  );
  const fromTokenDecimal = fromTokenMetadata.decimals;
  const toTokenMetadata = await getTokenMetadata(
    config.TOADDRESS,
    dexWallet.walletProvider
  );
  const toTokenDecimal = toTokenMetadata.decimals;
  const ETHdata = await offchainOracle
    .getRate(config?.FROMADDRESS, config.TOADDRESS, true)
    .then((rate: string) => {
      const numerator = 10 ** fromTokenDecimal;
      const denominator = 10 ** toTokenDecimal;
      const price = (parseFloat(rate) * numerator) / denominator / 1e18;
      return (1 / price).toString();
    })
    .catch(console.log);

  return parseFloat(ETHdata);
};

// 📈 Function to execute the DCA strategy
export const initializeDCA = async () => {
  const dexWallet = await initializeWallet(
    String(NETWORKS[config.SELECTED_CHAINID])
  );
  const offChainOracleAddress =
    ORACLE[config.SELECTED_CHAINID]['1inch-spot-agg'].OFFCHAINORACLE;

  const offchainOracle = new ethers.Contract(
    offChainOracleAddress,
    OffChainOracleAbi,
    dexWallet.walletProvider
  );
  const fromAddress = NATIVETOKENS[config?.SELECTED_CHAINID].WRAPPED;
  const fromTokenMetadata = await getTokenMetadata(
    fromAddress,
    dexWallet.walletProvider
  );
  const toTokenMetadata = await getTokenMetadata(
    config.TOADDRESS,
    dexWallet.walletProvider
  );
  const _tokenBalance = await getTokenBalance(
    dexWallet.walletProvider,
    dexWallet.walletAddress,
    fromAddress
  );

  return {
    dexWallet,
    offchainOracle,
    fromTokenMetadata,
    toTokenMetadata,
    _tokenBalance,
  };
};
export const calculateInvestment = (
  myBalance: { balance?: any; formatted: any },
  CurrentETHPrice: number,
  firstStep = 0,
  secondStep = 0,
  thirdStep = 0,
  forceInitialInvestment: boolean
) => {
  let amountIn: Number;
  if (forceInitialInvestment) {
    amountIn = Number(myBalance.formatted) / 20;
    console.log(`📊 Initial Step: Investing ${amountIn} `);
    forceInitialInvestment = false;
  } else if (CurrentETHPrice >= secondStep && CurrentETHPrice <= firstStep) {
    if (lastPriceStep !== firstStep) {
      amountIn = Number(myBalance.formatted) / 20;
      lastPriceStep = firstStep;
      console.log(`📊 First Step: Investing ${amountIn} `);
    } else {
      amountIn = 0;
    }
  } else if (CurrentETHPrice >= thirdStep && CurrentETHPrice <= secondStep) {
    if (lastPriceStep !== secondStep) {
      amountIn = Number(myBalance.formatted) / 10;
      lastPriceStep = secondStep;
      console.log(`📊 Second Step: Investing ${amountIn} `);
    } else {
      amountIn = 0;
    }
  } else if (CurrentETHPrice < thirdStep) {
    if (lastPriceStep !== thirdStep) {
      amountIn = Number(myBalance.formatted) / 5;
      lastPriceStep = thirdStep;
      console.log(`📊 Third Step: Investing ${amountIn} `);
    } else {
      amountIn = 0;
    }
  } else {
    amountIn = 0;
  }

  return amountIn;
};

export const executeSwapAndRecordTransaction = async (
  amountIn: number | Number,
  dexWallet: DexWallet,
  fromTokenMetadata: Token,
  toTokenMetadata: Token,
  CurrentETHPrice: number
) => {
  await checkAndSellIfProfitable();

  if (amountIn === 0) {
    console.log('🚫 No action required, skipping...');
    return;
  }

  console.log(
    `💱 Executing swap: ${amountIn} ${fromTokenMetadata.symbol} to ${toTokenMetadata.symbol} at price ${CurrentETHPrice}`
  );

  const builder = new Builder(dexWallet.wallet);
  await builder.setup();

  const swapLogic = new SwapTokenLogic(dexWallet.wallet);
  await swapLogic.setup(config.SELECTED_CHAINID);

  const swaplogicData = await swapLogic.build(dexWallet.walletAddress, [
    {
      address: dexWallet.walletAddress,
      token0: fromTokenMetadata.address!,
      token1: toTokenMetadata.address!,
      chainId: String(config.SELECTED_CHAINID),
      amount: BigInt(String(amountIn)),
      slippage: config.SLIPPAGE,
    },
  ]);

  const builderData = await builder.buildTransaction(
    swaplogicData.approvals,
    swaplogicData.calldatas,
    swaplogicData.tokens_return
  );

  for (let i = 0; i < builderData.txs.length; i++) {
    const simulate = await dexWallet.wallet.call(builderData.txs[i]);

    if (!simulate) {
      throw new Error('::API::TRANSACTION_FAILED');
    }

    const tx = await dexWallet.wallet.sendTransaction(builderData.txs[i]);

    const broadcaster = await dexWallet.walletProvider.waitForTransaction(
      tx.hash
    );

    console.log('Transaction Result: ', broadcaster);
  }

  transactionHistory.push({
    buyPrice: CurrentETHPrice,
    amount: ethers.utils.parseUnits(
      amountIn.toString(),
      fromTokenMetadata.decimals
    ), // Store as BigNumber
  });

  console.log(
    `📝 Transaction recorded: Bought at ${CurrentETHPrice}, Amount: ${amountIn}`
  );
};

export const executeDCA = async (forceInitialInvestment = false) => {
  const {
    dexWallet,
    offchainOracle,
    fromTokenMetadata,
    toTokenMetadata,
    _tokenBalance,
  } = await initializeDCA();
  const ETHdata = await offchainOracle
    .getRate(config?.FROMADDRESS, config.TOADDRESS, true)
    .then((rate: string) => {
      const numerator = 10 ** fromTokenMetadata.decimals;
      const denominator = 10 ** toTokenMetadata.decimals;
      const price = (parseFloat(rate) * numerator) / denominator / 1e18;
      return (1 / price).toString();
    })
    .catch(console.log);

  const CurrentETHPrice = parseFloat(ETHdata);
  const myBalance = _tokenBalance;
  const firstStep = startPrice! * 0.998;
  const secondStep = startPrice! * 0.95;
  const thirdStep = startPrice! * 0.9;

  console.log(`Current Price: ${CurrentETHPrice}, Start Price: ${startPrice}`);
  console.log(
    `Steps - First: ${firstStep}, Second: ${secondStep}, Third: ${thirdStep}`
  );

  const amountIn = calculateInvestment(
    myBalance,
    CurrentETHPrice,
    firstStep,
    secondStep,
    thirdStep,
    forceInitialInvestment
  );

  await executeSwapAndRecordTransaction(
    amountIn,
    dexWallet,
    fromTokenMetadata,
    toTokenMetadata,
    CurrentETHPrice
  );

  if (CurrentETHPrice > startPrice! * (1 + priceThresholdPercentage)) {
    startPrice = CurrentETHPrice;
    console.log(
      `🔄 Start price updated to ${startPrice} due to significant increase`
    );
  }
};

export const calculateProfit = async () => {
  const dexWallet = await initializeWallet(
    String(NETWORKS[config.SELECTED_CHAINID])
  );
  const offChainOracleAddress =
    ORACLE[config.SELECTED_CHAINID]['1inch-spot-agg'].OFFCHAINORACLE;

  const offchainOracle = new ethers.Contract(
    offChainOracleAddress,
    OffChainOracleAbi,
    dexWallet.walletProvider
  );
  const ETHdata = await offchainOracle
    .getRateToEth(config.TOADDRESS, true)
    .then((rate: string) => {
      const numerator = 10 ** 18;
      const denominator = 1e18;
      const price = (parseFloat(rate) * numerator) / denominator / 1e18;
      return (1 / price).toString();
    })
    .catch(console.log);

  const currentPrice = parseFloat(ETHdata);
  console.log(`Current ETH Price: ${currentPrice}`);

  let totalProfit = 0;
  transactionHistory.forEach((tx) => {
    const amountInEther = String(tx.amount);
    const profit =
      currentPrice * Number(amountInEther) -
      Number(ethers.utils.parseEther(String(tx.buyPrice))) *
        Number(amountInEther);
    totalProfit += profit;
    console.log(
      `Transaction: Buy Price: ${tx.buyPrice}, Amount:  ${tx.amount}, Current Price: ${currentPrice}, Profit: ${profit}`
    );
  });

  console.log(`💹 Calculated total profit: ${totalProfit}`);
  return totalProfit;
};

// 🔄 Function to check and sell if profitable
export const checkAndSellIfProfitable = async () => {
  const totalProfit = await calculateProfit();
  if (totalProfit > 0.001) {
    console.log('💹 Profit detected:', totalProfit, 'Executing sell...');
    const dexWallet = await initializeWallet(
      String(NETWORKS[config.SELECTED_CHAINID])
    );
    const _tokenBalance = await getTokenBalance(
      dexWallet.walletProvider,
      dexWallet.walletAddress,
      config.TOADDRESS
    );
    const toTokenMetadata = await getTokenMetadata(
      config.TOADDRESS,
      dexWallet.walletProvider
    );

    const fromTokenMetadata = await getTokenMetadata(
      NATIVETOKENS[config?.SELECTED_CHAINID].WRAPPED,
      dexWallet.walletProvider
    );

    const builder = new Builder(dexWallet.wallet);
    await builder.setup();

    const swapLogic = new SwapTokenLogic(dexWallet.wallet);
    await swapLogic.setup(config.SELECTED_CHAINID);

    const swaplogicData = await swapLogic.build(dexWallet.walletAddress, [
      {
        address: dexWallet.walletAddress,
        token0: fromTokenMetadata.address,
        token1: toTokenMetadata.address,
        chainId: String(config.SELECTED_CHAINID),
        amount: _tokenBalance.balance,
        slippage: config.SLIPPAGE,
      },
    ]);

    const builderData = await builder.buildTransaction(
      swaplogicData.approvals,
      swaplogicData.calldatas,
      swaplogicData.tokens_return
    );

    for (let i = 0; i < builderData.txs.length; i++) {
      const simulate = await dexWallet.wallet.call(builderData.txs[i]);

      if (!simulate) {
        throw new Error('::API::TRANSACTION_FAILED');
      }

      const tx = await dexWallet.wallet.sendTransaction(builderData.txs[i]);

      const broadcaster = await dexWallet.walletProvider.waitForTransaction(
        tx.hash
      );

      console.log('Transaction Result: ', broadcaster);
    }

    console.log(`🧹 Cleared transaction history after selling`);
    // 🧹 Clear the transaction history after selling
    transactionHistory = [];
    lastPriceStep = null; // Reset the last price step after selling
  }
};
async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const mainLoop = async () => {
  if (startPrice === null) {
    startPrice = await getInitialPrice();
    console.log('🔍 Initial price set to', startPrice);
    await executeDCA(true); // Perform an initial purchase
  }

  const shouldContinue = true;
  while (shouldContinue) {
    await executeDCA();
    console.log('⏳ Waiting for the next interval...');
    await sleep(60000); // ⏲️ Wait for 1 hour (3600000 milliseconds)
  }
};

// mainLoop();

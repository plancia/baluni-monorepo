import { BigNumber, Contract, ethers } from 'ethers';
import { DexWallet } from '../../../utils/web3/dexWallet';
import { formatEther, formatUnits } from 'ethers/lib/utils';
import { getTokenMetadata } from '../../../utils/getTokenMetadata';
import { getTokenBalance } from '../../../utils/getTokenBalance';
import { getTokenValue } from '../../../utils/getTokenValue';
import { getRSI } from '../../../features/ta/getRSI';
import { waitForTx } from '../../../utils/web3/networkUtils';
import registryAbi from 'baluni-contracts/artifacts/contracts/registry/BaluniV1Registry.sol/BaluniV1Registry.json';
import rebalancerAbi from 'baluni-contracts/artifacts/contracts/managers/BaluniV1Rebalancer.sol/BaluniV1Rebalancer.json';
import * as yearnVaultAbi from '../../../../api/abis/yearn/YearnVault.json';
import * as erc20Abi from '../../../../api/abis/common/ERC20.json';
import { TDeposit, TRedeem } from '../../../types/yearn';
import * as blocks from '../../../utils/logBlocks';
import { Builder, INFRA } from '../../../../api';
import { DepositTokenLogic } from '../../../../api/logics/yearn/logic.deposit-token';
import { RedeemTokenLogic } from '../../../../api/logics/yearn/logic.redeem-token';
import { VaultStats } from '../../../../api/logics/yearn/logic.vault-stats';
import {
  SwapTokenLogic,
  Tswap,
} from '../../../../api/logics/uniswap/logic.swap-tokens';

export async function getTokenValueEnhanced(
  tokenSymbol: string,
  token: string,
  maxRedeem: BigNumber,
  decimals: number,
  usdcAddress: string,
  chainId?: string
) {
  console.log('🔴 Yearn Vallt Calculation');
  return tokenSymbol === 'USDC.E' || tokenSymbol === 'USDC'
    ? maxRedeem.mul(1e12)
    : await getTokenValue(
        tokenSymbol,
        token,
        maxRedeem,
        decimals,
        usdcAddress,
        chainId!
      );
}

export async function rebalancePortfolio(
  dexWallet: DexWallet,
  desiredTokens: string[],
  desiredAllocations: { [token: string]: number },
  usdcAddress: string,
  config: any
) {
  blocks.print2block();
  console.log('⚖️  Rebalance Portfolio\n');

  const builder = new Builder(dexWallet.wallet);
  await builder.setup();

  const chainId = dexWallet.walletProvider.network.chainId;
  const tokenValues: { [token: string]: BigNumber } = {};
  let totalPortfolioValue = BigNumber.from(0);

  console.log(
    `🏦 Total Portfolio Value (in USDT) at Start: ${String(
      formatEther(totalPortfolioValue)
    )}`
  );

  const swapsSell: Tswap[] = [];
  const swapsBuy: Tswap[] = [];

  // Calculate Total Portfolio Value
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  blocks.print1block();

  console.log('📊 Calculate Total Portfolio Value');

  for (const token of desiredTokens) {
    const tokenContract = new ethers.Contract(
      token,
      erc20Abi,
      dexWallet.wallet
    );
    const tokenMetadata = await getTokenMetadata(
      token,
      dexWallet.walletProvider
    );

    const _tokenbalance = await getTokenBalance(
      dexWallet.walletProvider,
      dexWallet.walletAddress,
      token
    );
    const tokenBalance = _tokenbalance.balance;
    const decimals = tokenMetadata.decimals;
    const tokenSymbol = await tokenContract?.symbol();
    const yearnVaultAddress = config?.YEARN_VAULTS[tokenSymbol];
    const currentValue = await getTokenValue(
      tokenSymbol,
      token,
      tokenBalance,
      decimals,
      config?.USDC,
      String(chainId)
    );

    if (yearnVaultAddress !== undefined) {
      const yearnContract = new ethers.Contract(
        yearnVaultAddress,
        yearnVaultAbi,
        dexWallet.wallet
      );

      const yearnBalance = await yearnContract?.balanceOf(
        dexWallet.walletAddress
      );
      const maxRedeem = await yearnContract?.previewRedeem(yearnBalance);
      const tokenValueYearn = await getTokenValueEnhanced(
        tokenSymbol,
        token,
        maxRedeem,
        decimals,
        usdcAddress,
        String(chainId)!
      );

      tokenValues[token] = currentValue.add(tokenValueYearn);
      totalPortfolioValue = totalPortfolioValue.add(tokenValues[token]);
    } else {
      tokenValues[token] = currentValue;
      totalPortfolioValue = totalPortfolioValue.add(currentValue);
    }
  }

  console.log(
    `🏦 Total Portfolio Value (in USDT): ", ${String(
      formatEther(totalPortfolioValue)
    )}`
  );

  const currentAllocations: { [token: string]: number } = {};
  const tokensToSell = [];
  const tokensToBuy: any[] = [];

  Object.keys(tokenValues).forEach((token) => {
    currentAllocations[token] = tokenValues[token]
      .mul(10000)
      .div(totalPortfolioValue)
      .toNumber(); // Store as percentage
  });

  // Rebalance
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  blocks.print1block();

  console.log('📊 Rebalance Portfolio');
  const amountAllocaton = Object.values(desiredAllocations);

  const registerAddress =
    INFRA[dexWallet.walletProvider.network.chainId].REGISTRY;
  const registryCtx = new Contract(
    registerAddress,
    registryAbi.abi,
    dexWallet.wallet
  );
  const baluniRebalancer = await registryCtx.baluniRebalancer();

  const rebalancerCtx = new Contract(
    baluniRebalancer,
    rebalancerAbi.abi,
    dexWallet.wallet
  );

  const rebalanceData = await rebalancerCtx.checkRebalance(
    [],
    desiredTokens,
    amountAllocaton,
    500,
    dexWallet.walletAddress,
    await registryCtx.USDC()
  );

  for (let i = 0; i < rebalanceData.overweightVaults.length; i++) {
    tokensToSell.push({
      token: desiredTokens[Number(rebalanceData.overweightVaults[i])],
      amount: rebalanceData.overweightAmounts[i],
    });
  }

  for (const token of desiredTokens) {
    const currentAllocation = currentAllocations[token];
    const desiredAllocation = desiredAllocations[token];
    const difference = desiredAllocation - currentAllocation;
    const tokenMetadata = await getTokenMetadata(
      token,
      dexWallet.walletProvider
    );

    const tokenDecimals = tokenMetadata.decimals;
    const _tokenBalance = await getTokenBalance(
      dexWallet.walletProvider,
      dexWallet.walletAddress,
      token
    );
    const tokenSymbol: string = tokenMetadata.symbol as string;
    const yearnVaultAddress = config?.YEARN_VAULTS[tokenSymbol];
    let tokenBalance = _tokenBalance.balance;

    if (yearnVaultAddress !== undefined) {
      const yearnContract = new ethers.Contract(
        yearnVaultAddress,
        yearnVaultAbi,
        dexWallet.wallet
      );
      const yearnBalance = await yearnContract?.balanceOf(
        dexWallet.walletAddress
      );
      const redeemAmount = await yearnContract?.previewRedeem(yearnBalance);
      tokenBalance = tokenBalance.add(redeemAmount);
    }

    const valueToRebalance = totalPortfolioValue
      .mul(BigNumber.from(Math.abs(difference)))
      .div(10000);

    const formattedBalance = formatUnits(tokenBalance, tokenDecimals);

    console.group(`🪙  Token: ${token}`);
    console.log(`📊 Current Allocation: ${currentAllocation}%`);
    console.log(`💰 Difference: ${difference}%`);
    console.log(`💲 Value (USD): ${formatEther(tokenValues[token])}`);
    console.log(
      `⚖️  Value to Rebalance (USD): ${formatEther(valueToRebalance)}`
    );
    console.log(`👛 Balance: ${formattedBalance} ${tokenSymbol}`);
    console.groupEnd();

    // if (difference < 0 && Math.abs(difference) > config?.LIMIT) {
    //   const tokenMetadata = await getTokenMetadata(
    //     token,
    //     dexWallet?.walletProvider
    //   );

    //   const decimals = tokenMetadata.decimals;
    //   const _token = {
    //     address: token,
    //     decimals: decimals,
    //   };
    //   const tokenPriceInUSDT: number = await fetchPrices(
    //     _token,
    //     String(chainId)
    //   ); // Ensure this returns a value
    //   const pricePerToken = ethers.utils.parseUnits(
    //     tokenPriceInUSDT!.toString(),
    //     'ether'
    //   );
    //   const tokenAmountToSell = valueToRebalance
    //     .mul(BigNumber.from(10).pow(decimals))
    //     .div(pricePerToken);

    //   if (token === usdcAddress) {
    //     console.log('SKIP USDC SELL');
    //     break;
    //   }

    //   tokensToSell.push({ token, amount: tokenAmountToSell });
    // } else if (difference > 0 && Math.abs(difference) > config?.LIMIT) {
    //   if (token === usdcAddress) {
    //     console.log('SKIP USDC SELL');
    //     break;
    //   }

    //   tokensToBuy.push({ token, amount: valueToRebalance.div(1e12) });
    // }

    blocks.printline();
  }

  // Sell Tokens
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  blocks.print1block();
  console.log('🔄 Sell Tokens');

  const yearnRedeems = [];

  for (const { token, amount: amountWei } of tokensToSell) {
    try {
      const tokenContract = new Contract(token, erc20Abi, dexWallet.wallet);
      const tokenSymbol = await tokenContract.symbol();
      const tokenDecimal = await tokenContract.decimals();
      const vault = config?.YEARN_VAULTS[tokenSymbol];
      console.log(
        `🔴 Selling ${formatUnits(
          amountWei,
          tokenDecimal
        )} worth of ${tokenSymbol}`
      );
      const intAmount = Number(formatUnits(amountWei, tokenDecimal));
      const tokenBalance = await getTokenBalance(
        dexWallet.walletProvider,
        dexWallet.walletAddress,
        token
      );

      const balance = tokenBalance.balance;
      const balanceInt = tokenBalance.formatted;

      // Redeem from Yearn Vaults
      if (vault !== undefined && Number(await balance) < Number(amountWei)) {
        const yearnCtx = new ethers.Contract(vault, erc20Abi, dexWallet.wallet);
        const yearnCtxBal = await yearnCtx?.balanceOf(dexWallet.walletAddress);

        if (Number(yearnCtxBal) >= Number(amountWei)) {
          console.log('Redeem from Yearn');
          const data: TRedeem = {
            wallet: dexWallet.wallet,
            pool: vault,
            amount: yearnCtxBal,
            receiver: dexWallet.walletAddress,
            chainId: String(chainId),
          };
          yearnRedeems.push(data);
        } else if (Number(yearnCtxBal) > 0) {
          console.log('Redeem from Yearn');
          const data: TRedeem = {
            wallet: dexWallet.wallet,
            pool: vault,
            amount: yearnCtxBal,
            receiver: dexWallet.walletAddress,
            chainId: String(chainId),
          };

          yearnRedeems.push(data);
        }
      }

      // Technical Analysis
      if (config?.TECNICAL_ANALYSIS) {
        const [rsiResult, stochasticRSIResult] = await getRSI(
          tokenSymbol,
          config
        );

        // Sell
        if (
          BigNumber.from(amountWei).lt(balance) ||
          BigNumber.from(amountWei).eq(balance)
        ) {
          // Sell if RSI and StochRSI are overbought
          if (
            stochasticRSIResult.stochRSI > config?.STOCKRSI_OVERBOUGHT &&
            rsiResult.rsiVal > config?.RSI_OVERBOUGHT
          ) {
            const tokenSymbol = await tokenContract.symbol();
            console.log('Condition met for selling', tokenSymbol);

            const swap: Tswap = {
              address: dexWallet.walletAddress,
              token0: tokenContract.address,
              token1: usdcAddress,
              chainId: config?.SELECTED_CHAINID,
              amount: BigInt(String(amountWei)),
              slippage: Number(config?.SLIPPAGE),
            };

            swapsSell.push(swap);
          } else {
            console.warn('⚠️ Waiting for StochRSI overBought');
          }
        } else if (BigNumber.from(amountWei).gt(balance) && balance.gt(0)) {
          if (
            stochasticRSIResult.stochRSI > config?.STOCKRSI_OVERBOUGHT &&
            rsiResult.rsiVal > config?.RSI_OVERBOUGHT
          ) {
            const tokenSymbol = await tokenContract.symbol();

            console.log('Condition met for selling', tokenSymbol);

            const swap: Tswap = {
              address: dexWallet.walletAddress,
              token0: tokenContract.address,
              token1: usdcAddress,
              chainId: config?.SELECTED_CHAINID,
              amount: BigInt(String(balance)),
              slippage: Number(config?.SLIPPAGE),
            };

            swapsSell.push(swap);
          }
        }
      } else {
        // Sell if RSI and StochRSI are overbought
        const swap: Tswap = {
          address: dexWallet.walletAddress,
          token0: tokenContract.address,
          token1: usdcAddress,
          chainId: config?.SELECTED_CHAINID,
          amount: BigInt(String(amountWei)),
          slippage: Number(config?.SLIPPAGE),
        };
        swapsSell.push(swap);
      }

      blocks.printline();
    } catch (e) {
      console.log(e);
    }
  }

  // Buy Tokens
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  blocks.print1block();
  console.log('🔄 Buy Tokens');

  const poolAddress = config?.YEARN_VAULTS.USDC;
  const poolCtx = new ethers.Contract(poolAddress, erc20Abi, dexWallet.wallet);
  const yBalUSDC = await poolCtx?.balanceOf(dexWallet.walletAddress);
  const balUSD: BigNumber = await (
    await getTokenBalance(
      dexWallet.walletProvider,
      dexWallet.walletAddress,
      config?.USDC
    )
  )?.balance;

  let totalAmountWei = BigNumber.from(0);

  tokensToBuy.forEach((token) => {
    totalAmountWei = totalAmountWei.add(token.amount);
  });

  for (const { token, amount: amountWei } of tokensToBuy) {
    if (token === usdcAddress) {
      console.log('SKIP USDC BUY');
      break;
    }

    console.log(`🟩 Buying ${Number(amountWei) / 1e6} USDC worth of ${token}`);
    const tokenCtx = new Contract(token, erc20Abi, dexWallet.wallet);

    const tokenSym = await tokenCtx.symbol();

    // let [rsiResult, stochasticRSIResult] = [null, null]
    let isTechnicalAnalysisConditionMet = false;

    // Technical Analysis
    if (config?.TECNICAL_ANALYSIS) {
      const [rsiResult, stochasticRSIResult] = await getRSI(tokenSym, config);

      isTechnicalAnalysisConditionMet =
        stochasticRSIResult.stochRSI < config?.STOCKRSI_OVERSOLD &&
        rsiResult.rsiVal < config?.RSI_OVERSOLD;
    }

    // Buy
    if (isTechnicalAnalysisConditionMet || !config?.TECNICAL_ANALYSIS) {
      const tokenSym = await tokenCtx.symbol();
      console.log('Condition met for buying', tokenSym);
      const swap: Tswap = {
        address: dexWallet.walletAddress,
        token0: tokenCtx.address,
        token1: usdcAddress,
        chainId: config?.SELECTED_CHAINID,
        amount: BigInt(amountWei),
        slippage: Number(config?.SLIPPAGE),
      };
      swapsBuy.push(swap);
    } else {
      console.warn('⚠️ Waiting for StochRSI overSold');
    }

    blocks.printline();
  }

  console.log('🟩 USDC Balance: ', formatUnits(balUSD, 6));
  console.log('🟩 Yearn USDC Balance: ', formatUnits(yBalUSDC, 6));

  // Redeem USDC from Yearn Vaults
  if (tokensToBuy.length > 0 && yBalUSDC.gt(0)) {
    console.log('Redeem from Yearn Vaults');
    const data: TRedeem = {
      wallet: dexWallet.wallet,
      pool: poolAddress,
      amount: yBalUSDC,
      receiver: dexWallet.walletAddress,
      chainId: String(chainId),
    };

    yearnRedeems.push(data);
  }

  // Redeem from Yearn Vaults
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  blocks.print1block();
  console.log('📡 Yearn Redeem Data');
  try {
    const redeemLogic = new RedeemTokenLogic(dexWallet.wallet);
    const data = await redeemLogic.build(yearnRedeems);

    const tx = await builder.buildTransaction(
      data.approvals,
      data.calldatas,
      data.tokens_return
    );

    for (const _tx of tx.txs) {
      const tx = await dexWallet.wallet.sendTransaction(_tx);
      const broadcaster = await waitForTx(
        dexWallet.walletProvider,
        tx?.hash,
        dexWallet.walletAddress
      );
      console.log(`📡 Broadcasted: ${broadcaster}`);
    }
  } catch (e) {
    console.log(e);
  }

  if (swapsSell.length !== 0) {
    try {
      console.log('🔄 Swaps Sell');
      const swapLogic = new SwapTokenLogic(dexWallet.wallet);
      const data = await swapLogic.build(dexWallet.walletAddress, swapsSell);

      const tx = await builder.buildTransaction(
        data.approvals,
        data.calldatas,
        data.tokens_return
      );

      const simulate = await dexWallet.wallet.provider.call(tx.txs[0]);

      if (!simulate) {
        throw new Error('Simulate failed');
      }

      for (const _tx of tx.txs) {
        const tx = await dexWallet.wallet.sendTransaction(_tx);
        const broadcaster = await waitForTx(
          dexWallet.walletProvider,
          tx?.hash,
          dexWallet.walletAddress
        );
        console.log(`📡 Broadcasted: ${broadcaster}`);
      }
    } catch (e) {
      console.log(e);
    }
  }

  if (swapsBuy.length !== 0) {
    try {
      console.log('🔄 Swaps Buy');
      console.log('🔄 Swaps Sell');
      const swapLogic = new SwapTokenLogic(dexWallet.wallet);
      const data = await swapLogic.build(dexWallet.walletAddress, swapsBuy);

      const tx = await builder.buildTransaction(
        data.approvals,
        data.calldatas,
        data.tokens_return
      );

      const simulate = await dexWallet.wallet.provider.call(tx.txs[0]);

      if (!simulate) {
        throw new Error('Simulate failed');
      }

      for (const _tx of tx.txs) {
        const tx = await dexWallet.wallet.sendTransaction(_tx);
        const broadcaster = await waitForTx(
          dexWallet.walletProvider,
          tx?.hash,
          dexWallet.walletAddress
        );
        console.log(`📡 Broadcasted: ${broadcaster}`);
      }
    } catch (e) {
      console.log(e);
    }
  }

  // Deposit to Yearn Vaults
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------
  console.log('⚖️ Yearn Deposit Data\n');
  blocks.print1block();

  const yearnDeposits = [];

  for (const vault of Object.values(config?.YEARN_VAULTS)) {
    const vaultStats = new VaultStats();
    const vaultAsset = await vaultStats.getAsset(String(vault), chainId);

    const assetContract = new ethers.Contract(
      vaultAsset,
      erc20Abi,
      dexWallet.wallet
    );

    const balance = await assetContract.balanceOf(dexWallet.walletAddress);

    if (balance.gt(0)) {
      if (tokensToBuy.length == 0 && tokensToSell.length == 0) {
        console.log(
          `Deposit to Yearn Vaults Amount: ${Number(
            balance
          )}, Vault:  ${vaultAsset}`
        );

        const data: TDeposit = {
          wallet: dexWallet.wallet,
          tokenAddr: vaultAsset,
          pool: String(vault),
          amount: balance,
          receiver: dexWallet.walletAddress,
          chainId: config?.SELECTED_CHAINID,
        };

        yearnDeposits.push(data);
      }
    }
  }

  try {
    const depositLogic = new DepositTokenLogic(dexWallet.wallet);
    const data = await depositLogic.build(yearnDeposits);

    const tx = await builder.buildTransaction(
      data.approvals,
      data.calldatas,
      data.tokens_return
    );

    for (const _tx of tx.txs) {
      const tx = await dexWallet.wallet.sendTransaction(_tx);
      const broadcaster = await waitForTx(
        dexWallet.walletProvider,
        tx?.hash,
        dexWallet.walletAddress
      );
      console.log(`📡 Broadcasted: ${broadcaster}`);
    }
  } catch (e) {
    console.log(e);
  }

  blocks.print1starry();
  console.log('✔️ Rebalance completed.');
}

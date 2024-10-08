import { BigNumber, Contract, ethers } from 'ethers';
import { DexWallet } from '../../../utils/web3/dexWallet';
import { formatEther, formatUnits } from 'ethers/lib/utils';
import { fetchPrices } from '../../../utils/quote1Inch';
import { getTokenMetadata } from '../../../utils/getTokenMetadata';
import { getTokenBalance } from '../../../utils/getTokenBalance';
import { getTokenValue } from '../../../utils/getTokenValue';
import { getRSI } from '../../../features/ta/getRSI';
import { waitForTx } from '../../../utils/web3/networkUtils';
import erc20Abi from '../../../../api/abis/common/ERC20.json';
import yearnVaultAbi from '../../../../api/abis/yearn/YearnVault.json';
import * as blocks from '../../../utils/logBlocks';
import { TConfigReturn } from '../../../types/config';
import { TDeposit, TRedeem } from '../../../types/yearn';
import { INFRA } from '../../../../api';

import { DepositTokenLogic } from '../../../../api/logics/yearn/logic.deposit-token';
import { RedeemTokenLogic } from '../../../../api/logics/yearn/logic.redeem-token';

import { SwapTokenLogic } from '../../../../api/logics/odos';
import { Builder } from '../../../../api/classes/builder';
import { QuoteParams } from '../../../../api/logics/odos/logic.swap-token';
import registryAbi from 'baluni-contracts/artifacts/contracts/registry/BaluniV1Registry.sol/BaluniV1Registry.json';
import rebalancerAbi from 'baluni-contracts/artifacts/contracts/managers/BaluniV1Rebalancer.sol/BaluniV1Rebalancer.json';
import { VaultStats } from '../../../../api/logics/yearn';

export async function rebalancePortfolio(
  dexWallet: DexWallet,
  desiredTokens: string[],
  desiredAllocations: { [token: string]: number },
  usdcAddress: string,
  config: TConfigReturn
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
      const tokenValueYearn = await getTokenValue(
        tokenSymbol,
        token,
        maxRedeem,
        decimals,
        usdcAddress,
        String(chainId)
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
  const tokensToBuy = [];

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
    //   )
    //   const decimals = tokenMetadata.decimals
    //   const _token = {
    //     address: token,
    //     decimals: decimals,
    //   }
    //   const tokenPriceInUSDT: number = await fetchPrices(
    //     _token,
    //     String(chainId)
    //   ) // Ensure this returns a value
    //   const pricePerToken = ethers.utils.parseUnits(
    //     tokenPriceInUSDT!.toString(),
    //     'ether'
    //   )
    //   const tokenAmountToSell = valueToRebalance
    //     .mul(BigNumber.from(10).pow(decimals))
    //     .div(pricePerToken)
    //   console.log(
    //     `🔴 Amount To Sell ${formatEther(tokenAmountToSell)} ${tokenSymbol}`
    //   )
    //   tokensToSell.push({ token, amount: tokenAmountToSell })
    // } else if (difference > 0 && Math.abs(difference) > config?.LIMIT) {
    //   tokensToBuy.push({ token, amount: valueToRebalance.div(1e12) })
    // }

    blocks.printline();
  }

  // Quote ODOS
  const quoteRequestBody = {
    chainId: Number(chainId), // Replace with desired chainId
    inputTokens: [] as { tokenAddress: string; amount: string }[],
    outputTokens: [] as { tokenAddress: string; proportion: number }[],
    userAddr: '0x',
    slippageLimitPercent: Number(config.SLIPPAGE / 1000), // set your slippage limit percentage (1 = 1%),
    referralCode: 3844415834, // referral code (recommended)
    disableRFQs: true,
    compact: true,
  };

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
      const tokenBalance = await getTokenBalance(
        dexWallet.walletProvider,
        dexWallet.walletAddress,
        token
      );
      const balance = tokenBalance.balance;

      const [rsiResult, stochasticRSIResult] = await getRSI(
        tokenSymbol,
        config
      );
      if (vault !== undefined && Number(await balance) < Number(amountWei)) {
        const yearnCtx = new ethers.Contract(vault, erc20Abi, dexWallet.wallet);
        const yearnCtxBal = await yearnCtx?.balanceOf(dexWallet.walletAddress);

        if (Number(yearnCtxBal) >= Number(amountWei)) {
          console.log('Redeem from Yearn');
          const data: TRedeem = {
            wallet: dexWallet.wallet,
            pool: vault,
            amount: amountWei,
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

      // Sell token if RSI and StochRSI are overbought
      if (
        BigNumber.from(amountWei).lt(balance) ||
        BigNumber.from(amountWei).eq(balance)
      ) {
        if (
          stochasticRSIResult.stochRSI > config?.STOCKRSI_OVERBOUGHT &&
          rsiResult.rsiVal > config?.RSI_OVERBOUGHT &&
          config?.TECNICAL_ANALYSIS
        ) {
          const tokenSymbol = await tokenContract.symbol();
          console.log('Condition met for selling', tokenSymbol);

          if (!quoteRequestBody.inputTokens) {
            quoteRequestBody.inputTokens = [];
          }

          quoteRequestBody.inputTokens.push({
            tokenAddress: token,
            amount: String(amountWei),
          });
          console.log('Input Token Added');
        } else if (!config?.TECNICAL_ANALYSIS) {
          if (!quoteRequestBody.inputTokens) {
            quoteRequestBody.inputTokens = [];
          }

          quoteRequestBody.inputTokens.push({
            amount: String(amountWei),
            tokenAddress: token,
          });
          console.log('Input Token Added');
        }
      } else if (BigNumber.from(amountWei).gt(balance) && balance.gt(0)) {
        if (
          stochasticRSIResult.stochRSI > config?.STOCKRSI_OVERBOUGHT &&
          rsiResult.rsiVal > (config?.RSI_OVERBOUGHT as number) &&
          config?.TECNICAL_ANALYSIS
        ) {
          const tokenSymbol = await tokenContract.symbol();
          console.log('Condition met for selling', tokenSymbol);

          if (!quoteRequestBody.inputTokens) {
            quoteRequestBody.inputTokens = [];
          }

          quoteRequestBody.inputTokens.push({
            tokenAddress: token,
            amount: String(balance),
          });
          console.log('Input Token Added');
        } else if (!config?.TECNICAL_ANALYSIS) {
          if (!quoteRequestBody.inputTokens) {
            quoteRequestBody.inputTokens = [];
          }

          quoteRequestBody.inputTokens.push({
            amount: String(balance),
            tokenAddress: token,
          });
          console.log('Input Token Added');
        }
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

  let totalAmountWei = BigNumber.from(0);

  const existTokenToSell = quoteRequestBody.inputTokens.length > 0;

  for (let i = 0; i < rebalanceData.underweightVaults.length; i++) {
    tokensToBuy.push({
      token: desiredTokens[Number(rebalanceData.underweightVaults[i])],
      amount: rebalanceData.underweightAmounts[i],
    });
  }

  const existTokenToSellAndBuy =
    tokensToBuy.length > 0 && tokensToSell.length > 0;

  if (existTokenToSell) {
    tokensToBuy.forEach((token) => {
      totalAmountWei = totalAmountWei.add(token.amount);
    });

    quoteRequestBody.inputTokens.map((token) => {
      if (token.tokenAddress === usdcAddress) {
        token.amount = String(totalAmountWei);
      }
    });

    let totalProportion = 0;

    for (const { token, amount: amountWei } of tokensToBuy) {
      console.log(
        `🟩 Buying ${Number(amountWei) / 1e6} USDC worth of ${token}`
      );
      const tokenCtx = new Contract(token, erc20Abi, dexWallet.wallet);
      const tokenSym = await tokenCtx.symbol();
      const [rsiResult, stochasticRSIResult] = await getRSI(tokenSym, config);
      const isTechnicalAnalysisConditionMet =
        stochasticRSIResult.stochRSI < config?.STOCKRSI_OVERSOLD &&
        rsiResult.rsiVal < config?.RSI_OVERSOLD;

      if (isTechnicalAnalysisConditionMet || !config?.TECNICAL_ANALYSIS) {
        const tokenSym = await tokenCtx.symbol();
        console.log('Condition met for buying', tokenSym);
        quoteRequestBody.outputTokens.push({
          tokenAddress: token,
          proportion: amountWei / Number(totalAmountWei),
        });
        totalProportion += Number(amountWei) / Number(totalAmountWei);
      } else {
        console.warn('⚠️ Waiting for StochRSI overSold');
      }

      blocks.printline();
    }

    if (totalProportion != 1) {
      console.error(
        '⚠️ Total proportion is greater than 1 or less than 1',
        totalProportion
      );
    }
  } else {
    console.log('No Tokens To Sell');
  }

  // Redeem from Yearn Vaults
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------

  blocks.print1block();
  console.log('📡 Yearn Redeem Data');
  try {
    if (existTokenToSellAndBuy) {
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
    }
  } catch (e) {
    console.log(e);
  }

  // Build Swap Odos
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------

  try {
    if (
      quoteRequestBody.inputTokens.length === 0 ||
      quoteRequestBody.outputTokens.length === 0
    ) {
      console.log('📡 No tokens to sell or buy');
    } else {
      quoteRequestBody.userAddr = dexWallet.walletAddress;

      const params: QuoteParams = {
        userAddr: builder.agentAddress,
        chainId: chainId,
        inputTokens: quoteRequestBody.inputTokens,
        outputTokens: quoteRequestBody.outputTokens,
        slippageLimitPercent: Number(quoteRequestBody.slippageLimitPercent),
      };
      const swap_logics = new SwapTokenLogic(dexWallet.wallet);
      await swap_logics.setup(chainId);

      const quote = await swap_logics.quote(params);
      const data = await swap_logics.build(
        builder.agentAddress,
        quote
      );

      const builderData = await builder.buildTransaction(
        data.approvals,
        data.calldatas,
        data.tokens_return
      );

      for (const _tx of builderData.txs) {
        const tx = await dexWallet.wallet.sendTransaction(_tx);
        const broadcaster = await waitForTx(
          dexWallet.walletProvider,
          tx?.hash,
          dexWallet.walletAddress
        );
        console.log(`📡  Broadcasted: ${broadcaster}`);
      }
    }
  } catch (e) {
    console.log(e);
  }

  // Deposit to Yearn Vaults
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------

  console.log('⚖️ Yearn Deposit Data\n');
  blocks.print1block();

  const yearnDeposits = [];

  for (const vault of Object.values(config?.YEARN_VAULTS)) {
    const statsGetter = new VaultStats();
    const vaultAsset = await statsGetter.getAsset(String(vault), chainId);

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
          chainId: String(config?.SELECTED_CHAINID),
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

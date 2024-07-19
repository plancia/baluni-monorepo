import { BigNumber, Contract } from 'ethers'
import { loadPrettyConsole } from './prettyConsole'

const prettyConsole = loadPrettyConsole()

export async function getAmountOut(
  tokenA: string,
  tokenB: string,
  poolFee: Number,
  swapAmount: BigNumber,
  quoterContract: Contract,
  slippage: any
) {
  try {
    let slippageTolerance = slippage

    let expectedAmountB = await quoterContract.callStatic.quoteExactInputSingle(
      tokenA,
      tokenB,
      poolFee,
      swapAmount.toString(),
      0
    )

    console.group('Swap Details')
    console.log(`Amount A: ${swapAmount.toString()}`)
    console.log(`Expected amount B: ${expectedAmountB.toString()}`)
    console.log(`Pool Fee: ${poolFee}`)
    console.log(`Slippage Tolerance: ${slippageTolerance}`)
    console.groupEnd()

    let minimumAmountB = expectedAmountB
      .mul(10000 - slippageTolerance)
      .div(10000)

    return minimumAmountB
  } catch (e) {
    return false
  }
}

export async function getPoolFee(
  tokenAAddress: string,
  tokenBAddress: string,
  swapAmount: BigNumber,
  quoterContract: Contract,
  config: any
): Promise<number> {
  const poolFees = [100, 500, 3000, 10000]
  let bestPoolFee = 0
  let minimumAmountBSoFar = null

  for (const _poolFee of poolFees) {
    let minimumAmountB = await getAmountOut(
      tokenAAddress,
      tokenBAddress,
      _poolFee,
      swapAmount,
      quoterContract,
      config
    )

    if (
      minimumAmountB &&
      (minimumAmountBSoFar === null || minimumAmountB.gt(minimumAmountBSoFar))
    ) {
      bestPoolFee = _poolFee
      minimumAmountBSoFar = minimumAmountB
    }
  }

  return bestPoolFee
}

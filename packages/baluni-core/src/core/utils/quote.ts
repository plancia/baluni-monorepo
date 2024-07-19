import { ethers } from 'ethers'
import * as uniswapV3FactoryAbi from '../../api/abis/uniswap/Factory.json'
import * as uniswapV3PoolAbi from '../../api/abis/uniswap/Pool.json'
import * as erc20Abi from '../../api/abis/common/ERC20.json' // Assuming you have ERC20 ABI for fetching decimals
import { PROTOCOLS } from '../../api/'

export async function quotePair(
  tokenAAddress: string,
  tokenBAddress: string,
  provider: ethers.providers.JsonRpcProvider
) {
  const chainId = provider.network.chainId
  const uniswapV3FactoryAddress = PROTOCOLS[chainId]['uni-v3']?.FACTORY

  if(!uniswapV3FactoryAddress){
    throw new Error('Uniswap V3 factory address not found')
  }
  // Get the contract instance
  const factoryContract = new ethers.Contract(
    uniswapV3FactoryAddress,
    uniswapV3FactoryAbi,
    provider
  )

  const tokenAContract = new ethers.Contract(tokenAAddress, erc20Abi, provider)
  // const tokenBContract = new ethers.Contract(tokenBAddress, erc20Abi, provider);

  // Fetch decimals for both tokens
  const tokenADecimals = await tokenAContract.decimals()
  // const tokenBDecimals = await tokenBContract.decimals();

  const txInputs = [tokenAAddress, tokenBAddress, 3000]

  try {
    const poolAddress = await factoryContract.getPool(...txInputs)
    console.log('Pool address:', poolAddress)

    const poolContract = new ethers.Contract(
      poolAddress,
      uniswapV3PoolAbi,
      provider
    )
    const slot0 = await poolContract.slot0()

    const { tick } = slot0
    const tokenBPrice = 1 / (1.0001 ** tick * 10 ** -12)

    if (tokenADecimals == 8) {
      console.log('Tick:', tick, 'Price:', (tokenBPrice / 1e5) * 2)
      return (tokenBPrice / 1e5) * 2
    } else {
      console.log('Tick:', tick, 'Price:', tokenBPrice)
      return tokenBPrice
    }
  } catch {
    return false
  }
}

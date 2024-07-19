import chalk from 'chalk'
import { DexWallet } from './web3/dexWallet'
import { ethers } from 'ethers'
import { waitForTx } from './web3/networkUtils'

const WETH_ABI = [
  // Wrap ETH
  'function deposit() payable',
  // Unwrap ETH
  'function withdraw(uint wad) public',
  // get WETH balance
  'function balanceOf(address owner) view returns (uint256)',
]

export async function wrapETH(
  dexWallet: DexWallet,
  amount: string,
  config: any
) {
  const signer = dexWallet.wallet
  const wethContract = new ethers.Contract(config?.WNATIVE, WETH_ABI, signer)

  console.log(`Wrapping ${amount} ETH...`)
  const depositTx = await wethContract.deposit({
    value: ethers.utils.parseEther(amount),
  })
  console.log('Done! Tx Hash:', depositTx.hash)
  await waitForTx(
    dexWallet.wallet.provider,
    depositTx.hash,
    dexWallet.wallet.address
  )
  const wethBalance = await wethContract.balanceOf(signer.address)

  console.log(
    chalk.green(
      `Wrapped ${amount} NATIVE into ${ethers.utils.formatUnits(
        wethBalance,
        18
      )} WNATIVE`
    )
  )
}

export async function unwrapETH(
  dexWallet: DexWallet,
  amount: string,
  config: any
) {
  const signer = dexWallet.wallet
  const wethContract = new ethers.Contract(config?.WRAPPED, WETH_ABI, signer)

  console.log(`Unwrapping ${amount} WNATIVE...`)
  const withdrawTx = await wethContract.withdraw(
    ethers.utils.parseEther(amount)
  )
  console.log('Done! Tx Hash:', withdrawTx.hash)
  await waitForTx(
    dexWallet.wallet.provider,
    withdrawTx.hash,
    dexWallet.wallet.address
  )
  const wethBalance = await wethContract.balanceOf(signer.address)

  console.log(
    chalk.green(
      `Unwrapped ${amount} WNATIVE into ${ethers.utils.formatUnits(
        wethBalance,
        18
      )} NATIVE`
    )
  )
}

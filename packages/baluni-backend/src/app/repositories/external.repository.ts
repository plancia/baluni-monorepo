import {
  PROTOCOLS,
  ORACLE,
  NATIVETOKENS,
  NETWORKS,
  TOKENS_URL,
} from '../../../../baluni-core/src/api/";
import { YearnVault, Configurations } from '../../../../baluni-core/src/core/types/'
import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

const CONFIGURATIONS: Configurations = {
  protocols: PROTOCOLS,
  oracle: ORACLE,
  nativeTokens: NATIVETOKENS,
  networks: NETWORKS,
}

@Injectable()
export class ExternalRepository {
  getUniswapTokensList(
    chainId:number
  ){
    try {
      const response = await fetch(TOKENS_URL)
      const data = await response.json()
      const filteredTokens = data.tokens.filter(
        (token: { chainId: number }) => token.chainId === Number(chainId)
      )
      return filteredTokens;
    } catch (error) {
      Logger.error("Failed to get uniswap tokens list")
    }
  }  
  getUniswapToken(chainId:number, symbol:string){
    try {
      const response = await fetch(TOKENS_URL)
      const data = await response.json()
      const matchingTokens = data.tokens.filter(
        (token: { chainId: number; symbol: string }) =>
          token.chainId === Number(chainId) &&
          token.symbol.toLowerCase() === tokenSymbol.toString().toLowerCase()
      )
  
      if (matchingTokens.length === 0) {
        return res.status(404).json({ error: 'Token not found' })
      }
  
     return matchingTokens[0]
    } catch (error) {
     Logger.error("Failed to get token from uniswap")
    }
  }
  getYearnVault(chainId: number, symbol: string, strategyType?:string, boosted?:string) {
    const apiURL = `https://ydaemon.yearn.fi/${chainId}/vaults/all`
  
    try {
      const response = await fetch(apiURL)
      const data: YearnVault[] = await response.json()

      if(strategyType === "" && boosted === "" ) return data;
  
      let filteredVaults = data.filter(vault => {
        const matchesSymbol =
          vault.token.symbol.toLowerCase() === symbol.toLowerCase()
        const isVersion3 =
          vault.version?.startsWith('3.0') ||
          vault.name.includes('3.0') ||
          vault.symbol.includes('3.0')
        let matchesStrategyType = true
        let matchesBoosted = true
  
        if (strategyType === 'multi') {
          matchesStrategyType = vault.kind === 'Multi Strategy'
        } else if (strategyType === 'single') {
          matchesStrategyType = vault.kind !== 'Multi Strategy'
        }
  
        // Check if boosted filter is applied
        if (boosted === 'true') {
          matchesBoosted = vault.boosted === true
        }
  
        return (
          matchesSymbol && isVersion3 && matchesStrategyType && matchesBoosted
        )
      })
  
      if (filteredVaults.length === 0) {
        return Logger.error('Vault not found for the given criteria')}
  
      const vault = filteredVaults[0]
      return {
        vaultAddress: vault.address,
        vaultName: vault.name,
        vaultSymbol: vault.symbol,
        tokenAddress: vault.token.address,
        tokenName: vault.token.name,
        tokenSymbol: vault.token.symbol,
        strategyType: vault.kind,
        version: vault.version,
        boosted: vault.boosted,
      }
    } catch (error) {
      return Logger.error('Failed to fetch Yearn Finance vaults:', error) 
    }
  }
  getYearnVaults(chainId:number) {
  const apiURL = `https://ydaemon.yearn.fi/${chainId}/vaults/all`

    try {
      const response = await fetch(apiURL)
      const data: YearnVault[] = await response.json()

      return(
        data.map(vault => ({
          vaultAddress: vault.address,
          vaultName: vault.name,
          vaultSymbol: vault.symbol,
          tokenAddress: vault.token.address,
          tokenName: vault.token.name,
          tokenSymbol: vault.token.symbol,
        }))
      )
    } catch (error) {
      Logger.error('Failed to fetch Yearn Finance vaults:', error)
    }
  }
}
async function fetchYearnVaultsData(chainId: number): Promise<YearnVault[]> {
  try {
    const apiURL = `https://ydaemon.yearn.fi/${chainId}/vaults/all`
    const response = await fetch(apiURL)
    const data: YearnVault[] = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch Yearn Finance vaults:', error)
    return []
  }
}
async function fetchTokenAddressByName(
  tokenSymbol: string,
  chainId: number
): Promise<string | null> {
  try {
    const response = await fetch(TOKENS_URL);
    const data = await response.json();
    const matchingToken = data.tokens.find(
      (token: { chainId: number; symbol: string }) =>
        token.chainId === chainId &&
        token.symbol.toLowerCase() === tokenSymbol.toLowerCase()
    );
    return matchingToken ? matchingToken.address : null;
  } catch (error) {
    console.error('Failed to fetch token address:', error);
    return null;
  }
}

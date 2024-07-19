export * from './lib/baluni-contracts';

import * as baluniVaultRegistryAbi from '../artifacts/contracts/registry/BaluniV1YearnVaultRegistry.sol/BaluniV1YearnVaultRegistry.json';
import * as baluniVaultAbi from '../artifacts/contracts/vaults/BaluniV1YearnVault.sol/BaluniV1YearnVault.json';

import * as testContract from '../artifacts/contracts/registry/BaluniV1YearnVaultRegistry.sol/BaluniV1YearnVaultRegistry.json';

import * as baluniPoolAbi from '../artifacts/contracts/pools/BaluniV1Pool.sol/BaluniV1Pool.json';
import * as baluniPoolRegistryAbi from '../artifacts/contracts/registry/BaluniV1PoolRegistry.sol/BaluniV1PoolRegistry.json';
import * as baluniDCAVaultAbi from '../artifacts/contracts/vaults/BaluniV1DCAVault.sol/BaluniV1DCAVault.json';
import * as baluniDCAVaultRegistryAbi from '../artifacts/contracts/registry/BaluniV1DCAVaultRegistry.sol/BaluniV1DCAVaultRegistry.json';
import * as baluniPoolsRegistryAbi from '../artifacts/contracts/registry/BaluniV1PoolRegistry.sol/BaluniV1PoolRegistry.json';

import * as baluniYearnVaultRegistryAbi from '../artifacts/contracts/registry/BaluniV1YearnVaultRegistry.sol/BaluniV1YearnVaultRegistry.json';
import * as baluniYearnVaultAbi from '../artifacts/contracts/vaults/BaluniV1YearnVault.sol/BaluniV1YearnVault.json';

import * as baluniDeploiedContracts from 'baluni-contracts/deployments/deployedContracts.json';
import * as baluniOracleAbi from 'baluni-contracts/artifacts/contracts/oracles/BaluniV1Oracle.sol/BaluniV1Oracle.json';

import * as baluniRegistryAbi from 'baluni-contracts/artifacts/contracts/registry/BaluniV1Registry.sol/BaluniV1Registry.json';

import * as routerAbi from 'baluni-contracts/artifacts/contracts/orchestators/BaluniV1Router.sol/BaluniV1Router.json'

import * as erc20Abi from '../abis/common/ERC20.json';
import * as ERC20ABI from 'baluni-contracts/abis/common/ERC20.json';

export const baluniContracts = {
  baluniVaultRegistryAbi,
  baluniVaultAbi,
  testContract,
  baluniPoolAbi,
  baluniPoolRegistryAbi,
  baluniDCAVaultAbi,
  baluniDCAVaultRegistryAbi,
  baluniPoolsRegistryAbi,
  baluniYearnVaultRegistryAbi,
  baluniYearnVaultAbi,
  erc20Abi,
  baluniDeploiedContracts,
  baluniOracleAbi,
  baluniRegistryAbi,
  routerAbi,
  ERC20ABI
};
export { testContract, baluniVaultRegistryAbi, baluniVaultAbi };

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
import * as erc20Abi from '../abis/common/ERC20.json';

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
};
export { testContract, baluniVaultRegistryAbi, baluniVaultAbi };

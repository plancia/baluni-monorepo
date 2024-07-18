export * from './lib/baluni-contracts';

import * as baluniVaultRegistryAbi from '../artifacts/contracts/registry/BaluniV1YearnVaultRegistry.sol/BaluniV1YearnVaultRegistry.json';
import * as baluniVaultAbi from '../artifacts/contracts/vaults/BaluniV1YearnVault.sol/BaluniV1YearnVault.json';

import * as testContract from '../artifacts/contracts/registry/BaluniV1YearnVaultRegistry.sol/BaluniV1YearnVaultRegistry.json';

export const baluniContracts = {
  baluniVaultRegistryAbi,
  baluniVaultAbi,
  testContract,
};
export { testContract, baluniVaultRegistryAbi, baluniVaultAbi };

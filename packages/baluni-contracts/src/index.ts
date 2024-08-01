// export * from './lib/baluni-contracts';

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

import * as baluniDeploiedContracts from '../deployments/deployedContracts.json';
import * as baluniOracleAbi from '../artifacts/contracts/oracles/BaluniV1Oracle.sol/BaluniV1Oracle.json';

import * as baluniRegistryAbi from '../artifacts/contracts/registry/BaluniV1Registry.sol/BaluniV1Registry.json';

import * as routerAbi from '../artifacts/contracts/orchestators/BaluniV1Router.sol/BaluniV1Router.json';

import * as erc20Abi from '../abis/common/ERC20.json';

import * as hyperPoolZapABI from '../artifacts/contracts/managers/BaluniV1HyperPoolZap.sol/BaluniV1HyperPoolZap.json';
import * as poolZapABI from '../artifacts/contracts/managers/BaluniV1PoolZap.sol/BaluniV1PoolZap.json';
import * as rebalancerABI from '../artifacts/contracts/managers/BaluniV1Rebalancer.sol/BaluniV1Rebalancer.json';
import * as swapperABI from '../artifacts/contracts/managers/BaluniV1Swapper.sol/BaluniV1Swapper.json';
import * as oracleABI from '../artifacts/contracts/oracles/BaluniV1Oracle.sol/BaluniV1Oracle.json';
import * as agentABI from '../artifacts/contracts/orchestators/BaluniV1Agent.sol/BaluniV1Agent.json';
import * as factoryABI from '../artifacts/contracts/orchestators/BaluniV1AgentFactory.sol/BaluniV1AgentFactory.json';
import * as routerABI from '../artifacts/contracts/orchestators/BaluniV1Router.sol/BaluniV1Router.json';
import * as poolABI from '../artifacts/contracts/pools/BaluniV1Pool.sol/BaluniV1Pool.json';
import * as dcaVaultRegistryABI from '../artifacts/contracts/registry/BaluniV1DCAVaultRegistry.sol/BaluniV1DCAVaultRegistry.json';
import * as poolRegistryABI from '../artifacts/contracts/registry/BaluniV1PoolRegistry.sol/BaluniV1PoolRegistry.json';
import * as registryABI from '../artifacts/contracts/registry/BaluniV1Registry.sol/BaluniV1Registry.json';
import * as yearnVaultRegistryABI from '../artifacts/contracts/registry/BaluniV1YearnVaultRegistry.sol/BaluniV1YearnVaultRegistry.json';
import * as dcaVaultABI from '../artifacts/contracts/vaults/BaluniV1DCAVault.sol/BaluniV1DCAVault.json';
import * as yearnVaultABI from '../artifacts/contracts/vaults/BaluniV1YearnVault.sol/BaluniV1YearnVault.json';

// import factoryAbi from 'baluni-contracts/artifacts/contracts/orchestators/BaluniV1AgentFactory.sol/BaluniV1AgentFactory.json';
// import registryAbi from 'baluni-contracts/artifacts/contracts/registry/BaluniV1Registry.sol/BaluniV1Registry.json';
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
  hyperPoolZapABI,
  poolZapABI,
  rebalancerABI,
  swapperABI,
  oracleABI,
  agentABI,
  factoryABI,
  routerABI,
  poolABI,
  dcaVaultRegistryABI,
  poolRegistryABI,
  registryABI,
  yearnVaultRegistryABI,
  dcaVaultABI,
  yearnVaultABI,
};
export { testContract, baluniVaultRegistryAbi, baluniVaultAbi };

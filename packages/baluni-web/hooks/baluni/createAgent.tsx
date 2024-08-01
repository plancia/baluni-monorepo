import factoryAbi from 'baluni-contracts/artifacts/contracts/orchestators/BaluniV1AgentFactory.sol/BaluniV1AgentFactory';
import registryAbi from 'baluni-contracts/artifacts/contracts/registry/BaluniV1Registry.sol/BaluniV1Registry';
import { INFRA } from 'baluni/dist/api/';
import { Contract, Wallet, ethers } from 'ethers';

import { readContract, writeContract } from 'wagmi/actions';
import { wagmiConfig } from '~~/services/web3/wagmiConfig';

export async function createAgent(signer: Wallet) {
  const chainId = await signer.getChainId();
  const registry = new Contract(
    INFRA[String(chainId)].REGISTRY,
    registryAbi.abi,
    signer
  );

  const factoryAddress = await registry.getBaluniAgentFactory();
  const targetAddress = (await signer.getAddress()) as `0x${string}`;
  const agentAddress = await readContract(wagmiConfig, {
    abi: factoryAbi.abi,
    address: factoryAddress,
    functionName: 'getAgentAddress',
    args: [targetAddress],
  });
  if (agentAddress != ethers.constants.AddressZero) {
    return agentAddress;
  } else {
    const tx = await await writeContract(wagmiConfig, {
      abi: factoryAbi.abi,
      address: factoryAddress,
      functionName: 'getOrCreateAgent',
      args: [targetAddress],
    });
    // const tx = await factory.getOrCreateAgent(await signer.getAddress());
    // waitForTx(await signer.provider, tx.hash, await signer.getAddress());
    return tx;
  }
}

export async function checkAgent(signer: Wallet) {
  const chainId = await signer.getChainId();

  const factoryAddress = await readContract(wagmiConfig, {
    abi: registryAbi.abi,
    address: INFRA[String(chainId)].REGISTRY,
    functionName: 'getBaluniAgentFactory',
    
  });

  const signerAddress = (await signer.getAddress()) as `0x${string}`;
  const agentAddress = await readContract(wagmiConfig, {
    abi: factoryAbi.abi,
    address: factoryAddress,
    functionName: 'getAgentAddress',
    args: [signerAddress],
  });

  if (agentAddress != ethers.constants.AddressZero) {
    return true;
  } else {
    return false;
  }
}

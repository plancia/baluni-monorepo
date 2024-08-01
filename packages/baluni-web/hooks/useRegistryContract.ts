import registryAbi from 'baluni-contracts/artifacts/contracts/registry/BaluniV1Registry.sol/BaluniV1Registry';
import { INFRA } from 'baluni-core/api';
import { useMemo } from 'react';
import { getContract } from 'viem';
import { useClient } from 'wagmi';
export default function useBaluniRegistryContract() {
  const client = useClient();

  const contract = useMemo(() => {
    return getContract({
      address: INFRA[137].REGISTRY,
      abi: registryAbi.abi,
      client,
    });
  }, [client]);

  return contract
}

import { useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import scaffoldConfig from '~~/scaffold.config';
import { useGlobalState } from '~~/services/store/store';
import { BaluniChainId } from '~~/services/web3/wagmiConfig';
import { NETWORKS_EXTRA_DATA } from '~~/utils/scaffold-eth';

/**
 * Retrieves the connected wallet's network from scaffold.config or defaults to the 0th network in the list if the wallet is not connected.
 */
export function useTargetNetwork() {
  const { chain } = useAccount();
  const targetNetwork = useGlobalState(({ targetNetwork }) => targetNetwork);
  const setTargetNetwork = useGlobalState(
    ({ setTargetNetwork }) => setTargetNetwork
  );

  useEffect(() => {
    const newSelectedNetwork = scaffoldConfig.targetNetworks.find(
      (targetNetwork) => targetNetwork.id === chain?.id
    );
    if (newSelectedNetwork && newSelectedNetwork.id !== targetNetwork.id) {
      setTargetNetwork(newSelectedNetwork);
    }
  }, [chain?.id, setTargetNetwork, targetNetwork.id]);
  // type TypeOfChainId = ReturnType<typeof useChainId<AppWagmiConfig>>;

  const result = {
    ...targetNetwork,
    ...NETWORKS_EXTRA_DATA[targetNetwork.id],
  };
  type WithNoId = Omit<typeof result, 'id'>;

  type FinalType = WithNoId & {
    id: BaluniChainId;
  };

  return useMemo(
    () => ({
      targetNetwork: result as FinalType,
    }),
    [targetNetwork]
  );
}

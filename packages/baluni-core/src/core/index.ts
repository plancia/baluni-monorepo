import { TConfig } from './types';

export { predict } from './features/ml/predict';
export { executeRebalance } from './strategies/rebalance/uniswap/main';
export { executeRebalanceV2 } from './strategies/rebalance/odos/main';

const config: { config: TConfig; pk: string; rpcUrl: string } = {
  config: null as unknown as TConfig,
  pk: '',
  rpcUrl: '',
};

export const init = (rpcUrl: string, pk: string, _config: TConfig) => {
  config.config = _config;
  config.pk = pk;
  config.rpcUrl = rpcUrl;
};

export const getConfig = () => config;

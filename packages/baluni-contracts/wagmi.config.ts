import { defineConfig } from '@wagmi/cli';
import factoryAbi from './artifacts/contracts/orchestators/BaluniV1AgentFactory.sol';
export default defineConfig({
  out: 'src/generated.ts',
  contracts: [
    {
      name: 'factoryAbi',
      abi: factoryAbi.abi,
    },
  ],
  plugins: [],
});

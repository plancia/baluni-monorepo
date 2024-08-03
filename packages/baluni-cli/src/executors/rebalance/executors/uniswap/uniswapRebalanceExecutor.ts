import * as strategies from 'baluni-core/strategies';
import cliPickers from '../../../../pickers';
import { executeRebalance } from 'packages/baluni-core/src/core';

//import _config from './config.json';
// import { baluniCli } from 'packages/baluni-cli/src/main';
// import { TConfigReturn } from 'baluni-core/types';
// import { formatConfig } from 'baluni-core/utils';
// import { BaluniCliOptions } from 'packages/baluni-cli/src/main';
// import { program } from '@commander-js/extra-typings';
// import fs from 'fs';

export default async function execute() {
  const _config = await cliPickers.configFilePicker.pick({
    message: 'Enter the configuration file path',
  });

  const _rpcUrl = await cliPickers.rpcUrlPicker.pick({
    message: 'Enter the rpc url',
  });

  const _pk = await cliPickers.privateKeyPicker.pick({
    message: 'Enter your private key',
  });

  if (!_config) {
    throw new Error('Cannot read config file ');
  }

  await strategies.uniswap(_config, _rpcUrl, _pk);
  try {
    setInterval(async () => {
      try {
        await executeRebalance(_config, _rpcUrl, _pk);
      } catch (error) {
        console.error('Error during rebalancing:', error);
      }
    }, _config.INTERVAL ?? 1000); // Add nullish coalescing operator to provide a default value
  } catch (error) {
    console.error('Error during initialization:', error);
  }
}

import { program } from '@commander-js/extra-typings';
import * as strategies from 'baluni-core/strategies';
import { TConfigReturn } from 'baluni-core/types';
import { formatConfig } from 'baluni-core/utils';
import { BaluniCliOptions } from 'packages/baluni-cli/src/main';
import cliPickers from 'packages/baluni-cli/src/pickers/indes';
import _config from './config.json';
import fs from 'fs';
// import { baluniCli } from 'packages/baluni-cli/src/main';
export default async function execute() {
  let _config = await cliPickers.configFilePicker.pick({
    message: 'Enter the configuration file path',
  });

  if (!_config) {
    throw new Error('Cannot read config file ');
  }

  const config: TConfigReturn = await formatConfig(_config);
  await strategies.uniswap(config, true);
  //   try {
  //     setInterval(async () => {
  //       try {
  //         await executeRebalance(config, true);
  //       } catch (error) {
  //         console.error('Error during rebalancing:', error);
  //       }
  //     }, config.INTERVAL ?? 1000); // Add nullish coalescing operator to provide a default value
  //   } catch (error) {
  //     console.error('Error during initialization:', error);
  //   }
}

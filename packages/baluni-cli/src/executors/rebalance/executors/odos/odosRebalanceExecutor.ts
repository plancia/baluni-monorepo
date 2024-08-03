import * as strategies from 'baluni-core/strategies';
import { TConfigReturn } from 'baluni-core/types';
import { formatConfig } from 'baluni-core/utils';
import cliPickers from 'packages/baluni-cli/src/pickers';

export default async function execute() {
  let _config = await cliPickers.configFilePicker.pick({
    message: 'Enter the configuration file path',
  });

  if (!_config) {
    throw new Error('Cannot read config file ');
  }

  const config: TConfigReturn = await formatConfig(_config);
  await strategies.odos(config, true);
}

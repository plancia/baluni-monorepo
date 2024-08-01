import fs from 'fs';
import { baluniCli, BaluniCliOptions } from '../main';
import cliPickers, { BaluniPicker } from './indes';
import { TConfig } from 'baluni-core/types';

/**
 * This is a centralized implementation of picking the path
 * of a config file.
 * It does the following:
 * - check if "--file" path has been passed to the cli
 * - if not, ask the user for the path with filePicker
 * - read the file and parse it as JSON
 * - return the parsed JSON
 */
async function pick(options: { message: string }) {
  // ask the path of a file
  const cliOptions = baluniCli.opts() as BaluniCliOptions;

  let filePath = cliOptions.file;
  if (!filePath) {
    filePath = await cliPickers.filePicker.pick(options);
  }
  if (!filePath) {
    // console.log('File path no');
    return undefined;
  }

  try {
    const json = fs.readFileSync(filePath, 'utf-8');
    const _config = JSON.parse(json);

    return _config as TConfig;
  } catch (err) {
    console.error('Error reading file at path ' + filePath, err);
    return undefined;
  }
}
type Options = {
  message: string;
};

const filePicker: BaluniPicker<TConfig, Options> = {
  pick,
};
export default filePicker;

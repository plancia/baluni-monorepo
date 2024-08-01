import configFilePicker from './configFilePicker';
import filePicker from './filePathPicker';
export type BaluniPicker<T extends any = string, O extends any = any> = {
  pick: (options: O) => Promise<T>;
};

const cliPickers = {
  filePicker,
  configFilePicker,
};

export default cliPickers;

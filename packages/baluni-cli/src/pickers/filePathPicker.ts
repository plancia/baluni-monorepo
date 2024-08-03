import inquirer from 'inquirer';
import { BaluniPicker } from '.';

/**
 * This a generic picker for file paths.
 * For now it just asks for a string
 * but there are cool file pickers out there that we can integrate in the future
 */
async function pick(options: { message: string }) {
  //ask the path of a file
  const { filePath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'filePath',
      message: options.message,
    },
  ]);
  return filePath;
}
type Options = {
  message: string;
};

const filePicker: BaluniPicker<string, Options> = {
  pick,
};
export default filePicker;

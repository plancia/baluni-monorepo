import { Command } from '@commander-js/extra-typings';
import { executors } from './executors/index';
import { welcomeMessage } from './welcome';

export type BaluniCliOptions = {
  file?: string;
  rpcUrl?: string;
  privateKey?: string;
};
welcomeMessage();

export const baluniCli = new Command();

baluniCli
  .name('baluni-cli')
  .description('Baluni command line utilities')
  .helpCommand(false)
  .helpOption(false)
  .version('0.0.1');

baluniCli.option('-f, --file <string>', 'the path to the config file');
baluniCli.option('-ru, --rpcUrl <string>', 'the rpc url');
baluniCli.option('-pk, --privateKey <string>', 'the private key');

baluniCli
  .command('rebalance')
  .description('Execute rebalance operation')
  //   .argument('<string>', 'string to split')
  .option('--target <string>', 'the target platform', '')
  //   .option('-s, --separator <char>', 'separator character', ',')
  .action(async (options) => {
    await executors.rebalance(() => {
      executors.mainMenu();
    });
  });

/**
 * if the cli is launched without any arguments, show the main menu,
 * otherwise use commander-js to easily parse the arguments
 */
if (process.argv.length <= 2) {
  executors.mainMenu();
} else {
  baluniCli.parseAsync(process.argv);
}

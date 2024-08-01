import inquirer from 'inquirer';
import { rebalanceExecutors } from './executors/rebalanceExecutors';

export default async function execute(onBack: () => void) {
  const { target } = await inquirer.prompt([
    {
      type: 'list',
      name: 'target',
      message: 'Select target platform',
      choices: ['uniswap', 'odos', 'back'],
    },
  ]);

  switch (target) {
    case 'uniswap':
      console.log('Rebalancing Uniswap');
      await rebalanceExecutors.uniswap();
      break;
    case 'odos':
      console.log('Rebalancing Odos');
      await rebalanceExecutors.odos();
      break;
    case 'back':
      onBack();
      break;
    default:
      console.log('Invalid target');
  }
}

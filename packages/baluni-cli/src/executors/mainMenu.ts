import { executors } from '.';
import inquirer from 'inquirer';

export const showMainMenu = async () => {
  const actions = [
    {
      label: 'Rebalance',
      id: 'rebalance',
    },
    {
      label: 'Other action',
      id: 'other-action',
    },
  ];

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Select action',
      choices: actions.map((action) => ({
        name: action.label,
        value: action.id,
      })),
    },
  ]);
  console.log('action is', action);

  switch (action) {
    case 'rebalance':
      executors.rebalance(() => {
        showMainMenu();
      });
      break;
    case 'other-action':
      console.log('Other action');
      break;
    default:
      console.log('Invalid action');
  }
};

import { showMainMenu } from './mainMenu';
import rebalanceExeutor from './rebalance/index';

export const executors = {
  rebalance: rebalanceExeutor,
  mainMenu: showMainMenu,
};

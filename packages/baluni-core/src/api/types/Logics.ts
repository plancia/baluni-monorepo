export type BuildResponse = {
  approvals: TransactionBase[];
  calldatas: TransactionBase[];
  tokens_return: string[];
};

export type TransactionBase = {
  to: string;
  value: bigint;
  data: string;
  gasLimit?: bigint;
  gasPrice?: bigint;
};

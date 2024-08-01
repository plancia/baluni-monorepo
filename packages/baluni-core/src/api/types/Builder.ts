export type BuildResponse = {
  txs: { to: string; value: bigint; data: string }[];
  isForAgent: boolean;
};

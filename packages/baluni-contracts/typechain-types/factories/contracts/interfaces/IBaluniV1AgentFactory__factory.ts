/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IBaluniV1AgentFactory,
  IBaluniV1AgentFactoryInterface,
} from "../../../contracts/interfaces/IBaluniV1AgentFactory";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getAgentAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getOrCreateAgent",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getRegistry",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class IBaluniV1AgentFactory__factory {
  static readonly abi = _abi;
  static createInterface(): IBaluniV1AgentFactoryInterface {
    return new Interface(_abi) as IBaluniV1AgentFactoryInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IBaluniV1AgentFactory {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as IBaluniV1AgentFactory;
  }
}

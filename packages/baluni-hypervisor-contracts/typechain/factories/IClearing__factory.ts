/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IClearing, IClearingInterface } from "../IClearing";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "pos",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "addPosition",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "deposit0",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deposit1",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "address",
        name: "pos",
        type: "address",
      },
      {
        internalType: "uint256[4]",
        name: "minIn",
        type: "uint256[4]",
      },
    ],
    name: "clearDeposit",
    outputs: [
      {
        internalType: "bool",
        name: "cleared",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "pos",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "shares",
        type: "uint256",
      },
    ],
    name: "clearShares",
    outputs: [
      {
        internalType: "bool",
        name: "cleared",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "pos",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_deposit",
        type: "uint256",
      },
    ],
    name: "getDepositAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "amountStart",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountEnd",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class IClearing__factory {
  static readonly abi = _abi;
  static createInterface(): IClearingInterface {
    return new utils.Interface(_abi) as IClearingInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IClearing {
    return new Contract(address, _abi, signerOrProvider) as IClearing;
  }
}

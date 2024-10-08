/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { ethers } from "ethers";
import {
  FactoryOptions,
  HardhatEthersHelpers as HardhatEthersHelpersBase,
} from "@nomiclabs/hardhat-ethers/types";

import * as Contracts from ".";

declare module "hardhat/types/runtime" {
  interface HardhatEthersHelpers extends HardhatEthersHelpersBase {
    getContractFactory(
      name: "Ownable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Ownable__factory>;
    getContractFactory(
      name: "ERC20Permit",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC20Permit__factory>;
    getContractFactory(
      name: "IERC20Permit",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20Permit__factory>;
    getContractFactory(
      name: "ERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC20__factory>;
    getContractFactory(
      name: "IERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20__factory>;
    getContractFactory(
      name: "IUniswapV3MintCallback",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IUniswapV3MintCallback__factory>;
    getContractFactory(
      name: "IUniswapV3Factory",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IUniswapV3Factory__factory>;
    getContractFactory(
      name: "IUniswapV3Pool",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IUniswapV3Pool__factory>;
    getContractFactory(
      name: "IUniswapV3PoolActions",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IUniswapV3PoolActions__factory>;
    getContractFactory(
      name: "IUniswapV3PoolDerivedState",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IUniswapV3PoolDerivedState__factory>;
    getContractFactory(
      name: "IUniswapV3PoolEvents",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IUniswapV3PoolEvents__factory>;
    getContractFactory(
      name: "IUniswapV3PoolImmutables",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IUniswapV3PoolImmutables__factory>;
    getContractFactory(
      name: "IUniswapV3PoolOwnerActions",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IUniswapV3PoolOwnerActions__factory>;
    getContractFactory(
      name: "IUniswapV3PoolState",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IUniswapV3PoolState__factory>;
    getContractFactory(
      name: "BaseController",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.BaseController__factory>;
    getContractFactory(
      name: "HypeController",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.HypeController__factory>;
    getContractFactory(
      name: "IHypervisorFactory",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IHypervisorFactory__factory>;
    getContractFactory(
      name: "ITokeHypervisor",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ITokeHypervisor__factory>;
    getContractFactory(
      name: "TokeHypervisor",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.TokeHypervisor__factory>;
    getContractFactory(
      name: "TokeHypervisorFactory",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.TokeHypervisorFactory__factory>;
    getContractFactory(
      name: "ClearingV2",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ClearingV2__factory>;
    getContractFactory(
      name: "Hypervisor",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Hypervisor__factory>;
    getContractFactory(
      name: "HypervisorFactory",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.HypervisorFactory__factory>;
    getContractFactory(
      name: "IHypervisor",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IHypervisor__factory>;
    getContractFactory(
      name: "IUniProxy",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IUniProxy__factory>;
    getContractFactory(
      name: "IVault",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IVault__factory>;
    getContractFactory(
      name: "Admin",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Admin__factory>;
    getContractFactory(
      name: "AutoRebal",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.AutoRebal__factory>;
    getContractFactory(
      name: "IClearing",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IClearing__factory>;
    getContractFactory(
      name: "UniProxy",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.UniProxy__factory>;

    getContractAt(
      name: "Ownable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Ownable>;
    getContractAt(
      name: "ERC20Permit",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC20Permit>;
    getContractAt(
      name: "IERC20Permit",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20Permit>;
    getContractAt(
      name: "ERC20",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC20>;
    getContractAt(
      name: "IERC20",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20>;
    getContractAt(
      name: "IUniswapV3MintCallback",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IUniswapV3MintCallback>;
    getContractAt(
      name: "IUniswapV3Factory",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IUniswapV3Factory>;
    getContractAt(
      name: "IUniswapV3Pool",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IUniswapV3Pool>;
    getContractAt(
      name: "IUniswapV3PoolActions",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IUniswapV3PoolActions>;
    getContractAt(
      name: "IUniswapV3PoolDerivedState",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IUniswapV3PoolDerivedState>;
    getContractAt(
      name: "IUniswapV3PoolEvents",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IUniswapV3PoolEvents>;
    getContractAt(
      name: "IUniswapV3PoolImmutables",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IUniswapV3PoolImmutables>;
    getContractAt(
      name: "IUniswapV3PoolOwnerActions",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IUniswapV3PoolOwnerActions>;
    getContractAt(
      name: "IUniswapV3PoolState",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IUniswapV3PoolState>;
    getContractAt(
      name: "BaseController",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.BaseController>;
    getContractAt(
      name: "HypeController",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.HypeController>;
    getContractAt(
      name: "IHypervisorFactory",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IHypervisorFactory>;
    getContractAt(
      name: "ITokeHypervisor",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ITokeHypervisor>;
    getContractAt(
      name: "TokeHypervisor",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.TokeHypervisor>;
    getContractAt(
      name: "TokeHypervisorFactory",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.TokeHypervisorFactory>;
    getContractAt(
      name: "ClearingV2",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ClearingV2>;
    getContractAt(
      name: "Hypervisor",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Hypervisor>;
    getContractAt(
      name: "HypervisorFactory",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.HypervisorFactory>;
    getContractAt(
      name: "IHypervisor",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IHypervisor>;
    getContractAt(
      name: "IUniProxy",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IUniProxy>;
    getContractAt(
      name: "IVault",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IVault>;
    getContractAt(
      name: "Admin",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Admin>;
    getContractAt(
      name: "AutoRebal",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.AutoRebal>;
    getContractAt(
      name: "IClearing",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IClearing>;
    getContractAt(
      name: "UniProxy",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.UniProxy>;

    // default types
    getContractFactory(
      name: string,
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<ethers.ContractFactory>;
    getContractFactory(
      abi: any[],
      bytecode: ethers.utils.BytesLike,
      signer?: ethers.Signer
    ): Promise<ethers.ContractFactory>;
    getContractAt(
      nameOrAbi: string | any[],
      address: string,
      signer?: ethers.Signer
    ): Promise<ethers.Contract>;
  }
}

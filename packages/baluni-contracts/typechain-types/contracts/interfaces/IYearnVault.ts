/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from "../../common";

export interface IYearnVaultInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "asset"
      | "balanceOf"
      | "convertToAssets"
      | "convertToShares"
      | "deposit"
      | "maxDeposit"
      | "maxRedeem"
      | "previewWithdraw"
      | "redeem"
      | "totalAssets"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "asset", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "balanceOf",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "convertToAssets",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "convertToShares",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "deposit",
    values: [BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "maxDeposit",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "maxRedeem",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "previewWithdraw",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "redeem",
    values: [BigNumberish, AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "totalAssets",
    values?: undefined
  ): string;

  decodeFunctionResult(functionFragment: "asset", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "convertToAssets",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "convertToShares",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "maxDeposit", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "maxRedeem", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "previewWithdraw",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "redeem", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalAssets",
    data: BytesLike
  ): Result;
}

export interface IYearnVault extends BaseContract {
  connect(runner?: ContractRunner | null): IYearnVault;
  waitForDeployment(): Promise<this>;

  interface: IYearnVaultInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  asset: TypedContractMethod<[], [string], "view">;

  balanceOf: TypedContractMethod<[owner: AddressLike], [bigint], "view">;

  convertToAssets: TypedContractMethod<
    [shares: BigNumberish],
    [bigint],
    "view"
  >;

  convertToShares: TypedContractMethod<
    [assets: BigNumberish],
    [bigint],
    "view"
  >;

  deposit: TypedContractMethod<
    [assets: BigNumberish, receiver: AddressLike],
    [bigint],
    "nonpayable"
  >;

  maxDeposit: TypedContractMethod<[receiver: AddressLike], [bigint], "view">;

  maxRedeem: TypedContractMethod<[owner: AddressLike], [bigint], "view">;

  previewWithdraw: TypedContractMethod<
    [assets: BigNumberish],
    [bigint],
    "view"
  >;

  redeem: TypedContractMethod<
    [shares: BigNumberish, receiver: AddressLike, owner: AddressLike],
    [bigint],
    "nonpayable"
  >;

  totalAssets: TypedContractMethod<[], [bigint], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "asset"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "balanceOf"
  ): TypedContractMethod<[owner: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "convertToAssets"
  ): TypedContractMethod<[shares: BigNumberish], [bigint], "view">;
  getFunction(
    nameOrSignature: "convertToShares"
  ): TypedContractMethod<[assets: BigNumberish], [bigint], "view">;
  getFunction(
    nameOrSignature: "deposit"
  ): TypedContractMethod<
    [assets: BigNumberish, receiver: AddressLike],
    [bigint],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "maxDeposit"
  ): TypedContractMethod<[receiver: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "maxRedeem"
  ): TypedContractMethod<[owner: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "previewWithdraw"
  ): TypedContractMethod<[assets: BigNumberish], [bigint], "view">;
  getFunction(
    nameOrSignature: "redeem"
  ): TypedContractMethod<
    [shares: BigNumberish, receiver: AddressLike, owner: AddressLike],
    [bigint],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "totalAssets"
  ): TypedContractMethod<[], [bigint], "view">;

  filters: {};
}

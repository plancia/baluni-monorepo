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

export interface IBaluniV1PoolPeripheryInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "batchSwap"
      | "getAmountOut"
      | "getPoolsContainingToken"
      | "getVersion"
      | "initialize"
      | "reinitialize"
      | "swapTokenForToken"
      | "swapTokensForTokens"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "batchSwap",
    values: [AddressLike[], AddressLike[], BigNumberish[], AddressLike[]]
  ): string;
  encodeFunctionData(
    functionFragment: "getAmountOut",
    values: [AddressLike, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getPoolsContainingToken",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getVersion",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "reinitialize",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "swapTokenForToken",
    values: [
      AddressLike,
      AddressLike,
      BigNumberish,
      BigNumberish,
      AddressLike,
      AddressLike,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "swapTokensForTokens",
    values: [
      AddressLike[],
      AddressLike[],
      BigNumberish,
      BigNumberish,
      AddressLike,
      BigNumberish
    ]
  ): string;

  decodeFunctionResult(functionFragment: "batchSwap", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getAmountOut",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPoolsContainingToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getVersion", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "reinitialize",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "swapTokenForToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "swapTokensForTokens",
    data: BytesLike
  ): Result;
}

export interface IBaluniV1PoolPeriphery extends BaseContract {
  connect(runner?: ContractRunner | null): IBaluniV1PoolPeriphery;
  waitForDeployment(): Promise<this>;

  interface: IBaluniV1PoolPeripheryInterface;

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

  batchSwap: TypedContractMethod<
    [
      fromTokens: AddressLike[],
      toTokens: AddressLike[],
      amounts: BigNumberish[],
      receivers: AddressLike[]
    ],
    [bigint[]],
    "nonpayable"
  >;

  getAmountOut: TypedContractMethod<
    [fromToken: AddressLike, toToken: AddressLike, amount: BigNumberish],
    [bigint],
    "view"
  >;

  getPoolsContainingToken: TypedContractMethod<
    [token: AddressLike],
    [string[]],
    "view"
  >;

  getVersion: TypedContractMethod<[], [bigint], "view">;

  initialize: TypedContractMethod<
    [_registry: AddressLike],
    [void],
    "nonpayable"
  >;

  reinitialize: TypedContractMethod<
    [_registry: AddressLike, version: BigNumberish],
    [void],
    "nonpayable"
  >;

  swapTokenForToken: TypedContractMethod<
    [
      fromToken: AddressLike,
      toToken: AddressLike,
      fromAmount: BigNumberish,
      minAmount: BigNumberish,
      from: AddressLike,
      to: AddressLike,
      deadline: BigNumberish
    ],
    [[bigint, bigint] & { amountOut: bigint; haircut: bigint }],
    "nonpayable"
  >;

  swapTokensForTokens: TypedContractMethod<
    [
      tokenPath: AddressLike[],
      poolPath: AddressLike[],
      fromAmount: BigNumberish,
      minimumToAmount: BigNumberish,
      to: AddressLike,
      deadline: BigNumberish
    ],
    [[bigint, bigint] & { amountOut: bigint; haircut: bigint }],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "batchSwap"
  ): TypedContractMethod<
    [
      fromTokens: AddressLike[],
      toTokens: AddressLike[],
      amounts: BigNumberish[],
      receivers: AddressLike[]
    ],
    [bigint[]],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "getAmountOut"
  ): TypedContractMethod<
    [fromToken: AddressLike, toToken: AddressLike, amount: BigNumberish],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "getPoolsContainingToken"
  ): TypedContractMethod<[token: AddressLike], [string[]], "view">;
  getFunction(
    nameOrSignature: "getVersion"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "initialize"
  ): TypedContractMethod<[_registry: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "reinitialize"
  ): TypedContractMethod<
    [_registry: AddressLike, version: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "swapTokenForToken"
  ): TypedContractMethod<
    [
      fromToken: AddressLike,
      toToken: AddressLike,
      fromAmount: BigNumberish,
      minAmount: BigNumberish,
      from: AddressLike,
      to: AddressLike,
      deadline: BigNumberish
    ],
    [[bigint, bigint] & { amountOut: bigint; haircut: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "swapTokensForTokens"
  ): TypedContractMethod<
    [
      tokenPath: AddressLike[],
      poolPath: AddressLike[],
      fromAmount: BigNumberish,
      minimumToAmount: BigNumberish,
      to: AddressLike,
      deadline: BigNumberish
    ],
    [[bigint, bigint] & { amountOut: bigint; haircut: bigint }],
    "nonpayable"
  >;

  filters: {};
}

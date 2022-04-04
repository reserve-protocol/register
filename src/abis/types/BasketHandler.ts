/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "./common";

export type RevenueShareStruct = {
  rTokenDist: BigNumberish;
  rsrDist: BigNumberish;
};

export type RevenueShareStructOutput = [number, number] & {
  rTokenDist: number;
  rsrDist: number;
};

export type DeploymentParamsStruct = {
  maxTradeVolume: BigNumberish;
  dist: RevenueShareStruct;
  rewardPeriod: BigNumberish;
  rewardRatio: BigNumberish;
  unstakingDelay: BigNumberish;
  tradingDelay: BigNumberish;
  auctionLength: BigNumberish;
  backingBuffer: BigNumberish;
  maxTradeSlippage: BigNumberish;
  dustAmount: BigNumberish;
  issuanceRate: BigNumberish;
};

export type DeploymentParamsStructOutput = [
  BigNumber,
  RevenueShareStructOutput,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber
] & {
  maxTradeVolume: BigNumber;
  dist: RevenueShareStructOutput;
  rewardPeriod: BigNumber;
  rewardRatio: BigNumber;
  unstakingDelay: BigNumber;
  tradingDelay: BigNumber;
  auctionLength: BigNumber;
  backingBuffer: BigNumber;
  maxTradeSlippage: BigNumber;
  dustAmount: BigNumber;
  issuanceRate: BigNumber;
};

export type ComponentsStruct = {
  rToken: string;
  stRSR: string;
  assetRegistry: string;
  basketHandler: string;
  backingManager: string;
  distributor: string;
  furnace: string;
  broker: string;
  rsrTrader: string;
  rTokenTrader: string;
};

export type ComponentsStructOutput = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string
] & {
  rToken: string;
  stRSR: string;
  assetRegistry: string;
  basketHandler: string;
  backingManager: string;
  distributor: string;
  furnace: string;
  broker: string;
  rsrTrader: string;
  rTokenTrader: string;
};

export type ConstructorArgsStruct = {
  params: DeploymentParamsStruct;
  components: ComponentsStruct;
  rsr: string;
  gnosis: string;
  assets: string[];
};

export type ConstructorArgsStructOutput = [
  DeploymentParamsStructOutput,
  ComponentsStructOutput,
  string,
  string,
  string[]
] & {
  params: DeploymentParamsStructOutput;
  components: ComponentsStructOutput;
  rsr: string;
  gnosis: string;
  assets: string[];
};

export interface BasketHandlerInterface extends utils.Interface {
  functions: {
    "basketsHeldBy(address)": FunctionFragment;
    "ensureBasket()": FunctionFragment;
    "fullyCapitalized()": FunctionFragment;
    "initComponent(address,((int192,(uint16,uint16),uint256,int192,uint256,uint256,uint256,int192,int192,int192,int192),(address,address,address,address,address,address,address,address,address,address),address,address,address[]))": FunctionFragment;
    "lastSet()": FunctionFragment;
    "main()": FunctionFragment;
    "price()": FunctionFragment;
    "quantity(address)": FunctionFragment;
    "quote(int192,uint8)": FunctionFragment;
    "setBackupConfig(bytes32,uint256,address[])": FunctionFragment;
    "setPrimeBasket(address[],int192[])": FunctionFragment;
    "status()": FunctionFragment;
    "switchBasket()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "basketsHeldBy",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "ensureBasket",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "fullyCapitalized",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "initComponent",
    values: [string, ConstructorArgsStruct]
  ): string;
  encodeFunctionData(functionFragment: "lastSet", values?: undefined): string;
  encodeFunctionData(functionFragment: "main", values?: undefined): string;
  encodeFunctionData(functionFragment: "price", values?: undefined): string;
  encodeFunctionData(functionFragment: "quantity", values: [string]): string;
  encodeFunctionData(
    functionFragment: "quote",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setBackupConfig",
    values: [BytesLike, BigNumberish, string[]]
  ): string;
  encodeFunctionData(
    functionFragment: "setPrimeBasket",
    values: [string[], BigNumberish[]]
  ): string;
  encodeFunctionData(functionFragment: "status", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "switchBasket",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "basketsHeldBy",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "ensureBasket",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "fullyCapitalized",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "initComponent",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "lastSet", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "main", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "price", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "quantity", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "quote", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setBackupConfig",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setPrimeBasket",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "status", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "switchBasket",
    data: BytesLike
  ): Result;

  events: {
    "BackupConfigSet(bytes32,uint256,address[])": EventFragment;
    "BasketSet(address[],int192[],bool)": EventFragment;
    "PrimeBasketSet(address[],int192[],bytes32[])": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "BackupConfigSet"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "BasketSet"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PrimeBasketSet"): EventFragment;
}

export type BackupConfigSetEvent = TypedEvent<
  [string, BigNumber, string[]],
  { targetName: string; max: BigNumber; erc20s: string[] }
>;

export type BackupConfigSetEventFilter = TypedEventFilter<BackupConfigSetEvent>;

export type BasketSetEvent = TypedEvent<
  [string[], BigNumber[], boolean],
  { erc20s: string[]; refAmts: BigNumber[]; defaulted: boolean }
>;

export type BasketSetEventFilter = TypedEventFilter<BasketSetEvent>;

export type PrimeBasketSetEvent = TypedEvent<
  [string[], BigNumber[], string[]],
  { erc20s: string[]; targetAmts: BigNumber[]; targetNames: string[] }
>;

export type PrimeBasketSetEventFilter = TypedEventFilter<PrimeBasketSetEvent>;

export interface BasketHandler extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: BasketHandlerInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    basketsHeldBy(
      account: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { baskets: BigNumber }>;

    ensureBasket(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    fullyCapitalized(overrides?: CallOverrides): Promise<[boolean]>;

    initComponent(
      main_: string,
      args: ConstructorArgsStruct,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    lastSet(
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { nonce: BigNumber; timestamp: BigNumber }
    >;

    main(overrides?: CallOverrides): Promise<[string]>;

    price(overrides?: CallOverrides): Promise<[BigNumber] & { p: BigNumber }>;

    quantity(erc20: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    quote(
      amount: BigNumberish,
      rounding: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [string[], BigNumber[]] & { erc20s: string[]; quantities: BigNumber[] }
    >;

    setBackupConfig(
      targetName: BytesLike,
      max: BigNumberish,
      erc20s: string[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setPrimeBasket(
      erc20s: string[],
      targetAmts: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    status(overrides?: CallOverrides): Promise<[number] & { status_: number }>;

    switchBasket(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  basketsHeldBy(account: string, overrides?: CallOverrides): Promise<BigNumber>;

  ensureBasket(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  fullyCapitalized(overrides?: CallOverrides): Promise<boolean>;

  initComponent(
    main_: string,
    args: ConstructorArgsStruct,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  lastSet(
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber] & { nonce: BigNumber; timestamp: BigNumber }
  >;

  main(overrides?: CallOverrides): Promise<string>;

  price(overrides?: CallOverrides): Promise<BigNumber>;

  quantity(erc20: string, overrides?: CallOverrides): Promise<BigNumber>;

  quote(
    amount: BigNumberish,
    rounding: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [string[], BigNumber[]] & { erc20s: string[]; quantities: BigNumber[] }
  >;

  setBackupConfig(
    targetName: BytesLike,
    max: BigNumberish,
    erc20s: string[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setPrimeBasket(
    erc20s: string[],
    targetAmts: BigNumberish[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  status(overrides?: CallOverrides): Promise<number>;

  switchBasket(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    basketsHeldBy(
      account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    ensureBasket(overrides?: CallOverrides): Promise<void>;

    fullyCapitalized(overrides?: CallOverrides): Promise<boolean>;

    initComponent(
      main_: string,
      args: ConstructorArgsStruct,
      overrides?: CallOverrides
    ): Promise<void>;

    lastSet(
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { nonce: BigNumber; timestamp: BigNumber }
    >;

    main(overrides?: CallOverrides): Promise<string>;

    price(overrides?: CallOverrides): Promise<BigNumber>;

    quantity(erc20: string, overrides?: CallOverrides): Promise<BigNumber>;

    quote(
      amount: BigNumberish,
      rounding: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [string[], BigNumber[]] & { erc20s: string[]; quantities: BigNumber[] }
    >;

    setBackupConfig(
      targetName: BytesLike,
      max: BigNumberish,
      erc20s: string[],
      overrides?: CallOverrides
    ): Promise<void>;

    setPrimeBasket(
      erc20s: string[],
      targetAmts: BigNumberish[],
      overrides?: CallOverrides
    ): Promise<void>;

    status(overrides?: CallOverrides): Promise<number>;

    switchBasket(overrides?: CallOverrides): Promise<boolean>;
  };

  filters: {
    "BackupConfigSet(bytes32,uint256,address[])"(
      targetName?: BytesLike | null,
      max?: BigNumberish | null,
      erc20s?: null
    ): BackupConfigSetEventFilter;
    BackupConfigSet(
      targetName?: BytesLike | null,
      max?: BigNumberish | null,
      erc20s?: null
    ): BackupConfigSetEventFilter;

    "BasketSet(address[],int192[],bool)"(
      erc20s?: null,
      refAmts?: null,
      defaulted?: null
    ): BasketSetEventFilter;
    BasketSet(
      erc20s?: null,
      refAmts?: null,
      defaulted?: null
    ): BasketSetEventFilter;

    "PrimeBasketSet(address[],int192[],bytes32[])"(
      erc20s?: null,
      targetAmts?: null,
      targetNames?: null
    ): PrimeBasketSetEventFilter;
    PrimeBasketSet(
      erc20s?: null,
      targetAmts?: null,
      targetNames?: null
    ): PrimeBasketSetEventFilter;
  };

  estimateGas: {
    basketsHeldBy(
      account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    ensureBasket(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    fullyCapitalized(overrides?: CallOverrides): Promise<BigNumber>;

    initComponent(
      main_: string,
      args: ConstructorArgsStruct,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    lastSet(overrides?: CallOverrides): Promise<BigNumber>;

    main(overrides?: CallOverrides): Promise<BigNumber>;

    price(overrides?: CallOverrides): Promise<BigNumber>;

    quantity(erc20: string, overrides?: CallOverrides): Promise<BigNumber>;

    quote(
      amount: BigNumberish,
      rounding: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    setBackupConfig(
      targetName: BytesLike,
      max: BigNumberish,
      erc20s: string[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setPrimeBasket(
      erc20s: string[],
      targetAmts: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    status(overrides?: CallOverrides): Promise<BigNumber>;

    switchBasket(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    basketsHeldBy(
      account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    ensureBasket(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    fullyCapitalized(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    initComponent(
      main_: string,
      args: ConstructorArgsStruct,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    lastSet(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    main(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    price(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    quantity(
      erc20: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    quote(
      amount: BigNumberish,
      rounding: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    setBackupConfig(
      targetName: BytesLike,
      max: BigNumberish,
      erc20s: string[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setPrimeBasket(
      erc20s: string[],
      targetAmts: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    status(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    switchBasket(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}

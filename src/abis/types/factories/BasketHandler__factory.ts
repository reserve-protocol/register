/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { BasketHandler, BasketHandlerInterface } from "../BasketHandler";

const _abi = [
  {
    inputs: [],
    name: "EmptyBasket",
    type: "error",
  },
  {
    inputs: [],
    name: "IntOutOfBounds",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "targetName",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "max",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "contract IERC20[]",
        name: "erc20s",
        type: "address[]",
      },
    ],
    name: "BackupConfigSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "contract IERC20[]",
        name: "erc20s",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "int192[]",
        name: "refAmts",
        type: "int192[]",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "defaulted",
        type: "bool",
      },
    ],
    name: "BasketSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "contract IERC20[]",
        name: "erc20s",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "int192[]",
        name: "targetAmts",
        type: "int192[]",
      },
      {
        indexed: false,
        internalType: "bytes32[]",
        name: "targetNames",
        type: "bytes32[]",
      },
    ],
    name: "PrimeBasketSet",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "basketsHeldBy",
    outputs: [
      {
        internalType: "int192",
        name: "baskets",
        type: "int192",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ensureBasket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "fullyCapitalized",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IMain",
        name: "main_",
        type: "address",
      },
      {
        components: [
          {
            components: [
              {
                internalType: "int192",
                name: "maxTradeVolume",
                type: "int192",
              },
              {
                components: [
                  {
                    internalType: "uint16",
                    name: "rTokenDist",
                    type: "uint16",
                  },
                  {
                    internalType: "uint16",
                    name: "rsrDist",
                    type: "uint16",
                  },
                ],
                internalType: "struct RevenueShare",
                name: "dist",
                type: "tuple",
              },
              {
                internalType: "uint256",
                name: "rewardPeriod",
                type: "uint256",
              },
              {
                internalType: "int192",
                name: "rewardRatio",
                type: "int192",
              },
              {
                internalType: "uint256",
                name: "unstakingDelay",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "tradingDelay",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "auctionLength",
                type: "uint256",
              },
              {
                internalType: "int192",
                name: "backingBuffer",
                type: "int192",
              },
              {
                internalType: "int192",
                name: "maxTradeSlippage",
                type: "int192",
              },
              {
                internalType: "int192",
                name: "dustAmount",
                type: "int192",
              },
              {
                internalType: "int192",
                name: "issuanceRate",
                type: "int192",
              },
            ],
            internalType: "struct DeploymentParams",
            name: "params",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "contract IRToken",
                name: "rToken",
                type: "address",
              },
              {
                internalType: "contract IStRSR",
                name: "stRSR",
                type: "address",
              },
              {
                internalType: "contract IAssetRegistry",
                name: "assetRegistry",
                type: "address",
              },
              {
                internalType: "contract IBasketHandler",
                name: "basketHandler",
                type: "address",
              },
              {
                internalType: "contract IBackingManager",
                name: "backingManager",
                type: "address",
              },
              {
                internalType: "contract IDistributor",
                name: "distributor",
                type: "address",
              },
              {
                internalType: "contract IFurnace",
                name: "furnace",
                type: "address",
              },
              {
                internalType: "contract IBroker",
                name: "broker",
                type: "address",
              },
              {
                internalType: "contract IRevenueTrader",
                name: "rsrTrader",
                type: "address",
              },
              {
                internalType: "contract IRevenueTrader",
                name: "rTokenTrader",
                type: "address",
              },
            ],
            internalType: "struct Components",
            name: "components",
            type: "tuple",
          },
          {
            internalType: "contract IERC20",
            name: "rsr",
            type: "address",
          },
          {
            internalType: "contract IGnosis",
            name: "gnosis",
            type: "address",
          },
          {
            internalType: "contract IAsset[]",
            name: "assets",
            type: "address[]",
          },
        ],
        internalType: "struct ConstructorArgs",
        name: "args",
        type: "tuple",
      },
    ],
    name: "initComponent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "lastSet",
    outputs: [
      {
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "main",
    outputs: [
      {
        internalType: "contract IMain",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "price",
    outputs: [
      {
        internalType: "int192",
        name: "p",
        type: "int192",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "erc20",
        type: "address",
      },
    ],
    name: "quantity",
    outputs: [
      {
        internalType: "int192",
        name: "",
        type: "int192",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "int192",
        name: "amount",
        type: "int192",
      },
      {
        internalType: "enum RoundingApproach",
        name: "rounding",
        type: "uint8",
      },
    ],
    name: "quote",
    outputs: [
      {
        internalType: "address[]",
        name: "erc20s",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "quantities",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "targetName",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "max",
        type: "uint256",
      },
      {
        internalType: "contract IERC20[]",
        name: "erc20s",
        type: "address[]",
      },
    ],
    name: "setBackupConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC20[]",
        name: "erc20s",
        type: "address[]",
      },
      {
        internalType: "int192[]",
        name: "targetAmts",
        type: "int192[]",
      },
    ],
    name: "setPrimeBasket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "status",
    outputs: [
      {
        internalType: "enum CollateralStatus",
        name: "status_",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "switchBasket",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class BasketHandler__factory {
  static readonly abi = _abi;
  static createInterface(): BasketHandlerInterface {
    return new utils.Interface(_abi) as BasketHandlerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): BasketHandler {
    return new Contract(address, _abi, signerOrProvider) as BasketHandler;
  }
}

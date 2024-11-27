import AssetRegistry from 'abis/AssetRegistry'
import BasketHandler from 'abis/BasketHandler'
import Broker from 'abis/Broker'
import StRSR from 'abis/StRSR'
import Timelock from 'abis/Timelock'
import { commonCalls } from './common_calls'
import { encodeFunctionData, parseEther } from 'viem'

export const hyusdCalls = [
  ...commonCalls,
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'register',
    args: ['0x890FAa00C16EAD6AA76F18A1A7fe9C40838F9122'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'register',
    args: ['0xCBE084C44e7A2223F76362Dcc4EbDacA5Fb1cbA7'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'swapRegistered',
    args: ['0x3C0a9143063Fc306F7D3cBB923ff4879d70Cf1EA'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'swapRegistered',
    args: ['0x33C1665Eb1b3673213Daa5f068ae1026fC8D5875'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'swapRegistered',
    args: ['0x7edD40933DfdA0ecEe1ad3E61a5044962284e1A6'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'swapRegistered',
    args: ['0xBE9D23040fe22E8Bd8A88BF5101061557355cA04'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'swapRegistered',
    args: ['0x58D7bF13D3572b08dE5d96373b8097d94B1325ad'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'swapRegistered',
    args: ['0x2f98bA77a8ca1c630255c4517b1b3878f6e60C89'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'swapRegistered',
    args: ['0x45B950AF443281c5F67c2c7A1d9bBc325ECb8eEA'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'swapRegistered',
    args: ['0x4024c00bBD0C420E719527D88781bc1543e63dd5'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'swapRegistered',
    args: ['0x63a2a4cca871d9e394da5ec04675de8cb285663f'],
  }),
  encodeFunctionData({
    abi: BasketHandler,
    functionName: 'setPrimeBasket',
    args: [
      [
        '0x465a5a630482f3abD6d3b84B39B29b07214d19e5',
        '0xe2bA8693cE7474900A045757fe0efCa900F6530b',
        '0x3BECE5EC596331033726E5C6C188c313Ff4E3fE5',
        '0x9FF9c353136e86EFe02ADD177E7c9769f8a5A77F',
      ],
      [
        BigInt('135000000000000009'),
        BigInt('135000000000000009'),
        BigInt('364999999999999991'),
        BigInt('364999999999999991'),
      ],
    ],
  }),
  encodeFunctionData({
    abi: BasketHandler,
    functionName: 'refreshBasket',
  }),
  encodeFunctionData({
    abi: Timelock,
    functionName: 'grantRole',
    args: [
      '0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63',
      '0x22d7937438b4bBf02f6cA55E3831ABB94Bd0b6f1',
    ],
  }),
  encodeFunctionData({
    abi: Timelock,
    functionName: 'revokeRole',
    args: [
      '0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63',
      '0x0000000000000000000000000000000000000000',
    ],
  }),
  encodeFunctionData({
    abi: BasketHandler,
    functionName: 'setWarmupPeriod',
    args: [900],
  }),
  encodeFunctionData({
    abi: StRSR,
    functionName: 'setWithdrawalLeak',
    args: [parseEther('0.05')],
  }),
  encodeFunctionData({
    abi: Broker,
    functionName: 'setBatchTradeImplementation',
    args: ['0x4e9B97957a0d1F4c25E42Ccc69E4d2665433FEA3'],
  }),
  encodeFunctionData({
    abi: Broker,
    functionName: 'setDutchTradeImplementation',
    args: ['0x2387C22727ACb91519b80A15AEf393ad40dFdb2F'],
  }),
  encodeFunctionData({
    abi: Broker,
    functionName: 'setDutchAuctionLength',
    args: [1800],
  }),
]

export const hyusdAddresses = [
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0x61691c4181F876Dd7e19D6742B367B48AA280ed3',
  '0x9119DB28432bd97aBF4c3D81B929849e0490c7A6',
  '0x44344ca9014BE4bB622037224d107493586f35ed',
  '0x0297941cCB71f5595072C4fA34CE443b6C5b47A0',
  '0x43D806BB6cDfA1dde1D1754c5F2Ea28adC3bc0E8',
  '0x2cabaa8010b3fbbDEeBe4a2D0fEffC2ed155bf37',
  '0x0771301d56Eb734a5F61d275Da1b6c2459a00dc7',
  '0x4886f5549d3b25adCFaC68E40062c735faf81378',
  '0xaCdf0DBA4B9839b96221a8487e9ca660a48212be',
  '0x7Db3C57001c80644208fb8AA81bA1200C7B0731d',
  '0x61691c4181F876Dd7e19D6742B367B48AA280ed3',
  '0x0297941cCB71f5595072C4fA34CE443b6C5b47A0',
  '0x0771301d56Eb734a5F61d275Da1b6c2459a00dc7',
  '0x4886f5549d3b25adCFaC68E40062c735faf81378',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0x9119DB28432bd97aBF4c3D81B929849e0490c7A6',
  '0x9119DB28432bd97aBF4c3D81B929849e0490c7A6',
  '0x624f9f076ED42ba3B37C3011dC5a1761C2209E1C',
  '0x624f9f076ED42ba3B37C3011dC5a1761C2209E1C',
  '0x9119DB28432bd97aBF4c3D81B929849e0490c7A6',
  '0x7Db3C57001c80644208fb8AA81bA1200C7B0731d',
  '0x44344ca9014BE4bB622037224d107493586f35ed',
  '0x44344ca9014BE4bB622037224d107493586f35ed',
  '0x44344ca9014BE4bB622037224d107493586f35ed',
]

export const hyusdBasketChangeCalls = [
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'register',
    args: ['0xd000a79bd2a07eb6d2e02ecad73437de40e52d69'],
  }),
  encodeFunctionData({
    abi: AssetRegistry,
    functionName: 'register',
    args: ['0xde0e2f0c9792617d3908d92a024caa846354cea2'],
  }),
  encodeFunctionData({
    abi: BasketHandler,
    functionName: 'setPrimeBasket',
    args: [
      [
        '0x465a5a630482f3abD6d3b84B39B29b07214d19e5',
        '0x3BECE5EC596331033726E5C6C188c313Ff4E3fE5',
        '0xaA91d24c2F7DBb6487f61869cD8cd8aFd5c5Cab2',
        '0x83F20F44975D03b1b09e64809B757c47f942BEeA',
      ],
      [
        BigInt('135000000000000009'),
        BigInt('364999999999999991'),
        BigInt('250000000000000000'),
        BigInt('250000000000000000'),
      ],
    ],
  }),
  encodeFunctionData({
    abi: BasketHandler,
    functionName: 'refreshBasket',
  }),
]

export const hyusdBasketChangeAddresses = [
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0xaCacddeE9b900b7535B13Cd8662df130265b8c78',
  '0x9119DB28432bd97aBF4c3D81B929849e0490c7A6',
  '0x9119DB28432bd97aBF4c3D81B929849e0490c7A6',
]

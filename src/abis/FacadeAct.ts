export default [
  {
    inputs: [],
    name: 'UIntOutOfBounds',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'contract IRToken',
        name: 'rToken',
        type: 'address',
      },
    ],
    name: 'claimRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes[]',
        name: 'data',
        type: 'bytes[]',
      },
    ],
    name: 'multicall',
    outputs: [
      {
        internalType: 'bytes[]',
        name: 'results',
        type: 'bytes[]',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IBackingManager',
        name: 'bm',
        type: 'address',
      },
      {
        internalType: 'enum TradeKind',
        name: 'kind',
        type: 'uint8',
      },
    ],
    name: 'nextRecollateralizationAuction',
    outputs: [
      {
        internalType: 'bool',
        name: 'canStart',
        type: 'bool',
      },
      {
        internalType: 'contract IERC20',
        name: 'sell',
        type: 'address',
      },
      {
        internalType: 'contract IERC20',
        name: 'buy',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'sellAmount',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IRevenueTrader',
        name: 'revenueTrader',
        type: 'address',
      },
    ],
    name: 'revenueOverview',
    outputs: [
      {
        internalType: 'contract IERC20[]',
        name: 'erc20s',
        type: 'address[]',
      },
      {
        internalType: 'bool[]',
        name: 'canStart',
        type: 'bool[]',
      },
      {
        internalType: 'uint256[]',
        name: 'surpluses',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: 'minTradeAmounts',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: 'bmRewards',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: 'revTraderRewards',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IRevenueTrader',
        name: 'revenueTrader',
        type: 'address',
      },
      {
        internalType: 'contract IERC20[]',
        name: 'toSettle',
        type: 'address[]',
      },
      {
        internalType: 'contract IERC20[]',
        name: 'toStart',
        type: 'address[]',
      },
      {
        internalType: 'enum TradeKind[]',
        name: 'kinds',
        type: 'uint8[]',
      },
    ],
    name: 'runRevenueAuctions',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

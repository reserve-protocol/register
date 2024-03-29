export default [
  {
    inputs: [
      {
        internalType: 'uint48',
        name: 'priceTimeout_',
        type: 'uint48',
      },
      {
        internalType: 'contract AggregatorV3Interface',
        name: 'chainlinkFeed_',
        type: 'address',
      },
      {
        internalType: 'uint192',
        name: 'oracleError_',
        type: 'uint192',
      },
      {
        internalType: 'contract IERC20Metadata',
        name: 'erc20_',
        type: 'address',
      },
      {
        internalType: 'uint192',
        name: 'maxTradeVolume_',
        type: 'uint192',
      },
      {
        internalType: 'uint48',
        name: 'oracleTimeout_',
        type: 'uint48',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'StalePrice',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UIntOutOfBounds',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ZeroPrice',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IERC20',
        name: 'erc20',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'RewardsClaimed',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'bal',
    outputs: [
      {
        internalType: 'uint192',
        name: '',
        type: 'uint192',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'chainlinkFeed',
    outputs: [
      {
        internalType: 'contract AggregatorV3Interface',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'erc20',
    outputs: [
      {
        internalType: 'contract IERC20Metadata',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'erc20Decimals',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isCollateral',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastSave',
    outputs: [
      {
        internalType: 'uint48',
        name: '',
        type: 'uint48',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lotPrice',
    outputs: [
      {
        internalType: 'uint192',
        name: 'lotLow',
        type: 'uint192',
      },
      {
        internalType: 'uint192',
        name: 'lotHigh',
        type: 'uint192',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxTradeVolume',
    outputs: [
      {
        internalType: 'uint192',
        name: '',
        type: 'uint192',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'oracleError',
    outputs: [
      {
        internalType: 'uint192',
        name: '',
        type: 'uint192',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'oracleTimeout',
    outputs: [
      {
        internalType: 'uint48',
        name: '',
        type: 'uint48',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'price',
    outputs: [
      {
        internalType: 'uint192',
        name: '',
        type: 'uint192',
      },
      {
        internalType: 'uint192',
        name: '',
        type: 'uint192',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'priceTimeout',
    outputs: [
      {
        internalType: 'uint48',
        name: '',
        type: 'uint48',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'refresh',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'savedHighPrice',
    outputs: [
      {
        internalType: 'uint192',
        name: '',
        type: 'uint192',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'savedLowPrice',
    outputs: [
      {
        internalType: 'uint192',
        name: '',
        type: 'uint192',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'tryPrice',
    outputs: [
      {
        internalType: 'uint192',
        name: 'low',
        type: 'uint192',
      },
      {
        internalType: 'uint192',
        name: 'high',
        type: 'uint192',
      },
      {
        internalType: 'uint192',
        name: '',
        type: 'uint192',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
] as const

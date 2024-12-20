export default [
  {
    inputs: [
      {
        components: [
          { internalType: 'uint48', name: 'priceTimeout', type: 'uint48' },
          {
            internalType: 'contract AggregatorV3Interface',
            name: 'chainlinkFeed',
            type: 'address',
          },
          { internalType: 'uint192', name: 'oracleError', type: 'uint192' },
          {
            internalType: 'contract IERC20Metadata',
            name: 'erc20',
            type: 'address',
          },
          { internalType: 'uint192', name: 'maxTradeVolume', type: 'uint192' },
          { internalType: 'uint48', name: 'oracleTimeout', type: 'uint48' },
          { internalType: 'bytes32', name: 'targetName', type: 'bytes32' },
          {
            internalType: 'uint192',
            name: 'defaultThreshold',
            type: 'uint192',
          },
          { internalType: 'uint48', name: 'delayUntilDefault', type: 'uint48' },
        ],
        internalType: 'struct CollateralConfig',
        name: 'config',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'contract IAeroPool', name: 'pool', type: 'address' },
          {
            internalType: 'enum AerodromePoolTokens.AeroPoolType',
            name: 'poolType',
            type: 'uint8',
          },
          {
            internalType: 'contract AggregatorV3Interface[][]',
            name: 'feeds',
            type: 'address[][]',
          },
          {
            internalType: 'uint48[][]',
            name: 'oracleTimeouts',
            type: 'uint48[][]',
          },
          {
            internalType: 'uint192[][]',
            name: 'oracleErrors',
            type: 'uint192[][]',
          },
        ],
        internalType: 'struct AerodromePoolTokens.APTConfiguration',
        name: 'aptConfig',
        type: 'tuple',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], name: 'InvalidPrice', type: 'error' },
  {
    inputs: [{ internalType: 'uint8', name: 'tokenNumber', type: 'uint8' }],
    name: 'NoToken',
    type: 'error',
  },
  { inputs: [], name: 'StalePrice', type: 'error' },
  { inputs: [], name: 'UIntOutOfBounds', type: 'error' },
  {
    inputs: [{ internalType: 'uint8', name: 'maxLength', type: 'uint8' }],
    name: 'WrongIndex',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'enum CollateralStatus',
        name: 'oldStatus',
        type: 'uint8',
      },
      {
        indexed: true,
        internalType: 'enum CollateralStatus',
        name: 'newStatus',
        type: 'uint8',
      },
    ],
    name: 'CollateralStatusChanged',
    type: 'event',
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
    inputs: [],
    name: 'MAX_HIGH_PRICE_BUFFER',
    outputs: [{ internalType: 'uint192', name: '', type: 'uint192' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'bal',
    outputs: [{ internalType: 'uint192', name: '', type: 'uint192' }],
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
    name: 'delayUntilDefault',
    outputs: [{ internalType: 'uint48', name: '', type: 'uint48' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'erc20',
    outputs: [
      { internalType: 'contract IERC20Metadata', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'erc20Decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isCollateral',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastSave',
    outputs: [{ internalType: 'uint48', name: '', type: 'uint48' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lotPrice',
    outputs: [
      { internalType: 'uint192', name: 'lotLow', type: 'uint192' },
      { internalType: 'uint192', name: 'lotHigh', type: 'uint192' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxOracleTimeout',
    outputs: [{ internalType: 'uint48', name: '', type: 'uint48' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxTradeVolume',
    outputs: [{ internalType: 'uint192', name: '', type: 'uint192' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'oracleError',
    outputs: [{ internalType: 'uint192', name: '', type: 'uint192' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'oracleTimeout',
    outputs: [{ internalType: 'uint48', name: '', type: 'uint48' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pegBottom',
    outputs: [{ internalType: 'uint192', name: '', type: 'uint192' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pegTop',
    outputs: [{ internalType: 'uint192', name: '', type: 'uint192' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pool',
    outputs: [
      { internalType: 'contract IAeroPool', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'poolType',
    outputs: [
      {
        internalType: 'enum AerodromePoolTokens.AeroPoolType',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'price',
    outputs: [
      { internalType: 'uint192', name: '_low', type: 'uint192' },
      { internalType: 'uint192', name: '_high', type: 'uint192' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'priceTimeout',
    outputs: [{ internalType: 'uint48', name: '', type: 'uint48' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'refPerTok',
    outputs: [{ internalType: 'uint192', name: '', type: 'uint192' }],
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
    outputs: [{ internalType: 'uint192', name: '', type: 'uint192' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'savedLowPrice',
    outputs: [{ internalType: 'uint192', name: '', type: 'uint192' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'savedPegPrice',
    outputs: [{ internalType: 'uint192', name: '', type: 'uint192' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'status',
    outputs: [
      { internalType: 'enum CollateralStatus', name: '', type: 'uint8' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'targetName',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'targetPerRef',
    outputs: [{ internalType: 'uint192', name: '', type: 'uint192' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint8', name: 'index', type: 'uint8' }],
    name: 'tokenFeeds',
    outputs: [
      {
        internalType: 'contract AggregatorV3Interface[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint8', name: 'index', type: 'uint8' }],
    name: 'tokenPrice',
    outputs: [
      { internalType: 'uint192', name: 'low', type: 'uint192' },
      { internalType: 'uint192', name: 'high', type: 'uint192' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint8', name: 'index', type: 'uint8' }],
    name: 'tokenReserve',
    outputs: [{ internalType: 'uint192', name: '', type: 'uint192' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'tryPrice',
    outputs: [
      { internalType: 'uint192', name: 'low', type: 'uint192' },
      { internalType: 'uint192', name: 'high', type: 'uint192' },
      { internalType: 'uint192', name: 'pegPrice', type: 'uint192' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'whenDefault',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export default [
  {
    inputs: [
      {
        internalType: 'contract IERC20Metadata',
        name: 'rsr_',
        type: 'address',
      },
      {
        internalType: 'contract IGnosis',
        name: 'gnosis_',
        type: 'address',
      },
      {
        internalType: 'contract IAsset',
        name: 'rsrAsset_',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'contract IMain',
            name: 'main',
            type: 'address',
          },
          {
            components: [
              {
                internalType: 'contract IRToken',
                name: 'rToken',
                type: 'address',
              },
              {
                internalType: 'contract IStRSR',
                name: 'stRSR',
                type: 'address',
              },
              {
                internalType: 'contract IAssetRegistry',
                name: 'assetRegistry',
                type: 'address',
              },
              {
                internalType: 'contract IBasketHandler',
                name: 'basketHandler',
                type: 'address',
              },
              {
                internalType: 'contract IBackingManager',
                name: 'backingManager',
                type: 'address',
              },
              {
                internalType: 'contract IDistributor',
                name: 'distributor',
                type: 'address',
              },
              {
                internalType: 'contract IFurnace',
                name: 'furnace',
                type: 'address',
              },
              {
                internalType: 'contract IBroker',
                name: 'broker',
                type: 'address',
              },
              {
                internalType: 'contract IRevenueTrader',
                name: 'rsrTrader',
                type: 'address',
              },
              {
                internalType: 'contract IRevenueTrader',
                name: 'rTokenTrader',
                type: 'address',
              },
            ],
            internalType: 'struct Components',
            name: 'components',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'contract ITrade',
                name: 'gnosisTrade',
                type: 'address',
              },
              {
                internalType: 'contract ITrade',
                name: 'dutchTrade',
                type: 'address',
              },
            ],
            internalType: 'struct TradePlugins',
            name: 'trading',
            type: 'tuple',
          },
        ],
        internalType: 'struct Implementations',
        name: 'implementations_',
        type: 'tuple',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IMain',
        name: 'main',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'contract IRToken',
        name: 'rToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'contract IStRSR',
        name: 'stRSR',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'version',
        type: 'string',
      },
    ],
    name: 'RTokenCreated',
    type: 'event',
  },
  {
    inputs: [],
    name: 'ENS',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'symbol',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'mandate',
        type: 'string',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'uint16',
                name: 'rTokenDist',
                type: 'uint16',
              },
              {
                internalType: 'uint16',
                name: 'rsrDist',
                type: 'uint16',
              },
            ],
            internalType: 'struct RevenueShare',
            name: 'dist',
            type: 'tuple',
          },
          {
            internalType: 'uint192',
            name: 'minTradeVolume',
            type: 'uint192',
          },
          {
            internalType: 'uint192',
            name: 'rTokenMaxTradeVolume',
            type: 'uint192',
          },
          {
            internalType: 'uint48',
            name: 'shortFreeze',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'longFreeze',
            type: 'uint48',
          },
          {
            internalType: 'uint192',
            name: 'rewardRatio',
            type: 'uint192',
          },
          {
            internalType: 'uint48',
            name: 'unstakingDelay',
            type: 'uint48',
          },
          {
            internalType: 'uint192',
            name: 'withdrawalLeak',
            type: 'uint192',
          },
          {
            internalType: 'uint48',
            name: 'warmupPeriod',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'tradingDelay',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'batchAuctionLength',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'dutchAuctionLength',
            type: 'uint48',
          },
          {
            internalType: 'uint192',
            name: 'backingBuffer',
            type: 'uint192',
          },
          {
            internalType: 'uint192',
            name: 'maxTradeSlippage',
            type: 'uint192',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'amtRate',
                type: 'uint256',
              },
              {
                internalType: 'uint192',
                name: 'pctRate',
                type: 'uint192',
              },
            ],
            internalType: 'struct ThrottleLib.Params',
            name: 'issuanceThrottle',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'amtRate',
                type: 'uint256',
              },
              {
                internalType: 'uint192',
                name: 'pctRate',
                type: 'uint192',
              },
            ],
            internalType: 'struct ThrottleLib.Params',
            name: 'redemptionThrottle',
            type: 'tuple',
          },
        ],
        internalType: 'struct DeploymentParams',
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'deploy',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'gnosis',
    outputs: [
      {
        internalType: 'contract IGnosis',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'implementations',
    outputs: [
      {
        internalType: 'contract IMain',
        name: 'main',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'contract IRToken',
            name: 'rToken',
            type: 'address',
          },
          {
            internalType: 'contract IStRSR',
            name: 'stRSR',
            type: 'address',
          },
          {
            internalType: 'contract IAssetRegistry',
            name: 'assetRegistry',
            type: 'address',
          },
          {
            internalType: 'contract IBasketHandler',
            name: 'basketHandler',
            type: 'address',
          },
          {
            internalType: 'contract IBackingManager',
            name: 'backingManager',
            type: 'address',
          },
          {
            internalType: 'contract IDistributor',
            name: 'distributor',
            type: 'address',
          },
          {
            internalType: 'contract IFurnace',
            name: 'furnace',
            type: 'address',
          },
          {
            internalType: 'contract IBroker',
            name: 'broker',
            type: 'address',
          },
          {
            internalType: 'contract IRevenueTrader',
            name: 'rsrTrader',
            type: 'address',
          },
          {
            internalType: 'contract IRevenueTrader',
            name: 'rTokenTrader',
            type: 'address',
          },
        ],
        internalType: 'struct Components',
        name: 'components',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'contract ITrade',
            name: 'gnosisTrade',
            type: 'address',
          },
          {
            internalType: 'contract ITrade',
            name: 'dutchTrade',
            type: 'address',
          },
        ],
        internalType: 'struct TradePlugins',
        name: 'trading',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rsr',
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
    name: 'rsrAsset',
    outputs: [
      {
        internalType: 'contract IAsset',
        name: '',
        type: 'address',
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

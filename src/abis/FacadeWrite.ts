export default [
  {
    inputs: [
      {
        internalType: 'contract IDeployer',
        name: 'deployer_',
        type: 'address',
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
        internalType: 'contract IRToken',
        name: 'rToken',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'governance',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'timelock',
        type: 'address',
      },
    ],
    name: 'GovernanceCreated',
    type: 'event',
  },
  {
    inputs: [
      {
        components: [
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
                internalType: 'bool',
                name: 'reweightable',
                type: 'bool',
              },
              {
                internalType: 'bool',
                name: 'enableIssuancePremium',
                type: 'bool',
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
        internalType: 'struct ConfigurationParams',
        name: 'config',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'contract IAsset[]',
            name: 'assets',
            type: 'address[]',
          },
          {
            internalType: 'contract ICollateral[]',
            name: 'primaryBasket',
            type: 'address[]',
          },
          {
            internalType: 'uint192[]',
            name: 'weights',
            type: 'uint192[]',
          },
          {
            components: [
              {
                internalType: 'bytes32',
                name: 'backupUnit',
                type: 'bytes32',
              },
              {
                internalType: 'uint256',
                name: 'diversityFactor',
                type: 'uint256',
              },
              {
                internalType: 'contract ICollateral[]',
                name: 'backupCollateral',
                type: 'address[]',
              },
            ],
            internalType: 'struct BackupInfo[]',
            name: 'backups',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'beneficiary',
                type: 'address',
              },
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
                name: 'revShare',
                type: 'tuple',
              },
            ],
            internalType: 'struct BeneficiaryInfo[]',
            name: 'beneficiaries',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct SetupParams',
        name: 'setup',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'contract VersionRegistry',
            name: 'versionRegistry',
            type: 'address',
          },
          {
            internalType: 'contract AssetPluginRegistry',
            name: 'assetPluginRegistry',
            type: 'address',
          },
          {
            internalType: 'contract DAOFeeRegistry',
            name: 'daoFeeRegistry',
            type: 'address',
          },
          {
            internalType: 'contract ITrustedFillerRegistry',
            name: 'trustedFillerRegistry',
            type: 'address',
          },
        ],
        internalType: 'struct IDeployer.Registries',
        name: 'registries',
        type: 'tuple',
      },
    ],
    name: 'deployRToken',
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
    name: 'deployer',
    outputs: [
      {
        internalType: 'contract IDeployer',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IRToken',
        name: 'rToken',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'deployGovernance',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'unpause',
        type: 'bool',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'votingDelay',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'votingPeriod',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'proposalThresholdAsMicroPercent',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'quorumPercent',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'timelockDelay',
            type: 'uint256',
          },
        ],
        internalType: 'struct GovernanceParams',
        name: 'govParams',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'guardian',
            type: 'address',
          },
          {
            internalType: 'address[]',
            name: 'pausers',
            type: 'address[]',
          },
          {
            internalType: 'address[]',
            name: 'shortFreezers',
            type: 'address[]',
          },
          {
            internalType: 'address[]',
            name: 'longFreezers',
            type: 'address[]',
          },
        ],
        internalType: 'struct GovernanceRoles',
        name: 'govRoles',
        type: 'tuple',
      },
    ],
    name: 'setupGovernance',
    outputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export default [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_daoFeeRegistry',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_versionRegistry',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_governanceDeployer',
        type: 'address',
        internalType: 'contract IGovernanceDeployer',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'daoFeeRegistry',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'deployFolio',
    inputs: [
      {
        name: 'basicDetails',
        type: 'tuple',
        internalType: 'struct IFolio.FolioBasicDetails',
        components: [
          {
            name: 'name',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'symbol',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'assets',
            type: 'address[]',
            internalType: 'address[]',
          },
          {
            name: 'amounts',
            type: 'uint256[]',
            internalType: 'uint256[]',
          },
          {
            name: 'initialShares',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: 'additionalDetails',
        type: 'tuple',
        internalType: 'struct IFolio.FolioAdditionalDetails',
        components: [
          {
            name: 'auctionDelay',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'auctionLength',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'feeRecipients',
            type: 'tuple[]',
            internalType: 'struct IFolio.FeeRecipient[]',
            components: [
              {
                name: 'recipient',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'portion',
                type: 'uint96',
                internalType: 'uint96',
              },
            ],
          },
          {
            name: 'tvlFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'mintFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'mandate',
            type: 'string',
            internalType: 'string',
          },
        ],
      },
      {
        name: 'owner',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'auctionApprovers',
        type: 'address[]',
        internalType: 'address[]',
      },
      {
        name: 'auctionLaunchers',
        type: 'address[]',
        internalType: 'address[]',
      },
      {
        name: 'brandManagers',
        type: 'address[]',
        internalType: 'address[]',
      },
      {
        name: 'deploymentNonce',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'folio',
        type: 'address',
        internalType: 'contract Folio',
      },
      {
        name: 'proxyAdmin',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'deployGovernedFolio',
    inputs: [
      {
        name: 'stToken',
        type: 'address',
        internalType: 'contract IVotes',
      },
      {
        name: 'basicDetails',
        type: 'tuple',
        internalType: 'struct IFolio.FolioBasicDetails',
        components: [
          {
            name: 'name',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'symbol',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'assets',
            type: 'address[]',
            internalType: 'address[]',
          },
          {
            name: 'amounts',
            type: 'uint256[]',
            internalType: 'uint256[]',
          },
          {
            name: 'initialShares',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: 'additionalDetails',
        type: 'tuple',
        internalType: 'struct IFolio.FolioAdditionalDetails',
        components: [
          {
            name: 'auctionDelay',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'auctionLength',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'feeRecipients',
            type: 'tuple[]',
            internalType: 'struct IFolio.FeeRecipient[]',
            components: [
              {
                name: 'recipient',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'portion',
                type: 'uint96',
                internalType: 'uint96',
              },
            ],
          },
          {
            name: 'tvlFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'mintFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'mandate',
            type: 'string',
            internalType: 'string',
          },
        ],
      },
      {
        name: 'ownerGovParams',
        type: 'tuple',
        internalType: 'struct IGovernanceDeployer.GovParams',
        components: [
          {
            name: 'votingDelay',
            type: 'uint48',
            internalType: 'uint48',
          },
          {
            name: 'votingPeriod',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'proposalThreshold',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'quorumPercent',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'timelockDelay',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'guardians',
            type: 'address[]',
            internalType: 'address[]',
          },
        ],
      },
      {
        name: 'tradingGovParams',
        type: 'tuple',
        internalType: 'struct IGovernanceDeployer.GovParams',
        components: [
          {
            name: 'votingDelay',
            type: 'uint48',
            internalType: 'uint48',
          },
          {
            name: 'votingPeriod',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'proposalThreshold',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'quorumPercent',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'timelockDelay',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'guardians',
            type: 'address[]',
            internalType: 'address[]',
          },
        ],
      },
      {
        name: 'govRoles',
        type: 'tuple',
        internalType: 'struct IGovernanceDeployer.GovRoles',
        components: [
          {
            name: 'existingAuctionApprovers',
            type: 'address[]',
            internalType: 'address[]',
          },
          {
            name: 'auctionLaunchers',
            type: 'address[]',
            internalType: 'address[]',
          },
          {
            name: 'brandManagers',
            type: 'address[]',
            internalType: 'address[]',
          },
        ],
      },
      {
        name: 'deploymentNonce',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'folio',
        type: 'address',
        internalType: 'contract Folio',
      },
      {
        name: 'proxyAdmin',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'ownerGovernor',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'ownerTimelock',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'tradingGovernor',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'tradingTimelock',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'folioImplementation',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'governanceDeployer',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IGovernanceDeployer',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'version',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'versionRegistry',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'FolioDeployed',
    inputs: [
      {
        name: 'folioOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'folio',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'folioAdmin',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'GovernedFolioDeployed',
    inputs: [
      {
        name: 'stToken',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'folio',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'ownerGovernor',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'ownerTimelock',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'tradingGovernor',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'tradingTimelock',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'FolioDeployer__LengthMismatch',
    inputs: [],
  },
  {
    type: 'error',
    name: 'SafeERC20FailedOperation',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
] as const

export default [
  {
    inputs: [
      { internalType: 'address', name: '_daoFeeRegistry', type: 'address' },
      { internalType: 'address', name: '_versionRegistry', type: 'address' },
      {
        internalType: 'address',
        name: '_trustedFillerRegistry',
        type: 'address',
      },
      {
        internalType: 'contract IGovernanceDeployer',
        name: '_governanceDeployer',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], name: 'FolioDeployer__LengthMismatch', type: 'error' },
  {
    inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
    name: 'SafeERC20FailedOperation',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'folioOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'folio',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'folioAdmin',
        type: 'address',
      },
    ],
    name: 'FolioDeployed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'stToken',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'folio',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'ownerGovernor',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'ownerTimelock',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'tradingGovernor',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'tradingTimelock',
        type: 'address',
      },
    ],
    name: 'GovernedFolioDeployed',
    type: 'event',
  },
  {
    inputs: [],
    name: 'daoFeeRegistry',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'string', name: 'symbol', type: 'string' },
          { internalType: 'address[]', name: 'assets', type: 'address[]' },
          { internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' },
          { internalType: 'uint256', name: 'initialShares', type: 'uint256' },
        ],
        internalType: 'struct IFolio.FolioBasicDetails',
        name: 'basicDetails',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'uint256', name: 'auctionLength', type: 'uint256' },
          {
            components: [
              { internalType: 'address', name: 'recipient', type: 'address' },
              { internalType: 'uint96', name: 'portion', type: 'uint96' },
            ],
            internalType: 'struct IFolio.FeeRecipient[]',
            name: 'feeRecipients',
            type: 'tuple[]',
          },
          { internalType: 'uint256', name: 'tvlFee', type: 'uint256' },
          { internalType: 'uint256', name: 'mintFee', type: 'uint256' },
          { internalType: 'string', name: 'mandate', type: 'string' },
        ],
        internalType: 'struct IFolio.FolioAdditionalDetails',
        name: 'additionalDetails',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'bool', name: 'trustedFillerEnabled', type: 'bool' },
          {
            components: [
              { internalType: 'bool', name: 'weightControl', type: 'bool' },
              {
                internalType: 'enum IFolio.PriceControl',
                name: 'priceControl',
                type: 'uint8',
              },
            ],
            internalType: 'struct IFolio.RebalanceControl',
            name: 'rebalanceControl',
            type: 'tuple',
          },
        ],
        internalType: 'struct IFolio.FolioFlags',
        name: 'folioFlags',
        type: 'tuple',
      },
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address[]', name: 'basketManagers', type: 'address[]' },
      {
        internalType: 'address[]',
        name: 'auctionLaunchers',
        type: 'address[]',
      },
      { internalType: 'address[]', name: 'brandManagers', type: 'address[]' },
      { internalType: 'bytes32', name: 'deploymentNonce', type: 'bytes32' },
    ],
    name: 'deployFolio',
    outputs: [
      { internalType: 'contract Folio', name: 'folio', type: 'address' },
      { internalType: 'address', name: 'proxyAdmin', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IVotes', name: 'stToken', type: 'address' },
      {
        components: [
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'string', name: 'symbol', type: 'string' },
          { internalType: 'address[]', name: 'assets', type: 'address[]' },
          { internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' },
          { internalType: 'uint256', name: 'initialShares', type: 'uint256' },
        ],
        internalType: 'struct IFolio.FolioBasicDetails',
        name: 'basicDetails',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'uint256', name: 'auctionLength', type: 'uint256' },
          {
            components: [
              { internalType: 'address', name: 'recipient', type: 'address' },
              { internalType: 'uint96', name: 'portion', type: 'uint96' },
            ],
            internalType: 'struct IFolio.FeeRecipient[]',
            name: 'feeRecipients',
            type: 'tuple[]',
          },
          { internalType: 'uint256', name: 'tvlFee', type: 'uint256' },
          { internalType: 'uint256', name: 'mintFee', type: 'uint256' },
          { internalType: 'string', name: 'mandate', type: 'string' },
        ],
        internalType: 'struct IFolio.FolioAdditionalDetails',
        name: 'additionalDetails',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'bool', name: 'trustedFillerEnabled', type: 'bool' },
          {
            components: [
              { internalType: 'bool', name: 'weightControl', type: 'bool' },
              {
                internalType: 'enum IFolio.PriceControl',
                name: 'priceControl',
                type: 'uint8',
              },
            ],
            internalType: 'struct IFolio.RebalanceControl',
            name: 'rebalanceControl',
            type: 'tuple',
          },
        ],
        internalType: 'struct IFolio.FolioFlags',
        name: 'folioFlags',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'uint48', name: 'votingDelay', type: 'uint48' },
          { internalType: 'uint32', name: 'votingPeriod', type: 'uint32' },
          {
            internalType: 'uint256',
            name: 'proposalThreshold',
            type: 'uint256',
          },
          { internalType: 'uint256', name: 'quorumThreshold', type: 'uint256' },
          { internalType: 'uint256', name: 'timelockDelay', type: 'uint256' },
          { internalType: 'address[]', name: 'guardians', type: 'address[]' },
        ],
        internalType: 'struct IGovernanceDeployer.GovParams',
        name: 'ownerGovParams',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'uint48', name: 'votingDelay', type: 'uint48' },
          { internalType: 'uint32', name: 'votingPeriod', type: 'uint32' },
          {
            internalType: 'uint256',
            name: 'proposalThreshold',
            type: 'uint256',
          },
          { internalType: 'uint256', name: 'quorumThreshold', type: 'uint256' },
          { internalType: 'uint256', name: 'timelockDelay', type: 'uint256' },
          { internalType: 'address[]', name: 'guardians', type: 'address[]' },
        ],
        internalType: 'struct IGovernanceDeployer.GovParams',
        name: 'tradingGovParams',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'address[]',
            name: 'existingBasketManagers',
            type: 'address[]',
          },
          {
            internalType: 'address[]',
            name: 'auctionLaunchers',
            type: 'address[]',
          },
          {
            internalType: 'address[]',
            name: 'brandManagers',
            type: 'address[]',
          },
        ],
        internalType: 'struct IGovernanceDeployer.GovRoles',
        name: 'govRoles',
        type: 'tuple',
      },
      { internalType: 'bytes32', name: 'deploymentNonce', type: 'bytes32' },
    ],
    name: 'deployGovernedFolio',
    outputs: [
      { internalType: 'contract Folio', name: 'folio', type: 'address' },
      { internalType: 'address', name: 'proxyAdmin', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'folioImplementation',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'governanceDeployer',
    outputs: [
      {
        internalType: 'contract IGovernanceDeployer',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'trustedFillerRegistry',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
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
    name: 'versionRegistry',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

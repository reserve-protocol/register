export default [
  {
    type: 'constructor',
    inputs: [
      { name: '_daoFeeRegistry', type: 'address', internalType: 'address' },
      { name: '_versionRegistry', type: 'address', internalType: 'address' },
      {
        name: '_governorImplementation',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_timelockImplementation',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'daoFeeRegistry',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
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
          { name: 'name', type: 'string', internalType: 'string' },
          { name: 'symbol', type: 'string', internalType: 'string' },
          { name: 'assets', type: 'address[]', internalType: 'address[]' },
          { name: 'amounts', type: 'uint256[]', internalType: 'uint256[]' },
          { name: 'initialShares', type: 'uint256', internalType: 'uint256' },
        ],
      },
      {
        name: 'additionalDetails',
        type: 'tuple',
        internalType: 'struct IFolio.FolioAdditionalDetails',
        components: [
          { name: 'tradeDelay', type: 'uint256', internalType: 'uint256' },
          { name: 'auctionLength', type: 'uint256', internalType: 'uint256' },
          {
            name: 'feeRecipients',
            type: 'tuple[]',
            internalType: 'struct IFolio.FeeRecipient[]',
            components: [
              { name: 'recipient', type: 'address', internalType: 'address' },
              { name: 'portion', type: 'uint96', internalType: 'uint96' },
            ],
          },
          { name: 'folioFee', type: 'uint256', internalType: 'uint256' },
        ],
      },
      { name: 'owner', type: 'address', internalType: 'address' },
      { name: 'tradeProposers', type: 'address[]', internalType: 'address[]' },
      { name: 'priceCurators', type: 'address[]', internalType: 'address[]' },
    ],
    outputs: [
      { name: 'folio_', type: 'address', internalType: 'address' },
      { name: 'folioAdmin_', type: 'address', internalType: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'deployGovernedFolio',
    inputs: [
      { name: 'stToken', type: 'address', internalType: 'contract IVotes' },
      {
        name: 'basicDetails',
        type: 'tuple',
        internalType: 'struct IFolio.FolioBasicDetails',
        components: [
          { name: 'name', type: 'string', internalType: 'string' },
          { name: 'symbol', type: 'string', internalType: 'string' },
          { name: 'assets', type: 'address[]', internalType: 'address[]' },
          { name: 'amounts', type: 'uint256[]', internalType: 'uint256[]' },
          { name: 'initialShares', type: 'uint256', internalType: 'uint256' },
        ],
      },
      {
        name: 'additionalDetails',
        type: 'tuple',
        internalType: 'struct IFolio.FolioAdditionalDetails',
        components: [
          { name: 'tradeDelay', type: 'uint256', internalType: 'uint256' },
          { name: 'auctionLength', type: 'uint256', internalType: 'uint256' },
          {
            name: 'feeRecipients',
            type: 'tuple[]',
            internalType: 'struct IFolio.FeeRecipient[]',
            components: [
              { name: 'recipient', type: 'address', internalType: 'address' },
              { name: 'portion', type: 'uint96', internalType: 'uint96' },
            ],
          },
          { name: 'folioFee', type: 'uint256', internalType: 'uint256' },
        ],
      },
      {
        name: 'ownerGovParams',
        type: 'tuple',
        internalType: 'struct IFolioDeployer.GovParams',
        components: [
          { name: 'votingDelay', type: 'uint48', internalType: 'uint48' },
          { name: 'votingPeriod', type: 'uint32', internalType: 'uint32' },
          {
            name: 'proposalThreshold',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'quorumPercent', type: 'uint256', internalType: 'uint256' },
          { name: 'timelockDelay', type: 'uint256', internalType: 'uint256' },
          { name: 'guardian', type: 'address', internalType: 'address' },
        ],
      },
      {
        name: 'tradingGovParams',
        type: 'tuple',
        internalType: 'struct IFolioDeployer.GovParams',
        components: [
          { name: 'votingDelay', type: 'uint48', internalType: 'uint48' },
          { name: 'votingPeriod', type: 'uint32', internalType: 'uint32' },
          {
            name: 'proposalThreshold',
            type: 'uint256',
            internalType: 'uint256',
          },
          { name: 'quorumPercent', type: 'uint256', internalType: 'uint256' },
          { name: 'timelockDelay', type: 'uint256', internalType: 'uint256' },
          { name: 'guardian', type: 'address', internalType: 'address' },
        ],
      },
      { name: 'priceCurators', type: 'address[]', internalType: 'address[]' },
    ],
    outputs: [
      { name: 'folio', type: 'address', internalType: 'address' },
      { name: 'proxyAdmin', type: 'address', internalType: 'address' },
      { name: 'ownerGovernor', type: 'address', internalType: 'address' },
      { name: 'tradingGovernor', type: 'address', internalType: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'folioImplementation',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'governorImplementation',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'timelockImplementation',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'version',
    inputs: [],
    outputs: [{ name: '', type: 'string', internalType: 'string' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'versionRegistry',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  { type: 'error', name: 'FailedDeployment', inputs: [] },
  { type: 'error', name: 'FolioDeployer__LengthMismatch', inputs: [] },
  {
    type: 'error',
    name: 'InsufficientBalance',
    inputs: [
      { name: 'balance', type: 'uint256', internalType: 'uint256' },
      { name: 'needed', type: 'uint256', internalType: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'SafeERC20FailedOperation',
    inputs: [{ name: 'token', type: 'address', internalType: 'address' }],
  },
] as const

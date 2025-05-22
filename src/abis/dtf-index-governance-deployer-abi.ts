export default [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_governorImplementation',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_timelockImplementation',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], name: 'FailedDeployment', type: 'error' },
  {
    inputs: [
      { internalType: 'uint256', name: 'balance', type: 'uint256' },
      { internalType: 'uint256', name: 'needed', type: 'uint256' },
    ],
    name: 'InsufficientBalance',
    type: 'error',
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
        indexed: false,
        internalType: 'address',
        name: 'governor',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'timelock',
        type: 'address',
      },
    ],
    name: 'DeployedGovernance',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'underlying',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'stToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'governor',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'timelock',
        type: 'address',
      },
    ],
    name: 'DeployedGovernedStakingToken',
    type: 'event',
  },
  {
    inputs: [
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
        name: 'govParams',
        type: 'tuple',
      },
      { internalType: 'contract IVotes', name: 'stToken', type: 'address' },
      { internalType: 'bytes32', name: 'deploymentNonce', type: 'bytes32' },
    ],
    name: 'deployGovernanceWithTimelock',
    outputs: [
      { internalType: 'address', name: 'governor', type: 'address' },
      { internalType: 'address', name: 'timelock', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'symbol', type: 'string' },
      { internalType: 'contract IERC20', name: 'underlying', type: 'address' },
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
        name: 'govParams',
        type: 'tuple',
      },
      { internalType: 'bytes32', name: 'deploymentNonce', type: 'bytes32' },
    ],
    name: 'deployGovernedStakingToken',
    outputs: [
      {
        internalType: 'contract StakingVault',
        name: 'stToken',
        type: 'address',
      },
      { internalType: 'address', name: 'governor', type: 'address' },
      { internalType: 'address', name: 'timelock', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'governorImplementation',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'timelockImplementation',
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
] as const

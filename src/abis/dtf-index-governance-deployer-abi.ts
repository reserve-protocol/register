export default [
  {
    type: 'constructor',
    inputs: [
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
    name: 'deployGovernanceWithTimelock',
    inputs: [
      {
        name: 'govParams',
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
        name: 'stToken',
        type: 'address',
        internalType: 'contract IVotes',
      },
      {
        name: 'deploymentNonce',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'governor',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'timelock',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'deployGovernedStakingToken',
    inputs: [
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
        name: 'underlying',
        type: 'address',
        internalType: 'contract IERC20',
      },
      {
        name: 'govParams',
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
        name: 'deploymentNonce',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'stToken',
        type: 'address',
        internalType: 'contract StakingVault',
      },
      {
        name: 'governor',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'timelock',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'governorImplementation',
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
    name: 'timelockImplementation',
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
    type: 'event',
    name: 'DeployedGovernance',
    inputs: [
      {
        name: 'stToken',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'governor',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'timelock',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'DeployedGovernedStakingToken',
    inputs: [
      {
        name: 'underlying',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'stToken',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'governor',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'timelock',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'FailedDeployment',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientBalance',
    inputs: [
      {
        name: 'balance',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'needed',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
] as const

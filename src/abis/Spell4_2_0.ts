export default [
  {
    inputs: [
      {
        internalType: 'bool',
        name: '_mainnet',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'TestError',
    type: 'error',
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
        name: 'newGovernor',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newTimelock',
        type: 'address',
      },
    ],
    name: 'NewGovernanceDeployed',
    type: 'event',
  },
  {
    inputs: [],
    name: 'NEW_VERSION_HASH',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PRIOR_VERSION_HASH',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IERC20',
        name: '',
        type: 'address',
      },
    ],
    name: 'assets',
    outputs: [
      {
        internalType: 'contract Asset',
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
        name: '',
        type: 'address',
      },
    ],
    name: 'cast',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
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
        internalType: 'contract Governance',
        name: 'oldGovernor',
        type: 'address',
      },
      {
        internalType: 'address[]',
        name: 'guardians',
        type: 'address[]',
      },
    ],
    name: 'castSpell',
    outputs: [
      {
        internalType: 'address',
        name: 'newGovernor',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'newTimelock',
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
    inputs: [],
    name: 'mainnet',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IRToken',
        name: '',
        type: 'address',
      },
    ],
    name: 'newGovs',
    outputs: [
      {
        internalType: 'contract IGovernor',
        name: 'anastasius',
        type: 'address',
      },
      {
        internalType: 'contract TimelockController',
        name: 'timelock',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'registries',
    outputs: [
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

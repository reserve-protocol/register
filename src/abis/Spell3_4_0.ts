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
        internalType: 'contract IAsset',
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
    ],
    name: 'castSpell1',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IRToken',
        name: 'rToken',
        type: 'address',
      },
    ],
    name: 'castSpell2',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'deployer',
    outputs: [
      {
        internalType: 'contract TestIDeployer',
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
    inputs: [
      {
        internalType: 'contract IRToken',
        name: '',
        type: 'address',
      },
    ],
    name: 'oneCast',
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
        internalType: 'contract IERC20',
        name: '',
        type: 'address',
      },
    ],
    name: 'rotations',
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
    inputs: [
      {
        internalType: 'contract IRToken',
        name: '',
        type: 'address',
      },
    ],
    name: 'twoCast',
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
] as const

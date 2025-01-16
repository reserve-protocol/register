export default [
  {
    type: 'constructor',
    inputs: [
      { name: '_asset', type: 'address', internalType: 'contract IERC20' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'cancelLock',
    inputs: [{ name: 'lockId', type: 'uint256', internalType: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimLock',
    inputs: [{ name: 'lockId', type: 'uint256', internalType: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createLock',
    inputs: [
      { name: 'user', type: 'address', internalType: 'address' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
      { name: 'unlockTime', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'locks',
    inputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    outputs: [
      { name: 'user', type: 'address', internalType: 'address' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
      { name: 'unlockTime', type: 'uint256', internalType: 'uint256' },
      { name: 'claimedAt', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'targetToken',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'contract IERC20' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'vault',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'contract IERC4626' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'LockCancelled',
    inputs: [
      {
        name: 'lockId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LockClaimed',
    inputs: [
      {
        name: 'lockId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LockCreated',
    inputs: [
      {
        name: 'lockId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'user',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'unlockTime',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'SafeERC20FailedOperation',
    inputs: [{ name: 'token', type: 'address', internalType: 'address' }],
  },
  { type: 'error', name: 'UnstakingManager__AlreadyClaimed', inputs: [] },
  { type: 'error', name: 'UnstakingManager__NotUnlockedYet', inputs: [] },
  { type: 'error', name: 'UnstakingManager__Unauthorized', inputs: [] },
] as const

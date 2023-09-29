export default [
  // DEPOSIT NATIVE ETH
  {
    inputs: [
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'uint256', name: '_value', type: 'uint256' },
      { internalType: 'uint64', name: '_gasLimit', type: 'uint64' },
      { internalType: 'bool', name: '_isCreation', type: 'bool' },
      { internalType: 'bytes', name: '_data', type: 'bytes' },
    ],
    name: 'depositTransaction',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  // DEPOSIT ERC20
  {
    inputs: [
      { internalType: 'address', name: '_l1Token', type: 'address' },
      { internalType: 'address', name: '_l2Token', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'uint32', name: '_minGasLimit', type: 'uint32' },
      { internalType: 'bytes', name: '_extraData', type: 'bytes' },
    ],
    name: 'depositERC20',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_l2Token', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'uint32', name: '_minGasLimit', type: 'uint32' },
      { internalType: 'bytes', name: '_extraData', type: 'bytes' },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const

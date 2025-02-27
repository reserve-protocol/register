export default [
  { inputs: [], name: 'UIntOutOfBounds', type: 'error' },
  {
    inputs: [
      { internalType: 'contract ITrading', name: 'trader', type: 'address' },
    ],
    name: 'auctionsSettleable',
    outputs: [
      { internalType: 'contract IERC20[]', name: 'erc20s', type: 'address[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IRToken', name: 'rToken', type: 'address' },
    ],
    name: 'backingOverview',
    outputs: [
      { internalType: 'uint192', name: 'backing', type: 'uint192' },
      {
        internalType: 'uint192',
        name: 'overCollateralization',
        type: 'uint192',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IRToken', name: 'rToken', type: 'address' },
      { internalType: 'bytes32', name: 'targetName', type: 'bytes32' },
    ],
    name: 'backupConfig',
    outputs: [
      { internalType: 'contract IERC20[]', name: 'erc20s', type: 'address[]' },
      { internalType: 'uint256', name: 'max', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IRToken', name: 'rToken', type: 'address' },
    ],
    name: 'balancesAcrossAllTraders',
    outputs: [
      { internalType: 'contract IERC20[]', name: 'erc20s', type: 'address[]' },
      { internalType: 'uint256[]', name: 'balances', type: 'uint256[]' },
      {
        internalType: 'uint256[]',
        name: 'balancesNeededByBackingManager',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IRToken', name: 'rToken', type: 'address' },
    ],
    name: 'basketBreakdown',
    outputs: [
      { internalType: 'address[]', name: 'erc20s', type: 'address[]' },
      { internalType: 'uint192[]', name: 'uoaShares', type: 'uint192[]' },
      { internalType: 'bytes32[]', name: 'targets', type: 'bytes32[]' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IRToken', name: 'rToken', type: 'address' },
    ],
    name: 'basketTokens',
    outputs: [{ internalType: 'address[]', name: 'tokens', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IRToken', name: 'rToken', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'issue',
    outputs: [
      { internalType: 'address[]', name: 'tokens', type: 'address[]' },
      { internalType: 'uint256[]', name: 'deposits', type: 'uint256[]' },
      { internalType: 'uint192[]', name: 'depositsUoA', type: 'uint192[]' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IRToken', name: 'rToken', type: 'address' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'maxIssuable',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract RTokenP1', name: 'rToken', type: 'address' },
      { internalType: 'uint256', name: 'draftEra', type: 'uint256' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'pendingUnstakings',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'index', type: 'uint256' },
          { internalType: 'uint256', name: 'availableAt', type: 'uint256' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        internalType: 'struct IFacadeRead.Pending[]',
        name: 'unstakings',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IRToken', name: 'rToken', type: 'address' },
    ],
    name: 'price',
    outputs: [
      { internalType: 'uint192', name: 'low', type: 'uint192' },
      { internalType: 'uint192', name: 'high', type: 'uint192' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IRToken', name: 'rToken', type: 'address' },
    ],
    name: 'primeBasket',
    outputs: [
      { internalType: 'contract IERC20[]', name: 'erc20s', type: 'address[]' },
      { internalType: 'bytes32[]', name: 'targetNames', type: 'bytes32[]' },
      { internalType: 'uint192[]', name: 'targetAmts', type: 'uint192[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IRToken', name: 'rToken', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'redeem',
    outputs: [
      { internalType: 'address[]', name: 'tokens', type: 'address[]' },
      { internalType: 'uint256[]', name: 'withdrawals', type: 'uint256[]' },
      { internalType: 'uint256[]', name: 'available', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IRToken', name: 'rToken', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint48[]', name: 'basketNonces', type: 'uint48[]' },
      { internalType: 'uint192[]', name: 'portions', type: 'uint192[]' },
    ],
    name: 'redeemCustom',
    outputs: [
      { internalType: 'address[]', name: 'tokens', type: 'address[]' },
      { internalType: 'uint256[]', name: 'withdrawals', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IRToken', name: 'rToken', type: 'address' },
    ],
    name: 'stToken',
    outputs: [
      {
        internalType: 'contract IStRSR',
        name: 'stTokenAddress',
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
    name: 'backingBuffer',
    outputs: [
      {
        internalType: 'uint192',
        name: 'required',
        type: 'uint192',
      },
      {
        internalType: 'uint192',
        name: 'actual',
        type: 'uint192',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IRToken[]',
        name: 'rTokens',
        type: 'address[]',
      },
    ],
    name: 'revenues',
    outputs: [
      {
        components: [
          { internalType: 'contract IRToken', name: 'rToken', type: 'address' },
          {
            internalType: 'contract IRevenueTrader',
            name: 'trader',
            type: 'address',
          },
          { internalType: 'contract IERC20', name: 'sell', type: 'address' },
          { internalType: 'contract IERC20', name: 'buy', type: 'address' },
          { internalType: 'uint8', name: 'sellDecimals', type: 'uint8' },
          { internalType: 'bool', name: 'settleable', type: 'bool' },
          { internalType: 'string', name: 'symbol', type: 'string' },
          { internalType: 'uint192', name: 'volume', type: 'uint192' },
          { internalType: 'uint256', name: 'balance', type: 'uint256' },
          { internalType: 'uint256', name: 'minTradeAmount', type: 'uint256' },
        ],
        internalType: 'struct RevenueFacet.Revenue[]',
        name: '_revenues',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

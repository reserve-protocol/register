export const FolioLensArtifact = {
  contractName: 'FolioLens',
  abi: [
    { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
    {
      type: 'function',
      name: 'getAllBids',
      inputs: [
        { name: 'folio', type: 'address', internalType: 'contract Folio' },
        { name: 'auctionId', type: 'uint256', internalType: 'uint256' },
      ],
      outputs: [
        {
          name: 'bids',
          type: 'tuple[]',
          internalType: 'struct FolioLens.SingleBid[]',
          components: [
            { name: 'sellToken', type: 'address', internalType: 'address' },
            { name: 'buyToken', type: 'address', internalType: 'address' },
            { name: 'sellAmount', type: 'uint256', internalType: 'uint256' },
            { name: 'bidAmount', type: 'uint256', internalType: 'uint256' },
            { name: 'price', type: 'uint256', internalType: 'uint256' },
          ],
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getSpotWeights',
      inputs: [
        { name: 'folio', type: 'address', internalType: 'contract Folio' },
      ],
      outputs: [
        { name: 'tokens', type: 'address[]', internalType: 'address[]' },
        { name: 'weights', type: 'uint256[]', internalType: 'uint256[]' },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'surplusesAndDeficits',
      inputs: [
        { name: 'folio', type: 'address', internalType: 'contract Folio' },
        { name: 'sellLimit', type: 'uint256', internalType: 'uint256' },
        { name: 'buyLimit', type: 'uint256', internalType: 'uint256' },
      ],
      outputs: [
        { name: 'tokens', type: 'address[]', internalType: 'address[]' },
        { name: 'surpluses', type: 'uint256[]', internalType: 'uint256[]' },
        { name: 'deficits', type: 'uint256[]', internalType: 'uint256[]' },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'version',
      inputs: [],
      outputs: [{ name: '', type: 'string', internalType: 'string' }],
      stateMutability: 'pure',
    },
  ],
} as const

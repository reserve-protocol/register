export default [
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'AUCTION_APPROVER',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'AUCTION_LAUNCHER',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'BRAND_MANAGER',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'DEFAULT_ADMIN_ROLE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'addToBasket',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'contract IERC20',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'spender',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      {
        name: 'spender',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'approveAuction',
    inputs: [
      {
        name: 'sell',
        type: 'address',
        internalType: 'contract IERC20',
      },
      {
        name: 'buy',
        type: 'address',
        internalType: 'contract IERC20',
      },
      {
        name: 'sellLimit',
        type: 'tuple',
        internalType: 'struct IFolio.Range',
        components: [
          {
            name: 'spot',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'low',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'high',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: 'buyLimit',
        type: 'tuple',
        internalType: 'struct IFolio.Range',
        components: [
          {
            name: 'spot',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'low',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'high',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: 'prices',
        type: 'tuple',
        internalType: 'struct IFolio.Prices',
        components: [
          {
            name: 'start',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'end',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: 'ttl',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'auctionDelay',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'auctionLength',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'auctions',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'sell',
        type: 'address',
        internalType: 'contract IERC20',
      },
      {
        name: 'buy',
        type: 'address',
        internalType: 'contract IERC20',
      },
      {
        name: 'sellLimit',
        type: 'tuple',
        internalType: 'struct IFolio.Range',
        components: [
          {
            name: 'spot',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'low',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'high',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: 'buyLimit',
        type: 'tuple',
        internalType: 'struct IFolio.Range',
        components: [
          {
            name: 'spot',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'low',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'high',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: 'prices',
        type: 'tuple',
        internalType: 'struct IFolio.Prices',
        components: [
          {
            name: 'start',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'end',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: 'availableAt',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'launchTimeout',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'start',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'end',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'k',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'bid',
    inputs: [
      {
        name: 'auctionId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'sellAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'maxBuyAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'withCallback',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'data',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: 'boughtAmt',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'buyEnds',
    inputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'closeAuction',
    inputs: [
      {
        name: 'auctionId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'daoFeeRegistry',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IFolioDAOFeeRegistry',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'daoPendingFeeShares',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'distributeFees',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'feeRecipients',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'recipient',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'portion',
        type: 'uint96',
        internalType: 'uint96',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'feeRecipientsPendingFeeShares',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'folio',
    inputs: [],
    outputs: [
      {
        name: '_assets',
        type: 'address[]',
        internalType: 'address[]',
      },
      {
        name: '_amounts',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getBid',
    inputs: [
      {
        name: 'auctionId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'timestamp',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'sellAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'bidAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPendingFeeShares',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPrice',
    inputs: [
      {
        name: 'auctionId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'timestamp',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getRoleAdmin',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getRoleMember',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'index',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
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
    name: 'getRoleMemberCount',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getRoleMembers',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'address[]',
        internalType: 'address[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'grantRole',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'hasRole',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'initialize',
    inputs: [
      {
        name: '_basicDetails',
        type: 'tuple',
        internalType: 'struct IFolio.FolioBasicDetails',
        components: [
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
            name: 'assets',
            type: 'address[]',
            internalType: 'address[]',
          },
          {
            name: 'amounts',
            type: 'uint256[]',
            internalType: 'uint256[]',
          },
          {
            name: 'initialShares',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: '_additionalDetails',
        type: 'tuple',
        internalType: 'struct IFolio.FolioAdditionalDetails',
        components: [
          {
            name: 'auctionDelay',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'auctionLength',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'feeRecipients',
            type: 'tuple[]',
            internalType: 'struct IFolio.FeeRecipient[]',
            components: [
              {
                name: 'recipient',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'portion',
                type: 'uint96',
                internalType: 'uint96',
              },
            ],
          },
          {
            name: 'tvlFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'mintFee',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'mandate',
            type: 'string',
            internalType: 'string',
          },
        ],
      },
      {
        name: '_creator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_daoFeeRegistry',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isKilled',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'killFolio',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'lastPoke',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'lot',
    inputs: [
      {
        name: 'auctionId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'timestamp',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'sellAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'mandate',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'mint',
    inputs: [
      {
        name: 'shares',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'receiver',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '_assets',
        type: 'address[]',
        internalType: 'address[]',
      },
      {
        name: '_amounts',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'mintFee',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'nextAuctionId',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'openAuction',
    inputs: [
      {
        name: 'auctionId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'sellLimit',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'buyLimit',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'startPrice',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'endPrice',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'openAuctionPermissionlessly',
    inputs: [
      {
        name: 'auctionId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'poke',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'redeem',
    inputs: [
      {
        name: 'shares',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'receiver',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'assets',
        type: 'address[]',
        internalType: 'address[]',
      },
      {
        name: 'minAmountsOut',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    outputs: [
      {
        name: '_amounts',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'removeFromBasket',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'contract IERC20',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'renounceRole',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'callerConfirmation',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeRole',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'sellEnds',
    inputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'setAuctionDelay',
    inputs: [
      {
        name: '_newDelay',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setAuctionLength',
    inputs: [
      {
        name: '_newLength',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setFeeRecipients',
    inputs: [
      {
        name: '_newRecipients',
        type: 'tuple[]',
        internalType: 'struct IFolio.FeeRecipient[]',
        components: [
          {
            name: 'recipient',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'portion',
            type: 'uint96',
            internalType: 'uint96',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setMandate',
    inputs: [
      {
        name: '_newMandate',
        type: 'string',
        internalType: 'string',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setMintFee',
    inputs: [
      {
        name: '_newFee',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setTVLFee',
    inputs: [
      {
        name: '_newFee',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'supportsInterface',
    inputs: [
      {
        name: 'interfaceId',
        type: 'bytes4',
        internalType: 'bytes4',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'toAssets',
    inputs: [
      {
        name: 'shares',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'rounding',
        type: 'uint8',
        internalType: 'enum Math.Rounding',
      },
    ],
    outputs: [
      {
        name: '_assets',
        type: 'address[]',
        internalType: 'address[]',
      },
      {
        name: '_amounts',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalAssets',
    inputs: [],
    outputs: [
      {
        name: '_assets',
        type: 'address[]',
        internalType: 'address[]',
      },
      {
        name: '_amounts',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      {
        name: 'to',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferFrom',
    inputs: [
      {
        name: 'from',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'to',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'tvlFee',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
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
    name: 'Approval',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'spender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'AuctionApproved',
    inputs: [
      {
        name: 'auctionId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'from',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'to',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'auction',
        type: 'tuple',
        indexed: false,
        internalType: 'struct IFolio.Auction',
        components: [
          {
            name: 'id',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'sell',
            type: 'address',
            internalType: 'contract IERC20',
          },
          {
            name: 'buy',
            type: 'address',
            internalType: 'contract IERC20',
          },
          {
            name: 'sellLimit',
            type: 'tuple',
            internalType: 'struct IFolio.Range',
            components: [
              {
                name: 'spot',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'low',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'high',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          {
            name: 'buyLimit',
            type: 'tuple',
            internalType: 'struct IFolio.Range',
            components: [
              {
                name: 'spot',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'low',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'high',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          {
            name: 'prices',
            type: 'tuple',
            internalType: 'struct IFolio.Prices',
            components: [
              {
                name: 'start',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'end',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          {
            name: 'availableAt',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'launchTimeout',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'start',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'end',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'k',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'AuctionBid',
    inputs: [
      {
        name: 'auctionId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'sellAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'buyAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'AuctionClosed',
    inputs: [
      {
        name: 'auctionId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'AuctionDelaySet',
    inputs: [
      {
        name: 'newAuctionDelay',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'AuctionLengthSet',
    inputs: [
      {
        name: 'newAuctionLength',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'AuctionOpened',
    inputs: [
      {
        name: 'auctionId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'auction',
        type: 'tuple',
        indexed: false,
        internalType: 'struct IFolio.Auction',
        components: [
          {
            name: 'id',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'sell',
            type: 'address',
            internalType: 'contract IERC20',
          },
          {
            name: 'buy',
            type: 'address',
            internalType: 'contract IERC20',
          },
          {
            name: 'sellLimit',
            type: 'tuple',
            internalType: 'struct IFolio.Range',
            components: [
              {
                name: 'spot',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'low',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'high',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          {
            name: 'buyLimit',
            type: 'tuple',
            internalType: 'struct IFolio.Range',
            components: [
              {
                name: 'spot',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'low',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'high',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          {
            name: 'prices',
            type: 'tuple',
            internalType: 'struct IFolio.Prices',
            components: [
              {
                name: 'start',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'end',
                type: 'uint256',
                internalType: 'uint256',
              },
            ],
          },
          {
            name: 'availableAt',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'launchTimeout',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'start',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'end',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'k',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BasketTokenAdded',
    inputs: [
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BasketTokenRemoved',
    inputs: [
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'FeeRecipientSet',
    inputs: [
      {
        name: 'recipient',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'portion',
        type: 'uint96',
        indexed: false,
        internalType: 'uint96',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'FolioFeePaid',
    inputs: [
      {
        name: 'recipient',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'FolioKilled',
    inputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Initialized',
    inputs: [
      {
        name: 'version',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MandateSet',
    inputs: [
      {
        name: 'newMandate',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MintFeeSet',
    inputs: [
      {
        name: 'newFee',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ProtocolFeePaid',
    inputs: [
      {
        name: 'recipient',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleAdminChanged',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'previousAdminRole',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'newAdminRole',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleGranted',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'account',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'sender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleRevoked',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'account',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'sender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'TVLFeeSet',
    inputs: [
      {
        name: 'newFee',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'feeAnnually',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      {
        name: 'from',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'to',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AccessControlBadConfirmation',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AccessControlUnauthorizedAccount',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'neededRole',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
  },
  {
    type: 'error',
    name: 'ERC20InsufficientAllowance',
    inputs: [
      {
        name: 'spender',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'allowance',
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
  {
    type: 'error',
    name: 'ERC20InsufficientBalance',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        internalType: 'address',
      },
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
  {
    type: 'error',
    name: 'ERC20InvalidApprover',
    inputs: [
      {
        name: 'approver',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ERC20InvalidReceiver',
    inputs: [
      {
        name: 'receiver',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ERC20InvalidSender',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ERC20InvalidSpender',
    inputs: [
      {
        name: 'spender',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'Folio__AuctionCannotBeOpened',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__AuctionCannotBeOpenedPermissionlesslyYet',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__AuctionCollision',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__AuctionNotOngoing',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__AuctionTimeout',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__BadFeeTotal',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__BasketModificationFailed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__EmptyAssets',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__ExcessiveBid',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__FeeRecipientInvalidAddress',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__FeeRecipientInvalidFeeShare',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__FolioKilled',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__InsufficientBalance',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__InsufficientBid',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__InvalidArrayLengths',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__InvalidAsset',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__InvalidAssetAmount',
    inputs: [
      {
        name: 'asset',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'Folio__InvalidAuctionDelay',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__InvalidAuctionLength',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__InvalidAuctionTTL',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__InvalidAuctionTokens',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__InvalidBuyLimit',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__InvalidPrices',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__InvalidSellLimit',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__MintFeeTooHigh',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__SlippageExceeded',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__TVLFeeTooHigh',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__TVLFeeTooLow',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__TooManyFeeRecipients',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__Unauthorized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Folio__ZeroInitialShares',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidInitialization',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotInitializing',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PRBMath_MulDiv18_Overflow',
    inputs: [
      {
        name: 'x',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'y',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'PRBMath_SD59x18_Exp2_InputTooBig',
    inputs: [
      {
        name: 'x',
        type: 'int256',
        internalType: 'SD59x18',
      },
    ],
  },
  {
    type: 'error',
    name: 'PRBMath_SD59x18_Exp_InputTooBig',
    inputs: [
      {
        name: 'x',
        type: 'int256',
        internalType: 'SD59x18',
      },
    ],
  },
  {
    type: 'error',
    name: 'PRBMath_SD59x18_IntoUint256_Underflow',
    inputs: [
      {
        name: 'x',
        type: 'int256',
        internalType: 'SD59x18',
      },
    ],
  },
  {
    type: 'error',
    name: 'PRBMath_UD60x18_Exp2_InputTooBig',
    inputs: [
      {
        name: 'x',
        type: 'uint256',
        internalType: 'UD60x18',
      },
    ],
  },
  {
    type: 'error',
    name: 'PRBMath_UD60x18_Log_InputTooSmall',
    inputs: [
      {
        name: 'x',
        type: 'uint256',
        internalType: 'UD60x18',
      },
    ],
  },
  {
    type: 'error',
    name: 'ReentrancyGuardReentrantCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'SafeERC20FailedOperation',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
] as const

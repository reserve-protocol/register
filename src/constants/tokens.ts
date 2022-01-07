export interface ITokenMeta {
  name: string
  symbol: string
  logo: string
  decimals: number
}

const rsvAddress = '0x196f4727526eA7FB1e17b2071B3d8eAA38486988'
const rsvInfo = {
  name: 'Reserve',
  symbol: 'RSV',
  decimals: 18,
}

const TOKENS: { [x: string]: ITokenMeta } = {
  '0x9467a509da43cb50eb332187602534991be1fea4': {
    name: 'RSD',
    symbol: 'RSD',
    decimals: 18,
    logo: 'rsv.png',
  },
  [rsvAddress]: {
    ...rsvInfo,
    logo: 'rsv.png',
  },
}

export const RSV = {
  id: rsvAddress,
  staked: 0,
  token: {
    ...rsvInfo,
    address: rsvAddress,
  },
  // TODO: revisit is this needed?
  stToken: {
    ...rsvInfo,
    address: rsvAddress,
  }, // TODO: Change structure?
  vault: {
    id: '_',
    collaterals: [
      {
        id: '0',
        index: 0,
        token: {
          address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
        },
      },
      {
        id: '1',
        index: 1,
        token: {
          address: '0x0000000000085d4780B73119b644AE5ecd22b376',
          symbol: 'TUSD',
          name: 'TrueUSD',
          decimals: 18,
        },
      },
      {
        id: '2',
        index: 2,
        token: {
          address: '0x8e870d67f660d95d5be530380d0ec0bd388289e1',
          symbol: 'USDP',
          name: 'Pax Dollar',
          decimals: 18,
        },
      },
    ],
  },
}

export default TOKENS

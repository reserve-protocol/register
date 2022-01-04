export interface ITokenMeta {
  name: string
  symbol: string
  logo: string
}

const TOKENS: { [x: string]: ITokenMeta } = {
  '0x9467a509da43cb50eb332187602534991be1fea4': {
    name: 'RSD',
    symbol: 'RSD',
    logo: 'rsv.png',
  },
}

export default TOKENS

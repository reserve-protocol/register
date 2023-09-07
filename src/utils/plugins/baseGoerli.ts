import { CollateralPlugin } from 'types'
import { ZERO_ADDRESS } from 'utils/addresses'
import { TARGET_UNITS } from 'utils/constants'

const collateralAddresses = {
  DAI: '0xdD740A7C787B0f3500977c9e14BB9a91057e38e7',
  USDC: '0x10D7A1ED1c431Ced12888fe90acEFD898eFaf2ba',
  USDT: '0x1DdB7dfdC5D26FE1f2aD02d9972f12481346Ae9b',
}

const underlyingCollateralAddresses = {
  DAI: '0xDA2eA2f60545555e268124E51EA27bc97DE78E9c',
  USDC: '0x1265Ec05FD621d82F224814902c925a600307fb3',
  USDT: '0x3D3226C68B1425FdaA273F2A6295D5C40462327C',
}
// MAINNET - ChainId = 1
const plugins: CollateralPlugin[] = [
  // FIAT COLLATERAL
  {
    symbol: 'DAI',
    address: collateralAddresses.DAI,
    decimals: 18,
    targetUnit: TARGET_UNITS.USD,
    referenceUnit: 'DAI',
    collateralToken: 'DAI',
    description: '',
    collateralAddress: underlyingCollateralAddresses.DAI,
    rewardToken: [ZERO_ADDRESS],
  },
  {
    symbol: 'USDC',
    address: collateralAddresses.USDC,
    decimals: 6,
    targetUnit: TARGET_UNITS.USD,
    referenceUnit: 'USDC',
    collateralToken: 'USDC',
    description: 'Used in RSV',
    collateralAddress: underlyingCollateralAddresses.USDC,
    rewardToken: [ZERO_ADDRESS],
  },
  {
    symbol: 'USDT',
    address: collateralAddresses.USDT,
    decimals: 6,
    targetUnit: TARGET_UNITS.USD,
    referenceUnit: 'USDT',
    collateralToken: 'USDT',
    description: '',
    collateralAddress: underlyingCollateralAddresses.USDT,
    rewardToken: [ZERO_ADDRESS],
  },
]

export default plugins

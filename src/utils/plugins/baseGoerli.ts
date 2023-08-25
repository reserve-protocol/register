import { CollateralPlugin } from 'types'
import { ZERO_ADDRESS } from 'utils/addresses'
import { TARGET_UNITS } from 'utils/constants'

const collateralAddresses = {
  DAI: '0x89B2eF0dd1422F482617eE8B01E57ef5f778E612',
  USDC: '0x0908A3193D14064f5831cbAFc47703f001313Ff6',
  USDT: '0xB5e44CbbC77D23e4C973a27Db5AE59AcE4c46a87',
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

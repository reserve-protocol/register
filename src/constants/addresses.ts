import { ChainId } from '@usedapp/core'

const ADDRESSES: {
  [key: number]: { [key: string]: string }
} = {
  [ChainId.Mainnet]: {
    RSR: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    RTOKEN: '0x9bd03768a7DCc129555dE410FF8E85528A4F88b5',
    LEGACY_RSR: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    INSURANCE: '0x0D48C4443D9ac47b2d34dB8744269208497a15Eb',
    MULTICALL: '0x9a9f2ccfde556a7e9ff0848998aa4a0cfd8863ae',
  },
  [ChainId.Hardhat]: {
    RSR: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    RTOKEN: '0x9bd03768a7DCc129555dE410FF8E85528A4F88b5',
    LEGACY_RSR: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    INSURANCE: '0x440C0fCDC317D69606eabc35C0F676D1a8251Ee1',
    MULTICALL: '0x959922be3caee4b8cd9a407cc3ac1c251c2007b1',
  },
  [ChainId.Ropsten]: {
    RSR: '0xA8F7d949FbEbdBbEF765e2ebF8072e5281dbA2e9',
    RTOKEN: '0x2ED8d2E2b0801B8ad36419Fbd88785ba5a68E8de',
    LEGACY_RSR: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    INSURANCE: '0x440C0fCDC317D69606eabc35C0F676D1a8251Ee1',
  },
  [ChainId.Rinkeby]: {
    RSR: '0xA8F7d949FbEbdBbEF765e2ebF8072e5281dbA2e9',
    RTOKEN: '0x2ED8d2E2b0801B8ad36419Fbd88785ba5a68E8de',
    LEGACY_RSR: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    INSURANCE: '0x440C0fCDC317D69606eabc35C0F676D1a8251Ee1',
  },
}

export const getAddress = (
  chainId: number | null | undefined,
  key: string
): string =>
  chainId ? ADDRESSES[chainId][key] : ADDRESSES[ChainId.Hardhat][key]

export default ADDRESSES

import { ChainId } from '@usedapp/core'

const ADDRESSES: {
  [key: number]: { [key: string]: string }
} = {
  [ChainId.Hardhat]: {
    RSR: '0x4631BCAbD6dF18D94796344963cB60d44a4136b6',
    RTOKEN: '0x74fcA3bE84BBd0bAE9C973Ca2d16821FEa867fE8',
    LEGACY_RSR: '0x4C2F7092C2aE51D986bEFEe378e50BD4dB99C901',
    INSURANCE: '0x0D48C4443D9ac47b2d34dB8744269208497a15Eb',
  },
  [ChainId.Ropsten]: {
    RSR: '0xA8F7d949FbEbdBbEF765e2ebF8072e5281dbA2e9',
    RTOKEN: '0x2ED8d2E2b0801B8ad36419Fbd88785ba5a68E8de',
    LEGACY_RSR: '0x58408daf0664dc9ff4645414ce5f9ace059f0470',
    INSURANCE: '0xEDf1BD2fDF2a9C166950701B2B863ACfBfF8139c',
  },
}

export const getAddress = (
  chainId: number | null | undefined,
  key: string
): string =>
  chainId ? ADDRESSES[chainId][key] : ADDRESSES[ChainId.Hardhat][key]

export default ADDRESSES

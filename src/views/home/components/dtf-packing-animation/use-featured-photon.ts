import useFeaturedDtfs, {
  type FeaturedDTFGroup,
} from '../../hooks/use-featured-dtfs'

const PHOTON_BSC_CHAIN_ID = 56
const PHOTON_BSC_ADDRESS = '0xa0fe4e0aeca5479705ce996615b2eacb6b6a10fb'

const getPhoton = (groups?: FeaturedDTFGroup[]) => {
  const versions = groups?.find(
    (group) =>
      group.key === 'photon' ||
      group.versions.some((dtf) => dtf.symbol.toUpperCase() === 'PHOTON')
  )?.versions

  return versions?.find(
    (dtf) =>
      dtf.chainId === PHOTON_BSC_CHAIN_ID &&
      dtf.address.toLowerCase() === PHOTON_BSC_ADDRESS
  )
}

export const useFeaturedPhoton = () => {
  const { data } = useFeaturedDtfs()
  return getPhoton(data)
}

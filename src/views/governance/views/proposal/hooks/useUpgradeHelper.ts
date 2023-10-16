import useRToken from 'hooks/useRToken'
import { eusdAddresses, eusdCalls } from '../utils/eusd_calls'
import { ethplusAddresses, ethplusCalls } from '../utils/ethplus_calls'
import { hyusdAddresses, hyusdCalls } from '../utils/hyusd_calls'

const useUpgradeHelper = () => {
  const rToken = useRToken()

  // eUSD
  if (rToken?.address === '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F') {
    return { calls: eusdCalls, addresses: eusdAddresses }
  }
  // ETH+
  else if (rToken?.address === '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8') {
    return { calls: ethplusCalls, addresses: ethplusAddresses }
  }
  // hyUSD
  else if (rToken?.address === '0xaCdf0DBA4B9839b96221a8487e9ca660a48212be') {
    return { calls: hyusdCalls, addresses: hyusdAddresses }
  }
  return {
    calls: [],
    addresses: [],
  }
}

export default useUpgradeHelper

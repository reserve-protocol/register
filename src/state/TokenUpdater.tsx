import { ERC20Interface } from 'abis'
import { useFacadeContract } from 'hooks/useContract'
import { atom, useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useCallback, useEffect } from 'react'
import { ContractCall, Token } from 'types'
import RSV from 'utils/rsv'
import { reserveTokensAtom, selectedRTokenAtom } from './atoms'

const getTokensMeta = async (addresses: string[]): Promise<Token[]> => {
  const calls = addresses.reduce((acc, address) => {
    return [
      ...acc,
      {
        abi: ERC20Interface,
        address,
        method: 'name',
        args: [],
      },
      {
        abi: ERC20Interface,
        address,
        method: 'symbol',
        args: [],
      },
      {
        abi: ERC20Interface,
        address,
        method: 'decimals',
        args: [],
      },
    ]
  }, [] as ContractCall[])

  console.log('calls', calls)

  return [
    {
      address: '0xff4DA0E6C71189814d290564F455C21aeCC66430',
      name: 'Reserve Dollar Plus',
      symbol: 'RSDP',
      decimals: 18,
    },
    {
      address: '0x78cE0149fa5cC2f715d7b1a07063d727caA40271',
      name: 'stRSDPRSR Token',
      symbol: 'stRSDPRSR',
      decimals: 18,
    },
    {
      address: '0x5D42EBdBBa61412295D7b0302d6F50aC449Ddb4F',
      name: 'cUSDT Token',
      symbol: 'cUSDT',
      decimals: 8,
    },
    {
      address: '0xA56F946D6398Dd7d9D4D9B337Cf9E0F68982ca5B',
      name: 'aDAI Token',
      symbol: 'aDAI',
      decimals: 18,
    },
    {
      address: '0xddE78e6202518FF4936b5302cC2891ec180E8bFf',
      name: 'cUSDC Token',
      symbol: 'cUSDC',
      decimals: 8,
    },
  ]
}

const updateTokenAtom = atom(null, (get, set, data: _ReserveToken) => {
  const tokens = get(reserveTokensAtom)
  set(reserveTokensAtom, { ...tokens, [data.address]: data })
})

// Try to grab the token meta from theGraph
// If it fails, get it from the blockchain (only whitelisted tokens)
const ReserveTokenUpdater = () => {
  const selectedAddress = useAtomValue(selectedRTokenAtom)
  const updateToken = useUpdateAtom(updateTokenAtom)
  const facadeContract = useFacadeContract()

  const getTokenMeta = useCallback(
    async (address: string) => {
      const isRSV = address === RSV.address

      if (isRSV) {
        return updateToken(RSV)
      }

      try {
        if (facadeContract) {
          const [basket, stTokenAddress] = await Promise.all([
            facadeContract.basketTokens(selectedAddress),
            facadeContract.stToken(selectedAddress),
          ])

          const [rToken, stToken, ...collaterals] = await getTokensMeta([
            selectedAddress,
            stTokenAddress,
            ...basket,
          ])

          return updateToken({
            ...rToken,
            stToken,
            collaterals,
          })
        }
      } catch (e) {
        console.log('Error fetching token meta', e)
      }
    },
    [facadeContract]
  )

  useEffect(() => {
    if (selectedAddress) {
      getTokenMeta(selectedAddress)
    }
  }, [selectedAddress, getTokenMeta])

  return null
}

export default ReserveTokenUpdater

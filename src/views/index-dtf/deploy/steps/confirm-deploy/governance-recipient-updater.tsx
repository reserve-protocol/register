import dtfStakingVaultAbi from '@/abis/dtf-index-staking-vault'
import { chainIdAtom } from '@/state/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useReadContract } from 'wagmi'
import { daoTokenAddressAtom } from '../../atoms'
import { governanceRecipientAtom } from './atoms'

const GovernanceRecipientUpdater = () => {
  const chainId = useAtomValue(chainIdAtom)
  const stToken = useAtomValue(daoTokenAddressAtom)
  const setRecipient = useSetAtom(governanceRecipientAtom)
  const { data: tokenJar, error } = useReadContract({
    address: stToken,
    abi: dtfStakingVaultAbi,
    functionName: 'tokenJar',
    chainId,
    query: { enabled: !!stToken, retry: 1 },
  })

  useEffect(() => {
    if (!stToken) return setRecipient(undefined)
    if (error) {
      console.error('[deploy] could not read the vault token jar', error)
      return setRecipient({ stToken, error: error.message })
    }
    setRecipient(tokenJar ? { stToken, tokenJar } : { stToken })
  }, [stToken, tokenJar, error, setRecipient])

  return null
}

export default GovernanceRecipientUpdater

import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { getFolioRoute } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { useDtfSdk, type SupportedChainId } from '@reserve-protocol/react-sdk'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Address, TransactionReceipt } from 'viem'
import { usePublicClient } from 'wagmi'
import { recentProposalsAtom } from '../atoms'
import {
  buildRecentProposalFromReceipt,
  type RecentProposalData,
} from '../utils/recent-proposals'

type HandleRecentProposalReceiptParams = {
  receipt: TransactionReceipt
  governor: Address
  onFallback: () => void
  onSuccess?: (proposal: RecentProposalData) => void
}

export const useRecentProposalReceipt = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const publicClient = usePublicClient({ chainId })
  const sdk = useDtfSdk()
  const navigate = useNavigate()
  const setRecentProposals = useSetAtom(recentProposalsAtom)
  const handledReceipt = useRef<string | undefined>(undefined)

  return useCallback(
    async ({
      receipt,
      governor,
      onFallback,
      onSuccess,
    }: HandleRecentProposalReceiptParams) => {
      if (handledReceipt.current === receipt.transactionHash) return
      handledReceipt.current = receipt.transactionHash

      if (!dtf || !publicClient) {
        onFallback()
        return
      }

      try {
        const { key, proposal } = await buildRecentProposalFromReceipt({
          receipt,
          governor,
          dtf,
          chainId: chainId as SupportedChainId,
          publicClient,
          sdk,
        })

        setRecentProposals((current) => ({
          ...current,
          [key]: proposal,
        }))
        onSuccess?.(proposal)
        navigate(
          getFolioRoute(
            dtf.id,
            chainId,
            `${ROUTES.GOVERNANCE_PROPOSAL}/${proposal.detail.id}`
          )
        )
      } catch {
        onFallback()
      }
    },
    [chainId, dtf, navigate, publicClient, sdk, setRecentProposals]
  )
}

export default useRecentProposalReceipt

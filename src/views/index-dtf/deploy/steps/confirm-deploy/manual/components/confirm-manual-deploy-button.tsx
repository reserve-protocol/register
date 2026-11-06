import TransactionButton, {
  TransactionButtonContainer,
} from '@/components/ui/transaction-button'
import { getWriteContractParams } from '@/components/vote-lock/utils'
import useContractWrite from '@/hooks/useContractWrite'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import {
  basketAtom,
  daoTokenAddressAtom,
  deployedDTFAtom,
} from '@/views/index-dtf/deploy/atoms'
import { readDeployedFolio } from '@/views/index-dtf/deploy/utils/deployed-folio'
import {
  buildV6DeployParams,
  resolveGovernanceRecipient,
} from '@/views/index-dtf/deploy/utils/v6-deploy-params'
import { useLingui } from '@lingui/react/macro'
import {
  generateIndexDtfDeploymentNonce,
  prepareIndexDtfDeploy,
  prepareIndexDtfDeployGoverned,
  type IndexDtfCall,
  type SupportedChainId,
} from '@reserve-protocol/react-sdk'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { getAddress, parseEther, parseUnits } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'
import { governanceRecipientAtom, indexDeployFormDataAtom } from '../../atoms'
import {
  basketRequiredAmountsAtom,
  hasAssetsAllowanceAtom,
  hasBalanceAtom,
  initialTokensAtom,
} from '../atoms'

const useManualDeployCall = (): { call?: IndexDtfCall; error?: string } => {
  const initialTokens = useAtomValue(initialTokensAtom)
  const chainId = useAtomValue(chainIdAtom)
  const formData = useAtomValue(indexDeployFormDataAtom)
  const tokenAmounts = useAtomValue(basketRequiredAmountsAtom)
  const stToken = useAtomValue(daoTokenAddressAtom)
  const basket = useAtomValue(basketAtom)
  const wallet = useAtomValue(walletAtom)
  // One nonce per confirmed form, so the simulated and the sent calldata match.
  const nonce = useMemo(
    () => (formData ? generateIndexDtfDeploymentNonce() : undefined),
    [formData]
  )

  const governance = resolveGovernanceRecipient(
    stToken,
    useAtomValue(governanceRecipientAtom)
  )

  return useMemo(() => {
    if (!formData || !initialTokens || isNaN(Number(initialTokens)) || !wallet)
      return {}
    if (governance.error) return { error: governance.error }
    if (!governance.ready) return {}

    try {
      const basicDetails = {
        name: formData.tokenName,
        symbol: formData.symbol,
        assets: basket.map((token) => token.address),
        amounts: basket.map((token) =>
          parseUnits(
            tokenAmounts[token.address]?.toFixed(token.decimals) ?? '0',
            token.decimals
          )
        ),
        initialShares: parseEther(initialTokens),
      }
      const params = buildV6DeployParams(formData, {
        deployer: wallet,
        governanceRecipient: governance.recipient,
      })
      const target = {
        chainId: chainId as SupportedChainId,
        version: '6.0.0' as const,
        basicDetails,
        additionalDetails: params.additionalDetails,
        flags: params.flags,
        deploymentNonce: nonce,
      }

      if (!stToken) {
        if (!formData.governanceWalletAddress) return {}
        return {
          call: prepareIndexDtfDeploy({
            ...target,
            owner: getAddress(formData.governanceWalletAddress),
            basketManagers: [],
            auctionLaunchers: params.roles.auctionLaunchers,
            brandManagers: params.roles.brandManagers,
          }),
        }
      }

      return {
        call: prepareIndexDtfDeployGoverned({
          ...target,
          stToken,
          governance: params.governance,
          roles: params.roles,
        }),
      }
    } catch (error) {
      console.error('[deploy] could not build the deploy call', error)
      return { error: error instanceof Error ? error.message : String(error) }
    }
  }, [
    formData,
    initialTokens,
    wallet,
    stToken,
    governance.ready,
    governance.recipient,
    governance.error,
    basket,
    tokenAmounts,
    chainId,
    nonce,
  ])
}

const ConfirmManualDeployButton = () => {
  const { t } = useLingui()
  const { watch } = useFormContext()
  const formChainId = watch('chain')
  const { call, error: buildError } = useManualDeployCall()
  const hasAssetsAllowance = useAtomValue(hasAssetsAllowanceAtom)
  const hasBalance = useAtomValue(hasBalanceAtom)
  const setDeployedDTF = useSetAtom(deployedDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const [receiptError, setReceiptError] = useState<string>()
  const { isReady, hash, validationError, error, isLoading, write } =
    useContractWrite({
      ...(call ? (getWriteContractParams(call) as object) : {}),
      query: { enabled: !!call && !!hasAssetsAllowance && hasBalance },
    } as never)

  const { data: receipt, error: txError } = useWaitForTransactionReceipt({
    hash,
    chainId,
  })

  useEffect(() => {
    if (receipt?.status !== 'success') return
    const { folio, error } = readDeployedFolio(receipt.logs, chainId)
    if (folio) setDeployedDTF(folio)
    else setReceiptError(error)
  }, [receipt, chainId, setDeployedDTF])

  let title = isReady ? t`Create DTF` : t`Preparing transaction...`

  if (!hasAssetsAllowance) {
    title = t`Pending allowance...`
  }

  if (hasAssetsAllowance && !hasBalance) {
    title = t`Insufficient asset balance`
  }

  const visibleError =
    buildError ??
    (receipt?.status === 'reverted' ? t`Transaction reverted` : undefined) ??
    (receiptError
      ? t`The DTF was deployed but its address couldn't be read from the transaction. Check the transaction on the explorer.`
      : undefined)

  return (
    <div className="pt-2 border-t">
      <TransactionButtonContainer chain={formChainId}>
        <TransactionButton
          data-testid="deploy-manual-submit"
          disabled={!isReady}
          gas={undefined}
          loading={isLoading || (!!hash && !receipt)}
          loadingText={hash ? t`Confirming tx...` : t`Pending, sign in wallet`}
          onClick={write}
          text={title}
          className="w-full"
          error={
            (visibleError ? new Error(visibleError) : undefined) ??
            validationError ??
            error ??
            txError
          }
        />
      </TransactionButtonContainer>
    </div>
  )
}

export default ConfirmManualDeployButton

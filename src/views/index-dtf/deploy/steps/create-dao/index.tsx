import { Button } from '@/components/ui/button'
import { TransactionButtonContainer } from '@/components/ui/transaction-button'
import { getWriteContractParams } from '@/components/vote-lock/utils'
import { chainIdAtom } from '@/state/atoms'
import {
  extractIndexDtfDeployedStakingVault,
  prepareIndexDtfDeployStakingVault,
  type SupportedChainId,
} from '@reserve-protocol/react-sdk'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { erc20Abi, isAddress, type Address } from 'viem'
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import {
  daoCreatedAtom,
  daoTokenAddressAtom,
  daoTokenSymbolAtom,
  formReadyForSubmitAtom,
} from '../../atoms'
import type { DeployInputs } from '../../form-fields'
import { buildV6Governance } from '../../utils/v6-deploy-params'

const CreateDAO = () => {
  const { t } = useLingui()
  const chainId = useAtomValue(chainIdAtom)
  const formReadyForSubmit = useAtomValue(formReadyForSubmitAtom)
  const { watch, getValues } = useFormContext()
  const governanceERC20address = watch('governanceERC20address')
  const formChainId = watch('chain')
  const setDaoCreated = useSetAtom(daoCreatedAtom)
  const setStTokenAddress = useSetAtom(daoTokenAddressAtom)
  const setStTokenSymbol = useSetAtom(daoTokenSymbolAtom)
  const [buildError, setBuildError] = useState<string>()
  const [receiptError, setReceiptError] = useState<string>()

  const { data: symbol } = useReadContract({
    abi: erc20Abi,
    functionName: 'symbol',
    address: governanceERC20address,
    chainId,
    query: { enabled: isAddress(governanceERC20address) },
  })

  const {
    writeContract,
    data,
    isPending,
    error: prepareWriteError,
  } = useWriteContract()
  const { data: receipt, error: txError } = useWaitForTransactionReceipt({
    hash: data,
    chainId,
  })

  const vlSymbol = `vl${symbol ?? ''}`

  const submit = () => {
    const formData = getValues() as DeployInputs
    setBuildError(undefined)
    try {
      // The vault's own DAO has no Folio yet, so it takes no optimistic selectors.
      const { optimisticSelectors: _, ...vaultGovernance } =
        buildV6Governance(formData)
      writeContract(
        getWriteContractParams(
          prepareIndexDtfDeployStakingVault({
            chainId: chainId as SupportedChainId,
            underlying: governanceERC20address as Address,
            rewardHalfLife: BigInt(
              Math.round(formData.vaultRewardHalfLife * 86_400)
            ),
            unstakingDelay: BigInt(
              Math.round(formData.vaultUnstakingDelay * 86_400)
            ),
            governance: vaultGovernance,
          })
        )
      )
    } catch (error) {
      console.error('[deploy] could not build the vault deploy', error)
      setBuildError(error instanceof Error ? error.message : String(error))
    }
  }

  useEffect(() => {
    if (receipt?.status !== 'success') return
    try {
      const { stakingVault } = extractIndexDtfDeployedStakingVault(
        receipt.logs,
        {
          chainId: chainId as SupportedChainId,
        }
      )
      setStTokenAddress(stakingVault)
      setStTokenSymbol(vlSymbol)
      setDaoCreated(true)
    } catch (error) {
      console.error('[deploy] could not read the new vault', error)
      setReceiptError(error instanceof Error ? error.message : String(error))
    }
  }, [
    receipt,
    chainId,
    vlSymbol,
    setDaoCreated,
    setStTokenAddress,
    setStTokenSymbol,
  ])

  const error =
    buildError ?? receiptError ?? prepareWriteError?.message ?? txError?.message

  return (
    <div className="flex flex-col gap-2">
      <TransactionButtonContainer chain={formChainId}>
        <Button
          data-testid="deploy-create-dao"
          className="w-full"
          disabled={
            !formReadyForSubmit ||
            !governanceERC20address ||
            !symbol ||
            isPending ||
            (data && !receipt)
          }
          onClick={submit}
        >
          {isPending || (data && !receipt)
            ? t`Creating...`
            : symbol
              ? t`Create ${vlSymbol} vault`
              : t`Create vault`}
        </Button>
      </TransactionButtonContainer>
      {error && (
        <div className="px-4 py-2 text-sm font-medium text-red-800 bg-red-100 rounded-md break-words">
          <Trans>Error creating the vote-lock vault.</Trans> {error}
        </div>
      )}
    </div>
  )
}

export default CreateDAO

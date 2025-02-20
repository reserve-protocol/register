import dtfIndexDeployerAbi from '@/abis/dtf-index-deployer-abi'
import TransactionButton, {
  TransactionButtonContainer,
} from '@/components/old/button/TransactionButton'
import useContractWrite from '@/hooks/useContractWrite'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { getCurrentTime } from '@/utils'
import { INDEX_DEPLOYER_ADDRESS } from '@/utils/addresses'
import {
  basketAtom,
  daoCreatedAtom,
  daoTokenAddressAtom,
  deployedDTFAtom,
} from '@/views/index-dtf/deploy/atoms'
import { calculateRevenueDistribution } from '@/views/index-dtf/deploy/utils'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  Address,
  Hex,
  keccak256,
  parseEther,
  parseEventLogs,
  parseUnits,
  toBytes,
} from 'viem'

import { useWaitForTransactionReceipt } from 'wagmi'
import { indexDeployFormDataAtom } from '../../atoms'
import {
  basketRequiredAmountsAtom,
  hasAssetsAllowanceAtom,
  hasBalanceAtom,
  initialTokensAtom,
} from '../atoms'
import { useFormContext } from 'react-hook-form'

type FolioParams = {
  name: string
  symbol: string
  assets: Address[]
  amounts: bigint[]
  initialShares: bigint
}

export type FeeRecipient = {
  recipient: Address
  portion: bigint
}

type FolioConfig = {
  auctionDelay: bigint
  auctionLength: bigint
  feeRecipients: FeeRecipient[]
  tvlFee: bigint
  mintFee: bigint
  mandate: string
}

type GovernanceConfig = {
  votingDelay: number
  votingPeriod: number
  proposalThreshold: bigint
  quorumPercent: bigint
  timelockDelay: bigint
  guardians: Address[]
}

type GovernanceRoles = {
  existingAuctionApprovers: Address[]
  auctionLaunchers: Address[]
  brandManagers: Address[]
}

type DeployParams = [
  Address,
  FolioParams,
  FolioConfig,
  GovernanceConfig,
  GovernanceConfig,
  GovernanceRoles,
  Hex,
]

type DeployParamsUngoverned = [
  FolioParams,
  FolioConfig,
  Address,
  Address[],
  Address[],
  Address[],
  Hex,
]

const txAtom = atom<
  | {
      address: Address
      abi: typeof dtfIndexDeployerAbi
      functionName: 'deployGovernedFolio'
      args: DeployParams
    }
  | {
      address: Address
      abi: typeof dtfIndexDeployerAbi
      functionName: 'deployFolio'
      args: DeployParamsUngoverned
    }
  | undefined
>((get) => {
  const initialTokens = get(initialTokensAtom)
  const chainId = get(chainIdAtom)
  const formData = get(indexDeployFormDataAtom)
  const tokenAmounts = get(basketRequiredAmountsAtom)
  const stToken = get(daoTokenAddressAtom)
  const basket = get(basketAtom)
  const wallet = get(walletAtom)

  if (!formData || !initialTokens || isNaN(Number(initialTokens)) || !wallet)
    return undefined

  const folioParams: FolioParams = {
    name: formData.tokenName,
    symbol: formData.symbol,
    assets: basket.map((token) => token.address),
    amounts: basket.map((token) =>
      parseUnits(
        // TODO: this should not happen? it seems it happens when allocation is 0 for an asset
        tokenAmounts[token.address]?.toFixed(token.decimals) ?? '0',
        token.decimals
      )
    ),
    initialShares: parseEther(initialTokens),
  }

  const folioConfig: FolioConfig = {
    auctionDelay: BigInt(Math.floor((formData.auctionDelay || 0) * 3600)),
    auctionLength: BigInt(Math.floor((formData.auctionLength || 0) * 60)),
    feeRecipients: calculateRevenueDistribution(formData, wallet, stToken),
    tvlFee: parseEther(((formData.folioFee || 0) / 100).toString()),
    mintFee: parseEther(((formData.mintFee || 0) / 100).toString()),
    mandate: formData.mandate || '',
  }

  const guardians = formData.guardians.filter(Boolean) as Address[]
  const brandManagers = formData.brandManagers.filter(Boolean) as Address[]
  const auctionLaunchers = formData.auctionLaunchers.filter(
    Boolean
  ) as Address[]

  if (!stToken) {
    const owner = formData.governanceWalletAddress

    if (!owner) return undefined

    // Ungoverned deploy
    const args: DeployParamsUngoverned = [
      folioParams,
      folioConfig,
      owner,
      [],
      [...auctionLaunchers],
      [...brandManagers],
      keccak256(toBytes(getCurrentTime())),
    ]

    return {
      address: INDEX_DEPLOYER_ADDRESS[chainId],
      abi: dtfIndexDeployerAbi,
      functionName: 'deployFolio',
      args,
    }
  }

  const ownerGovernanceConfig: GovernanceConfig = {
    votingDelay: Math.floor((formData.governanceVotingDelay || 0) * 86400),
    votingPeriod: Math.floor((formData.governanceVotingPeriod || 0) * 86400),
    proposalThreshold: parseEther(
      (formData.governanceVotingThreshold || 0).toString()
    ),
    quorumPercent: BigInt(Math.floor(formData.governanceVotingQuorum || 0)),
    timelockDelay: BigInt(
      Math.floor((formData.governanceExecutionDelay || 0) * 86400)
    ),
    guardians,
  }

  const tradingGovernanceConfig: GovernanceConfig = {
    votingDelay: Math.floor((formData.basketVotingDelay || 0) * 3600),
    votingPeriod: Math.floor((formData.basketVotingPeriod || 0) * 3600),
    proposalThreshold: parseEther(
      (formData.basketVotingThreshold || 0).toString()
    ),
    quorumPercent: BigInt(Math.floor(formData.basketVotingQuorum || 0)),
    timelockDelay: BigInt(
      Math.floor((formData.basketExecutionDelay || 0) * 3600)
    ),
    guardians,
  }

  const args: DeployParams = [
    stToken,
    folioParams,
    folioConfig,
    ownerGovernanceConfig,
    tradingGovernanceConfig,
    {
      existingAuctionApprovers: [],
      auctionLaunchers,
      brandManagers,
    },
    keccak256(toBytes(getCurrentTime())),
  ]

  return {
    address: INDEX_DEPLOYER_ADDRESS[chainId],
    abi: dtfIndexDeployerAbi,
    functionName: 'deployGovernedFolio',
    args,
  }
})

const ConfirmManualDeployButton = () => {
  const { watch } = useFormContext()
  const formChainId = watch('chain')
  const tx = useAtomValue(txAtom)
  const daoCreated = useAtomValue(daoCreatedAtom)
  const hasAssetsAllowance = useAtomValue(hasAssetsAllowanceAtom)
  const hasBalance = useAtomValue(hasBalanceAtom)
  const setDeployedDTF = useSetAtom(deployedDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const { isReady, hash, validationError, error, isLoading, write } =
    useContractWrite({
      ...tx,
      query: { enabled: !!hasAssetsAllowance && hasBalance },
    })

  const { data: receipt, error: txError } = useWaitForTransactionReceipt({
    hash,
    chainId,
  })

  useEffect(() => {
    if (receipt) {
      const event = parseEventLogs({
        abi: dtfIndexDeployerAbi,
        logs: receipt.logs,
        eventName: daoCreated ? 'GovernedFolioDeployed' : 'FolioDeployed',
      })[0]

      // TODO: Handle edge case when event is not found? why would that happen?
      if (event) {
        const { folio } = event.args
        setDeployedDTF(folio)
      }
    }
  }, [receipt])

  let title = isReady ? 'Create DTF' : 'Preparing transaction...'

  if (!hasAssetsAllowance) {
    title = 'Pending allowance...'
  }

  if (hasAssetsAllowance && !hasBalance) {
    title = 'Insufficient asset balance'
  }

  return (
    <div className="pt-2 border-t">
      <TransactionButtonContainer chain={formChainId}>
        <TransactionButton
          disabled={!isReady}
          gas={undefined}
          loading={isLoading || !!hash}
          loadingText={!!hash ? 'Confirming tx...' : 'Pending, sign in wallet'}
          onClick={write}
          text={title}
          fullWidth
          error={validationError || error || txError}
        />
      </TransactionButtonContainer>
    </div>
  )
}

export default ConfirmManualDeployButton

import dtfIndexDeployerAbi from '@/abis/dtf-index-deployer-abi'
import TransactionButton from '@/components/old/button/TransactionButton'
import useContractWrite from '@/hooks/useContractWrite'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { INDEX_DEPLOYER_ADDRESS } from '@/utils/addresses'
import {
  basketAtom,
  daoCreatedAtom,
  daoTokenAddressAtom,
  deployedDTFAtom,
} from '@/views/index-dtf/deploy/atoms'
import { DeployInputs } from '@/views/index-dtf/deploy/form-fields'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Address, parseEther, parseEventLogs, parseUnits } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'
import { indexDeployFormDataAtom } from '../../atoms'
import {
  basketRequiredAmountsAtom,
  hasAssetsAllowanceAtom,
  initialTokensAtom,
} from '../atoms'

type FolioParams = {
  name: string
  symbol: string
  assets: Address[]
  amounts: bigint[]
  initialShares: bigint
}

type FeeRecipient = {
  recipient: Address
  portion: bigint
}

type FolioConfig = {
  tradeDelay: bigint
  auctionLength: bigint
  feeRecipients: FeeRecipient[]
  folioFee: bigint
  mintingFee: bigint
}

type GovernanceConfig = {
  votingDelay: number
  votingPeriod: number
  proposalThreshold: bigint
  quorumPercent: bigint
  timelockDelay: bigint
  guardian: Address
}

type GovernanceRoles = {
  existingTradeProposers: Address[]
  tradeLaunchers: Address[]
  vibesOfficers: Address[]
}

type DeployParams = [
  Address,
  FolioParams,
  FolioConfig,
  GovernanceConfig,
  GovernanceConfig,
  GovernanceRoles,
]

type DeployParamsUngoverned = [
  FolioParams,
  FolioConfig,
  Address,
  Address[],
  Address[],
  Address[],
]

function calculateShare(sharePercentage: number, denominator: number) {
  const share = sharePercentage / 100

  if (denominator > 0) {
    const shareNumerator = share / denominator
    return parseEther(shareNumerator.toString())
  }

  return parseEther(share.toString())
}

function calculateRevenueDistribution(
  formData: DeployInputs,
  wallet: Address,
  stToken?: Address
) {
  const totalSharesDenominator = (100 - formData.fixedPlatformFee) / 100

  let revenueDistribution: FeeRecipient[] = (
    formData.additionalRevenueRecipients || []
  ).map((recipient) => ({
    recipient: recipient.address,
    portion: calculateShare(recipient.share, totalSharesDenominator),
  }))

  // Add deployer share if not the last one
  if (formData.deployerShare > 0) {
    revenueDistribution.push({
      recipient: wallet,
      portion: calculateShare(formData.deployerShare, totalSharesDenominator),
    })
  }

  // Add governance share if not the last one
  if (formData.governanceShare > 0 && stToken) {
    revenueDistribution.push({
      recipient: stToken,
      portion: calculateShare(formData.governanceShare, totalSharesDenominator),
    })
  }

  // Calculate sum of all portions so far
  if (revenueDistribution.length > 1) {
    const currentSum = revenueDistribution
      .slice(0, -1)
      .reduce((sum, item) => sum + item.portion, 0n)

    revenueDistribution[revenueDistribution.length - 1].portion =
      parseEther('1') - currentSum
  }

  revenueDistribution.sort((a, b) => (a.recipient < b.recipient ? -1 : 1))

  return revenueDistribution
}

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

  if (!formData || !initialTokens || !wallet) return undefined

  const folioParams: FolioParams = {
    name: formData.name,
    symbol: formData.symbol,
    assets: basket.map((token) => token.address),
    amounts: basket.map((token) =>
      parseUnits(tokenAmounts[token.address].toString(), token.decimals)
    ),
    initialShares: parseEther(initialTokens),
  }

  const folioConfig: FolioConfig = {
    tradeDelay: BigInt(
      (formData.auctionDelay || formData.customAuctionDelay || 0)! * 60
    ),
    auctionLength: BigInt(
      (formData.auctionLength || formData.customAuctionLength || 0)! * 60
    ),
    feeRecipients: calculateRevenueDistribution(formData, wallet, stToken),
    folioFee: BigInt(
      439591053.36 * (formData.folioFee || formData.customFolioFee || 0)!
    ),
    mintingFee: parseEther(
      ((formData.mintFee || formData.customMintFee || 0)! / 100).toString()
    ),
  }

  if (!stToken) {
    // Ungoverned deploy
    const args: DeployParamsUngoverned = [
      folioParams,
      folioConfig,
      wallet,
      [
        formData.auctionLauncher!,
        ...(formData.additionalAuctionLaunchers ?? []),
      ],
      [
        formData.auctionLauncher!,
        ...(formData.additionalAuctionLaunchers ?? []),
      ],
      [formData.brandManagerAddress!],
    ]

    return {
      address: INDEX_DEPLOYER_ADDRESS[chainId],
      abi: dtfIndexDeployerAbi,
      functionName: 'deployFolio',
      args,
    }
  }

  const ownerGovernanceConfig: GovernanceConfig = {
    votingDelay:
      (formData.governanceVotingDelay ||
        formData.customGovernanceVotingDelay ||
        0)! * 60,
    votingPeriod:
      (formData.governanceVotingPeriod ||
        formData.customGovernanceVotingPeriod ||
        0)! * 60,
    proposalThreshold: parseEther(
      (formData.governanceVotingThreshold ||
        formData.customGovernanceVotingThreshold ||
        0)!.toString()
    ),
    quorumPercent: BigInt(
      (formData.governanceVotingQuorum ||
        formData.customGovernanceVotingQuorum ||
        0)!
    ),
    timelockDelay: BigInt(
      (formData.governanceExecutionDelay ||
        formData.customGovernanceExecutionDelay ||
        0)! * 60
    ),
    guardian: formData.guardianAddress!,
  }

  const tradingGovernanceConfig: GovernanceConfig = {
    votingDelay:
      (formData.basketVotingDelay || formData.customBasketVotingDelay || 0)! *
      60,
    votingPeriod:
      (formData.basketVotingPeriod || formData.customBasketVotingPeriod || 0)! *
      60,
    proposalThreshold: parseEther(
      (formData.basketVotingThreshold ||
        formData.customBasketVotingThreshold ||
        0)!.toString()
    ),
    quorumPercent: BigInt(
      (formData.basketVotingQuorum || formData.customBasketVotingQuorum || 0)!
    ),
    timelockDelay: BigInt(
      (formData.basketExecutionDelay ||
        formData.customBasketExecutionDelay ||
        0)! * 60
    ),
    guardian: formData.guardianAddress!,
  }

  const args: DeployParams = [
    stToken,
    folioParams,
    folioConfig,
    ownerGovernanceConfig,
    tradingGovernanceConfig,
    {
      existingTradeProposers: [],
      tradeLaunchers: [
        formData.auctionLauncher!,
        ...(formData.additionalAuctionLaunchers ?? []),
      ],
      vibesOfficers: [formData.brandManagerAddress!],
    },
  ]

  return {
    address: INDEX_DEPLOYER_ADDRESS[chainId],
    abi: dtfIndexDeployerAbi,
    functionName: 'deployGovernedFolio',
    args,
  }
})

const ConfirmManualDeployButton = () => {
  const tx = useAtomValue(txAtom)
  const daoCreated = useAtomValue(daoCreatedAtom)
  const hasAssetsAllowance = useAtomValue(hasAssetsAllowanceAtom)
  const setDeployedDTF = useSetAtom(deployedDTFAtom)

  const { isReady, gas, hash, validationError, error, isLoading, write } =
    useContractWrite({ ...tx, query: { enabled: !!hasAssetsAllowance } })

  const { data: receipt, error: txError } = useWaitForTransactionReceipt({
    hash,
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

  return (
    <div>
      <TransactionButton
        disabled={!isReady}
        gas={gas}
        loading={isLoading || !!hash}
        loadingText={!!hash ? 'Confirming tx...' : 'Pending, sign in wallet'}
        onClick={write}
        text={isReady ? 'Deploy' : 'Preparing deploy...'}
        fullWidth
        error={validationError || error || txError}
      />
    </div>
  )
}

export default ConfirmManualDeployButton

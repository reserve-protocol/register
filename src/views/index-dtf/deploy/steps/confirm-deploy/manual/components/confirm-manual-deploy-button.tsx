import dtfIndexDeployerAbi from '@/abis/dtf-index-deployer-abi'
import TransactionButton from '@/components/old/button/TransactionButton'
import useContractWrite from '@/hooks/useContractWrite'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { INDEX_DEPLOYER_ADDRESS } from '@/utils/addresses'
import { atom, useAtomValue } from 'jotai'
import { Address, parseEther, parseEventLogs, parseUnits } from 'viem'
import { indexDeployFormDataAtom } from '../../atoms'
import { assetDistributionAtom, initialTokensAtom } from '../atoms'
import { basketAtom, daoTokenAddressAtom } from '@/views/index-dtf/deploy/atoms'
import { DeployInputs } from '@/views/index-dtf/deploy/form-fields'
import { useWaitForTransactionReceipt } from 'wagmi'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

type FolioParams = {
  name: string
  symbol: string
  assets: Address[]
  amounts: bigint[]
  initialShares: bigint
}

type FolioConfig = {
  tradeDelay: bigint
  auctionLength: bigint
  feeRecipients: {
    recipient: Address
    portion: bigint
  }[]
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

type DeployParamsUngoverned = [
  Address,
  FolioParams,
  FolioConfig,
  Address,
  Address[],
  Address[],
]

type DeployParams = [
  Address,
  FolioParams,
  FolioConfig,
  GovernanceConfig,
  GovernanceConfig,
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
  stToken: Address
) {
  const totalSharesDenominator = (100 - formData.fixedPlatformFee) / 100

  let revenueDistribution: { recipient: Address; portion: bigint }[] = (
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
  if (formData.governanceShare > 0) {
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

  revenueDistribution.sort((a, b) => (a.portion < b.portion ? -1 : 1))

  return revenueDistribution
}

const txAtom = atom<
  | {
      address: Address
      abi: typeof dtfIndexDeployerAbi
      functionName: 'deployGovernedFolio'
      args: DeployParams
    }
  | undefined
>((get) => {
  const initialTokens = get(initialTokensAtom)
  const chainId = get(chainIdAtom)
  const formData = get(indexDeployFormDataAtom)
  const distribution = get(assetDistributionAtom)
  const stToken = get(daoTokenAddressAtom)
  const basket = get(basketAtom)
  const wallet = get(walletAtom)

  if (!formData || !initialTokens || !stToken || !wallet) return undefined

  const args: DeployParams = [
    stToken,
    {
      name: formData.name,
      symbol: formData.symbol,
      assets: basket.map((token) => token.address),
      amounts: basket.map((token) =>
        parseUnits(distribution[token.address].toString(), token.decimals)
      ),
      initialShares: parseEther(initialTokens),
    },
    {
      tradeDelay: BigInt(formData.auctionDelay! * 60),
      auctionLength: BigInt(formData.auctionLength! * 60),
      feeRecipients: calculateRevenueDistribution(formData, wallet, stToken),
      folioFee: BigInt(439591053.36 * formData.folioFee!),
      mintingFee: parseEther((formData.mintFee! / 100).toString()),
    },
    {
      votingDelay: formData.governanceVotingDelay! * 60,
      votingPeriod: formData.governanceVotingPeriod! * 60,
      proposalThreshold: parseEther(
        formData.governanceVotingThreshold!.toString()
      ),
      quorumPercent: BigInt(formData.governanceVotingQuorum!),
      timelockDelay: BigInt(formData.governanceExecutionDelay! * 60),
      guardian: formData.guardianAddress!,
    },
    {
      votingDelay: formData.basketVotingDelay! * 60,
      votingPeriod: formData.basketVotingPeriod! * 60,
      proposalThreshold: parseEther(formData.basketVotingThreshold!.toString()),
      quorumPercent: BigInt(formData.basketVotingQuorum!),
      timelockDelay: BigInt(formData.basketExecutionDelay! * 60),
      guardian: formData.guardianAddress!,
    },
    [formData.auctionLauncher!, ...(formData.additionalAuctionLaunchers ?? [])],
    [formData.brandManagerAddress!],
  ]

  return {
    address: INDEX_DEPLOYER_ADDRESS[chainId],
    abi: dtfIndexDeployerAbi,
    functionName: 'deployGovernedFolio',
    args,
  }
})

const ConfirmManualDeployButton = () => {
  const navigate = useNavigate()
  const chainId = useAtomValue(chainIdAtom)
  const tx = useAtomValue(txAtom)
  const { isReady, gas, hash, validationError, error, isLoading, write } =
    useContractWrite(tx)

  const {
    data: receipt,
    isSuccess,
    isError: txError,
  } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (receipt) {
      const event = parseEventLogs({
        abi: dtfIndexDeployerAbi,
        logs: receipt.logs,
        eventName: 'FolioDeployed',
      })[0]

      // TODO: Handle edge case when event is not found? why would that happen?
      if (event) {
        navigate(`/${chainId}/dtf/${event.args.folio}`)
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
        error={validationError || error}
      />
    </div>
  )
}

export default ConfirmManualDeployButton

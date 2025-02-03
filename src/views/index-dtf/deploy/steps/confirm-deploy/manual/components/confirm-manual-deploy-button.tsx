import dtfIndexDeployerAbi from '@/abis/dtf-index-deployer-abi'
import TransactionButton from '@/components/old/button/TransactionButton'
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
  numberToBytes,
  parseEther,
  parseEventLogs,
  parseUnits,
  toBytes,
  toHex,
  zeroAddress,
} from 'viem'

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

  if (!formData || !initialTokens || !wallet) return undefined

  const folioParams: FolioParams = {
    name: formData.tokenName,
    symbol: formData.symbol,
    assets: basket.map((token) => token.address),
    amounts: basket.map((token) =>
      parseUnits(tokenAmounts[token.address].toString(), token.decimals)
    ),
    initialShares: parseEther(initialTokens),
  }

  const folioConfig: FolioConfig = {
    auctionDelay: BigInt(Math.floor((formData.auctionDelay || 0)! * 3600)),
    auctionLength: BigInt(Math.floor((formData.auctionLength || 0)! * 60)),
    feeRecipients: calculateRevenueDistribution(formData, wallet, stToken),
    tvlFee: parseEther(((formData.folioFee || 0)! / 100).toString()),
    mintFee: parseEther(((formData.mintFee || 0)! / 100).toString()),
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
    votingDelay: (formData.governanceVotingDelay || 0)! * 60,
    votingPeriod: (formData.governanceVotingPeriod || 0)! * 60,
    proposalThreshold: parseEther(
      (formData.governanceVotingThreshold || 0)!.toString()
    ),
    quorumPercent: BigInt(Math.floor((formData.governanceVotingQuorum || 0)!)),
    timelockDelay: BigInt(
      Math.floor((formData.governanceExecutionDelay || 0)! * 60)
    ),
    guardians,
  }

  const tradingGovernanceConfig: GovernanceConfig = {
    votingDelay: (formData.basketVotingDelay || 0)! * 60,
    votingPeriod: (formData.basketVotingPeriod || 0)! * 60,
    proposalThreshold: parseEther(
      (formData.basketVotingThreshold || 0)!.toString()
    ),
    quorumPercent: BigInt(Math.floor((formData.basketVotingQuorum || 0)!)),
    timelockDelay: BigInt(
      Math.floor((formData.basketExecutionDelay || 0)! * 60)
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
  const tx = useAtomValue(txAtom)
  const daoCreated = useAtomValue(daoCreatedAtom)
  const hasAssetsAllowance = useAtomValue(hasAssetsAllowanceAtom)
  const setDeployedDTF = useSetAtom(deployedDTFAtom)

  const { isReady, gas, hash, validationError, error, isLoading, write } =
    useContractWrite({ ...tx, query: { enabled: !!hasAssetsAllowance } })

  const { data: receipt, error: txError } = useWaitForTransactionReceipt({
    hash,
  })

  console.log('validation error', validationError)

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

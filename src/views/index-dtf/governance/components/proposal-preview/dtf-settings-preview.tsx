import dtfStakingVaultAbi from '@/abis/dtf-index-staking-vault'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFFeeAtom } from '@/state/dtf/atoms'
import { DecodedCalldata } from '@/types'
import EnsName from '@/components/utils/ens-name'
import { isLoaded, shortenAddress } from '@/utils'
import { getFeePercentAdjust, isDisplayablePlatformFee } from '@/utils/fees'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { Plural, Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import {
  ArrowUpRight,
  Clock,
  Edit2,
  FileLock2,
  MinusCircle,
  PlusCircle,
  Shield,
  Trash,
  Users,
  Wand2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatEther, toFunctionSelector, zeroHash } from 'viem'
import type { Address, Hex } from 'viem'
import { useReadContract } from 'wagmi'

const OPTIMISTIC_PROPOSER_ROLE =
  '0x26f49d08685d9cdd4951a7470bc8fbe9dd0f00419c1a44c1b89f845867ae12e0'

const OPTIMISTIC_SELECTOR_LABELS: Record<string, MessageDescriptor> = {
  [toFunctionSelector(
    'startRebalance((address,(uint256,uint256,uint256),(uint256,uint256),uint256,bool)[],(uint256,uint256,uint256),uint256,uint256)'
  )]: msg`Start rebalance`,
  [toFunctionSelector('setAuctionLength(uint256)')]: msg`Auction length`,
  [toFunctionSelector('setBidsEnabled(bool)')]: msg`Permissionless bids`,
  [toFunctionSelector('setFeeRecipients((address,uint96)[])')]:
    msg`Fee recipients`,
  [toFunctionSelector('setMandate(string)')]: msg`Mandate`,
  [toFunctionSelector('setMintFee(uint256)')]: msg`Mint fee`,
  [toFunctionSelector('setName(string)')]: msg`Token name`,
  [toFunctionSelector('setRebalanceControl((bool,uint8))')]:
    msg`Rebalance control`,
  [toFunctionSelector('setTVLFee(uint256)')]: msg`TVL fee`,
  [toFunctionSelector('setTrustedFillerRegistry(address,bool)')]:
    msg`Trusted fillers`,
}

type Translate = (descriptor: MessageDescriptor) => string

const formatSelectorLabel = (selector: Hex, t: Translate) => {
  const label = OPTIMISTIC_SELECTOR_LABELS[selector.toLowerCase()]

  return label ? t(label) : selector
}

// Preview component for setMandate function
export const SetMandatePreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const newMandate = decodedCalldata.data[0] as string

  return (
    <div className="rounded-2xl border bg-muted/70 p-2 space-y-3">
      <div className="flex items-center gap-2 ml-2 pt-2">
        <Edit2 size={16} className="text-primary" />
        <div className="text-sm font-medium">
          <Trans>Update Mandate</Trans>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-background/80 text-sm">
        <div className="break-words text-muted-foreground">{newMandate}</div>
      </div>
    </div>
  )
}

// Preview component for removeFromBasket function
export const RemoveFromBasketPreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const tokenAddress = decodedCalldata.data[0] as string

  return (
    <div className="rounded-2xl border bg-muted/70 p-2 space-y-3">
      <div className="flex items-center gap-2 ml-2 pt-2">
        <MinusCircle size={16} className="text-destructive" />
        <div className="text-sm font-medium">
          <Trans>Remove Token from Basket</Trans>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            <Trans>Token:</Trans>
          </span>
          <Link
            to={getExplorerLink(
              tokenAddress,
              chainId,
              ExplorerDataType.ADDRESS
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-destructive hover:underline flex items-center gap-1"
          >
            {shortenAddress(tokenAddress)}
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  )
}

// Preview component for grantRole function
export const GrantRolePreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const { t } = useLingui()
  const chainId = useAtomValue(chainIdAtom)
  const [roleHash, account] = decodedCalldata.data as [string, string]

  // Map role hashes to readable names
  const roleNames: Record<string, string> = {
    [zeroHash]: t`Default Admin`,
    '0xfd643c72710c63c0180259aba6b2d05451e3591a24e58b62239378085726f783': t`Guardian`,
    '0x2d8e650da9bd8c373ab2450d770f2ed39549bfc28d3630025cecc51511bcd374': t`Brand Manager`,
    '0x13ff1b2625181b311f257c723b5e6d366eb318b212d9dd694c48fcf227659df5': t`Auction Launcher`,
    '0x4ff6ae4d6a29e79ca45c6441bdc89b93878ac6118485b33c8baa3749fc3cb130': t`Rebalance Manager`,
    [OPTIMISTIC_PROPOSER_ROLE]: t`Optimistic Proposer`,
  }

  const roleName = roleNames[roleHash] || t`Unknown Role`

  return (
    <div className="rounded-2xl border bg-muted/70 p-2 space-y-3">
      <div className="flex items-center gap-2 ml-2 pt-2">
        <PlusCircle size={16} className="text-success" />
        <div className="text-sm font-medium">
          <Trans>Grant Role</Trans>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-success/5 border border-success/20">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={14} className="text-success" />
          <span className="text-sm text-success">{roleName}</span>
        </div>
        <Link
          to={getExplorerLink(account, chainId, ExplorerDataType.ADDRESS)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          <EnsName address={account} />
          <ArrowUpRight size={12} />
        </Link>
      </div>
    </div>
  )
}

// Preview component for revokeRole function
export const RevokeRolePreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const { t } = useLingui()
  const chainId = useAtomValue(chainIdAtom)
  const [roleHash, account] = decodedCalldata.data as [string, string]

  const roleNames: Record<string, string> = {
    [zeroHash]: t`Default Admin`,
    '0xfd643c72710c63c0180259aba6b2d05451e3591a24e58b62239378085726f783': t`Guardian`,
    '0x2d8e650da9bd8c373ab2450d770f2ed39549bfc28d3630025cecc51511bcd374': t`Brand Manager`,
    '0x13ff1b2625181b311f257c723b5e6d366eb318b212d9dd694c48fcf227659df5': t`Auction Launcher`,
    '0x4ff6ae4d6a29e79ca45c6441bdc89b93878ac6118485b33c8baa3749fc3cb130': t`Rebalance Manager`,
    [OPTIMISTIC_PROPOSER_ROLE]: t`Optimistic Proposer`,
  }

  const roleName = roleNames[roleHash] || t`Unknown Role`

  return (
    <div className="rounded-2xl border bg-muted/70 p-2 space-y-3">
      <div className="flex items-center gap-2 ml-2 pt-2">
        <MinusCircle size={16} className="text-destructive" />
        <div className="text-sm font-medium">
          <Trans>Revoke Role</Trans>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={14} className="text-destructive" />
          <span className="text-sm text-destructive">{roleName}</span>
        </div>
        <Link
          to={getExplorerLink(account, chainId, ExplorerDataType.ADDRESS)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          <EnsName address={account} />
          <ArrowUpRight size={12} />
        </Link>
      </div>
    </div>
  )
}

// Preview component for setFeeRecipients function
export const SetFeeRecipientsPreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const platformFee = useAtomValue(indexDTFFeeAtom)
  const { data: tokenJar } = useReadContract({
    abi: dtfStakingVaultAbi,
    address: indexDTF?.stToken?.id,
    functionName: 'tokenJar',
    chainId: indexDTF?.chainId,
    query: {
      enabled: !!indexDTF?.stToken?.id,
    },
  })
  const recipients = decodedCalldata.data[0] as Array<{
    recipient: string
    portion: bigint
  }>

  if (!indexDTF || !isLoaded(platformFee)) return null

  // A fee outside [0, 100) has no real share-of-total split — surface "Unavailable", never fabricate.
  if (!isDisplayablePlatformFee(platformFee)) {
    return (
      <div className="rounded-2xl border bg-muted/70 p-2 space-y-3">
        <div className="flex items-center gap-2 ml-2 pt-2">
          <Users size={16} className="text-primary" />
          <div className="text-sm font-medium">
            <Trans>Update Revenue Distribution</Trans>
          </div>
        </div>
        <div
          className="p-3 rounded-xl bg-background/80 border"
          data-testid="settings-preview-fee-unavailable"
        >
          <span className="text-sm text-muted-foreground">
            <Trans>Revenue distribution unavailable</Trans>
          </span>
        </div>
      </div>
    )
  }

  // Parse recipients into categories
  const externalRecipients: Array<{ address: string; percentage: number }> = []
  let deployerShare = 0
  let governanceShare = 0

  // Fees routed to the stToken OR its tokenJar are the governance share.
  const governanceRecipients = new Set(
    [indexDTF.stToken?.id, tokenJar]
      .filter(Boolean)
      .map((address) => (address as string).toLowerCase())
  )

  recipients?.forEach((recipient) => {
    const percentage = (Number(recipient.portion) / 1e18) * 100
    const address = recipient.recipient.toLowerCase()

    if (address === indexDTF.deployer.toLowerCase()) {
      deployerShare = percentage
    } else if (governanceRecipients.has(address)) {
      governanceShare = percentage
    } else {
      externalRecipients.push({
        address: recipient.recipient,
        percentage,
      })
    }
  })

  // Calldata percentages exclude the platform fee — divide by PERCENT_ADJUST for share of total revenue.
  const PERCENT_ADJUST = getFeePercentAdjust(platformFee)
  const adjustedDeployerShare = deployerShare / PERCENT_ADJUST
  const adjustedGovernanceShare = governanceShare / PERCENT_ADJUST
  const adjustedExternalRecipients = externalRecipients.map((r) => ({
    ...r,
    percentage: r.percentage / PERCENT_ADJUST,
  }))

  return (
    <div className="rounded-2xl border bg-muted/70 p-2 space-y-3">
      <div className="flex items-center gap-2 ml-2 pt-2">
        <Users size={16} className="text-primary" />
        <div className="text-sm font-medium">
          <Trans>Update Revenue Distribution</Trans>
        </div>
      </div>
      <div className="space-y-2">
        {/* Platform Fee (Fixed) */}
        <div className="p-3 rounded-xl bg-background/80 border opacity-60">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              <Trans>Platform (Fixed)</Trans>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm">{platformFee}%</span>
            </div>
          </div>
        </div>

        {/* Governance Share */}
        {adjustedGovernanceShare > 0 && (
          <div className="p-3 rounded-xl bg-background/80 border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                <Trans>Governance</Trans>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-primary">
                  {adjustedGovernanceShare.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Deployer Share */}
        {adjustedDeployerShare > 0 && (
          <div className="p-3 rounded-xl bg-background/80 border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                <Trans>Creator</Trans>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-primary">
                  {adjustedDeployerShare.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Additional Recipients */}
        {adjustedExternalRecipients.map((recipient, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-background/80 border">
            <div className="flex items-center justify-between">
              <Link
                to={getExplorerLink(
                  recipient.address,
                  indexDTF.chainId,
                  ExplorerDataType.ADDRESS
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                {shortenAddress(recipient.address)}
                <ArrowUpRight size={12} />
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-sm text-primary">
                  {recipient.percentage.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Preview component for setMintFee function
export const SetMintFeePreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const fee = decodedCalldata.data[0] as bigint
  // Convert from parseEther (18 decimals) to percentage
  // The fee is stored as dtfRevenueChanges.mintFee / 100 in parseEther format
  const percentage = (Number(fee) / 1e18) * 100

  return (
    <div className="rounded-2xl border bg-muted/70 p-2 space-y-3">
      <div className="flex items-center gap-2 ml-2 pt-2">
        <Edit2 size={16} className="text-primary" />
        <div className="text-sm font-medium">
          <Trans>Update Mint Fee</Trans>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            <Trans>New mint fee:</Trans>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-primary">
              {percentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Preview component for setTVLFee function
export const SetTVLFeePreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const fee = decodedCalldata.data[0] as bigint
  // Convert from parseEther to percentage (e.g., 0.015 ether = 1.5%)
  const percentage = Number(fee) / 1e16 // divide by 1e16 to get percentage

  return (
    <div className="rounded-2xl border bg-muted/70 p-2 space-y-3">
      <div className="flex items-center gap-2 ml-2 pt-2">
        <Edit2 size={16} className="text-primary" />
        <div className="text-sm font-medium">
          <Trans>Update Annualized TVL Fee</Trans>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            <Trans>New TVL fee:</Trans>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-primary">
              {percentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Preview component for setAuctionLength function
export const SetAuctionLengthPreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const lengthInSeconds = Number(decodedCalldata.data[0])
  const lengthInMinutes = lengthInSeconds / 60

  return (
    <div className="rounded-2xl border bg-muted/70 p-2 space-y-3">
      <div className="flex items-center gap-2 ml-2 pt-2">
        <Edit2 size={16} className="text-primary" />
        <div className="text-sm font-medium">
          <Trans>Update Auction Length</Trans>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            <Trans>New auction duration:</Trans>
          </span>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-primary" />
            <span className="text-sm font-medium text-primary">
              <Plural
                value={lengthInMinutes}
                one="# minute"
                other="# minutes"
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Preview component for setDustAmount function (used in v2 tokens)
export const SetDustAmountPreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const [tokenAddress, amount] = decodedCalldata.data as [string, bigint]

  return (
    <div className="rounded-2xl border bg-muted/70 p-2 space-y-3">
      <div className="flex items-center gap-2 ml-2 pt-2">
        <Trash size={16} className="text-muted-foreground" />
        <div className="text-sm font-medium">
          <Trans>Set Dust Amount (Pre-requisite)</Trans>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-background/80 border">
        <div className="text-sm text-muted-foreground mb-2">
          <Trans>Setting dust amount for token removal</Trans>
        </div>
        <Link
          to={getExplorerLink(tokenAddress, chainId, ExplorerDataType.ADDRESS)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          {shortenAddress(tokenAddress)}
          <ArrowUpRight size={12} />
        </Link>
      </div>
    </div>
  )
}

// Preview component for setVotingDelay function
export const SetVotingDelayPreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const delayInSeconds = Number(decodedCalldata.data[0])
  const delayInDays = delayInSeconds / 86400
  const delayInHours = delayInSeconds / 3600

  return (
    <div className="rounded-2xl border bg-muted/70 p-2 space-y-3">
      <div className="flex items-center gap-2 ml-2 pt-2">
        <Edit2 size={16} className="text-primary" />
        <div className="text-sm font-medium">
          <Trans>Update Voting Delay</Trans>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            <Trans>New voting delay:</Trans>
          </span>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-primary" />
            <span className="text-sm font-medium text-primary">
              {delayInDays < 1 ? (
                <Plural value={delayInHours} one="# hour" other="# hours" />
              ) : (
                <Plural value={delayInDays} one="# day" other="# days" />
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Preview component for setVotingPeriod function
export const SetVotingPeriodPreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const periodInSeconds = Number(decodedCalldata.data[0])
  const periodInDays = periodInSeconds / 86400
  const periodInHours = periodInSeconds / 3600

  return (
    <div className="rounded-2xl border bg-muted/70 p-2 space-y-3">
      <div className="flex items-center gap-2 ml-2 pt-2">
        <Edit2 size={16} className="text-primary" />
        <div className="text-sm font-medium">
          <Trans>Update Voting Period</Trans>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            <Trans>New voting period:</Trans>
          </span>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-primary" />
            <span className="text-sm font-medium text-primary">
              {periodInDays < 1 ? (
                <Plural value={periodInHours} one="# hour" other="# hours" />
              ) : (
                <Plural value={periodInDays} one="# day" other="# days" />
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Preview component for setProposalThreshold function
export const SetProposalThresholdPreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const threshold = decodedCalldata.data[0] as bigint
  // Convert from parseEther to percentage
  const percentage = (Number(threshold) / 1e18) * 100

  return (
    <div className="rounded-2xl border bg-muted/70 p-2 space-y-3">
      <div className="flex items-center gap-2 ml-2 pt-2">
        <Edit2 size={16} className="text-primary" />
        <div className="text-sm font-medium">
          <Trans>Update Proposal Threshold</Trans>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            <Trans>New proposal threshold:</Trans>
          </span>
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-primary" />
            <span className="text-sm text-primary">
              {percentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Preview component for updateQuorumNumerator function
export const UpdateQuorumNumeratorPreview = ({
  decodedCalldata,
  targetAddress,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const quorumNumerator = decodedCalldata.data[0] as bigint

  // Determine which governance this is for based on the target address
  let quorumDenominator = 0

  if (targetAddress) {
    const target = targetAddress.toLowerCase()

    if (target === indexDTF?.ownerGovernance?.id?.toLowerCase()) {
      quorumDenominator = Number(indexDTF.ownerGovernance.quorumDenominator)
    } else if (target === indexDTF?.tradingGovernance?.id?.toLowerCase()) {
      quorumDenominator = Number(indexDTF.tradingGovernance.quorumDenominator)
    } else if (target === indexDTF?.stToken?.governance?.id?.toLowerCase()) {
      quorumDenominator = Number(indexDTF.stToken.governance.quorumDenominator)
    }
  }

  // Calculate percentage
  const percentage =
    quorumDenominator > 0
      ? (Number(quorumNumerator) / quorumDenominator) * 100
      : 0

  return (
    <div className="rounded-2xl border bg-muted/70 p-2 space-y-3">
      <div className="flex items-center gap-2 ml-2 pt-2">
        <Edit2 size={16} className="text-primary" />
        <div className="text-sm font-medium">
          <Trans>Update Voting Quorum</Trans>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            <Trans>New voting quorum:</Trans>
          </span>
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-primary" />
            <span className="text-sm text-primary">
              {percentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Preview component for updateDelay function (timelock)
export const UpdateDelayPreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const delayInSeconds = Number(decodedCalldata.data[0])
  const delayInDays = delayInSeconds / 86400
  const delayInHours = delayInSeconds / 3600

  return (
    <div className="rounded-2xl border bg-muted/70 p-2 space-y-3">
      <div className="flex items-center ml-2 pt-2 gap-2">
        <Edit2 size={16} className="text-primary" />
        <div className="text-sm font-medium">
          <Trans>Update Execution Delay</Trans>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            <Trans>New execution delay:</Trans>
          </span>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-primary" />
            <span className="text-sm font-medium text-primary">
              {delayInDays < 1 ? (
                <Plural value={delayInHours} one="# hour" other="# hours" />
              ) : (
                <Plural value={delayInDays} one="# day" other="# days" />
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export const SetOptimisticParamsPreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const params = decodedCalldata.data[0] as {
    vetoDelay?: bigint | number
    vetoPeriod?: bigint | number
    vetoThreshold?: bigint
  }
  const vetoDelay = Number(params.vetoDelay ?? 0)
  const vetoPeriod = Number(params.vetoPeriod ?? 0)
  const vetoThreshold = params.vetoThreshold ?? 0n
  const vetoThresholdPercent = Number(formatEther(vetoThreshold)) * 100

  return (
    <div className="rounded-2xl border bg-muted/70 p-2 space-y-3">
      <div className="flex items-center gap-2 ml-2 mt-2">
        <Wand2 size={16} className="text-primary" />
        <div className="text-sm font-medium">
          <Trans>Update Optimistic Parameters</Trans>
        </div>
      </div>
      <div className="space-y-2">
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              <Trans>Veto delay</Trans>
            </span>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-primary" />
              <span className="text-sm text-primary">
                {vetoDelay ? (
                  <Plural
                    value={vetoDelay / 3600}
                    one="# hour"
                    other="# hours"
                  />
                ) : (
                  <Trans>0 seconds</Trans>
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              <Trans>Veto period</Trans>
            </span>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-primary" />
              <span className="text-sm text-primary">
                {vetoPeriod ? (
                  <Plural
                    value={vetoPeriod / 3600}
                    one="# hour"
                    other="# hours"
                  />
                ) : (
                  <Trans>0 seconds</Trans>
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              <Trans>Veto threshold</Trans>
            </span>
            <div className="flex items-center gap-2">
              <FileLock2 size={14} className="text-primary" />
              <span className="text-sm text-primary">
                {vetoThresholdPercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const SelectorRegistryPreview = ({
  decodedCalldata,
}: {
  decodedCalldata: DecodedCalldata
  targetAddress?: Address
}) => {
  const { t } = useLingui()
  const chainId = useAtomValue(chainIdAtom)
  const selectorData = decodedCalldata.data[0] as Array<{
    target: Address
    selectors: Hex[]
  }>
  const isRegister = decodedCalldata.signature === 'registerSelectors'

  return (
    <div className="rounded-2xl border bg-muted/70 p-2 space-y-3">
      <div className="flex items-center gap-2 ml-2 mt-2">
        {isRegister ? (
          <PlusCircle size={16} className="text-success" />
        ) : (
          <MinusCircle size={16} className="text-destructive" />
        )}
        <div className="text-sm font-medium">
          {isRegister ? (
            <Trans>Register Optimistic Actions</Trans>
          ) : (
            <Trans>Unregister Optimistic Actions</Trans>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {selectorData.map((data) => (
          <div
            key={`${data.target}-${data.selectors.join('-')}`}
            className="p-3 rounded-xl bg-background/80 border"
          >
            <div className="flex items-center gap-2 mb-3 text-sm">
              <span className="text-legend">
                <Trans>Target:</Trans>
              </span>
              <Link
                to={getExplorerLink(
                  data.target,
                  chainId,
                  ExplorerDataType.ADDRESS
                )}
                target="_blank"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <EnsName address={data.target} />
                <span className="text-xs text-muted-foreground">
                  {shortenAddress(data.target)}
                </span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.selectors.map((selector) => (
                <span
                  key={selector}
                  className="rounded-full bg-primary/10 text-primary px-2 py-1 text-xs"
                >
                  {formatSelectorLabel(selector, t)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

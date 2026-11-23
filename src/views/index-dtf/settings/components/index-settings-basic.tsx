import { Button } from '@/components/ui/button'
import EnsName from '@/components/utils/ens-name'
import {
  folioVersionAtom,
  indexDTFAtom,
  indexDTFRebalanceControlAtom,
  indexDTFVersionAtom,
} from '@/state/dtf/atoms'
import { humanizeMinutes, shortenAddress } from '@/utils'
import { useLingui } from '@lingui/react/macro'
import {
  useIndexDtfIdentity,
  useIndexDtfMaxAuctionLength,
  useIndexDtfTradeAllowlist,
} from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import {
  Braces,
  DollarSign,
  Hash,
  Hourglass,
  ListChecks,
  Signature,
  ToggleRight,
} from 'lucide-react'
import { useState } from 'react'
import { IconWrapper, InfoCard, InfoCardItem } from './settings-info-card'

const MANDATE_TRUNCATE_LENGTH = 500

const FolioV6Info = () => {
  const { t } = useLingui()
  const identity = useIndexDtfIdentity()
  const params = identity.address ? identity : undefined
  const { data: maxAuctionLength } = useIndexDtfMaxAuctionLength(params)
  const { data: allowlist } = useIndexDtfTradeAllowlist(params)

  return (
    <>
      <InfoCardItem
        label={t`Max Auction Length`}
        icon={<IconWrapper Component={Hourglass} />}
        testId="settings-max-auction-length"
        value={
          maxAuctionLength !== undefined
            ? humanizeMinutes(Number(maxAuctionLength) / 60)
            : undefined
        }
      />
      <InfoCardItem
        label={t`Trade Allowlist`}
        icon={<IconWrapper Component={ListChecks} />}
        testId="settings-trade-allowlist"
        value={
          allowlist
            ? allowlist.enabled
              ? t`Enforced (${allowlist.tokens.length} tokens)`
              : t`Not enforced`
            : undefined
        }
      />
    </>
  )
}

const BasicInfo = () => {
  const { t } = useLingui()
  const indexDTF = useAtomValue(indexDTFAtom)
  const version = useAtomValue(indexDTFVersionAtom)
  const versionState = useAtomValue(folioVersionAtom)
  const rebalanceControl = useAtomValue(indexDTFRebalanceControlAtom)
  const isV5 = versionState.status === 'ready' && versionState.major >= 5
  const isV6 = versionState.status === 'ready' && versionState.major === 6
  const [mandateExpanded, setMandateExpanded] = useState(false)

  const mandate = indexDTF?.mandate
  const shouldTruncate =
    !!mandate && mandate.length > MANDATE_TRUNCATE_LENGTH
  const displayedMandate =
    mandate && shouldTruncate && !mandateExpanded
      ? mandate.slice(0, MANDATE_TRUNCATE_LENGTH) + '...'
      : mandate

  // Hide the mandate row when the DTF is loaded but has no mandate;
  // keep it (as a skeleton) while still loading.
  const showMandate = !indexDTF || !!mandate

  return (
    <InfoCard title={t`Basics`} id="basics">
      <InfoCardItem
        label={t`Name`}
        icon={<IconWrapper Component={Braces} />}
        value={indexDTF?.token.name}
        border={false}
      />
      <InfoCardItem
        label={t`Ticker`}
        icon={<IconWrapper Component={DollarSign} />}
        value={indexDTF?.token.symbol}
      />
      <InfoCardItem
        label={t`Address`}
        icon={<IconWrapper Component={Hash} />}
        address={indexDTF?.id}
        value={indexDTF?.id ? shortenAddress(indexDTF.id) : undefined}
      />
      {showMandate && (
        <InfoCardItem
          label={t`Mandate`}
          icon={<IconWrapper Component={Signature} />}
          bold={false}
          value={
            displayedMandate ? (
              <>
                {displayedMandate}
                {shouldTruncate && (
                  <Button
                    variant="link"
                    size="inline"
                    className="ml-1 text-primary hover:underline"
                    aria-expanded={mandateExpanded}
                    onClick={() => setMandateExpanded((prev) => !prev)}
                  >
                    {mandateExpanded ? t`Show less` : t`Show more`}
                  </Button>
                )}
              </>
            ) : undefined
          }
        />
      )}
      <InfoCardItem
        label={t`Deployer`}
        icon={<IconWrapper Component={Hash} />}
        address={indexDTF?.deployer}
        value={
          indexDTF?.deployer ? (
            <EnsName address={indexDTF.deployer} />
          ) : undefined
        }
      />
      <InfoCardItem
        label={t`Version`}
        icon={<IconWrapper Component={Hash} />}
        value={version || '1.0.0'}
      />
      {rebalanceControl && (
        <InfoCardItem
          label={t`Weight Control`}
          icon={<IconWrapper Component={ToggleRight} />}
          testId="settings-weight-control"
          value={rebalanceControl.weightControl ? t`Enabled` : t`Disabled`}
        />
      )}
      {isV5 && (
        <InfoCardItem
          label={t`Permissionless Bids`}
          icon={<IconWrapper Component={ToggleRight} />}
          testId="settings-permissionless-bids"
          value={indexDTF?.rebalance.bidsEnabled ? t`Enabled` : t`Disabled`}
        />
      )}
      {isV6 && <FolioV6Info />}
    </InfoCard>
  )
}

export default BasicInfo

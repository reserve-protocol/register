import { Trans, useLingui } from '@lingui/react/macro'

import { CopyableValue } from '@/components/design-system-v1/copyable-value'
import { ChainLogoStack } from '@/components/entity-identity/chain-logo-stack'
import { EntityIdentity } from '@/components/entity-identity/entity-identity'
import { LifecycleStatusPill } from '@/components/lifecycle-status'
import { Metric } from '@/components/metric'
import { ChainId } from '@/utils/chains'
import {
  DOCUMENTATION_DTF_FIXTURES,
  DocumentationDtfMark,
} from './documentation-navigation-fixtures'
import DocumentationSpecimenCanvas from './documentation-specimen-canvas'
import {
  DocumentationSpecimenCell,
  DocumentationSpecimenGrid,
} from './documentation-specimen-layout'

export const DataComponentSpecimen = ({ itemId }: { itemId: string }) => {
  const { t } = useLingui()

  if (itemId === 'badge') {
    return (
      <div className="flex flex-wrap gap-2">
        <LifecycleStatusPill role="waiting">
          <Trans>Waiting</Trans>
        </LifecycleStatusPill>
        <LifecycleStatusPill role="active">
          <Trans>Active</Trans>
        </LifecycleStatusPill>
        <LifecycleStatusPill role="actionable">
          <Trans>Action required</Trans>
        </LifecycleStatusPill>
        <LifecycleStatusPill role="processing">
          <Trans>Processing</Trans>
        </LifecycleStatusPill>
        <LifecycleStatusPill role="success">
          <Trans>Executed</Trans>
        </LifecycleStatusPill>
        <LifecycleStatusPill role="unsuccessful">
          <Trans>Failed</Trans>
        </LifecycleStatusPill>
        <LifecycleStatusPill role="closed">
          <Trans>Closed</Trans>
        </LifecycleStatusPill>
      </div>
    )
  }

  if (itemId === 'entity-identity') {
    return (
      <DocumentationSpecimenGrid className="xl:grid-cols-2">
        <DocumentationSpecimenCell label={<Trans>Direct identity</Trans>}>
          <EntityIdentity
            mark={
              <img
                src="/imgs/cmc20.png"
                className="size-6 rounded-full"
                alt="CMC20"
              />
            }
            name={CMC20_FIXTURE.name}
            supporting="$CMC20"
          />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Token and chain</Trans>}>
          <EntityIdentity
            mark={<DocumentationDtfMark product={CMC20_FIXTURE} size="xl" />}
            name={CMC20_FIXTURE.name}
            supporting="$CMC20 · BNB Chain"
          />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Stacks and fallback</Trans>}>
          <div className="space-y-4">
            <EntityIdentity
              density="compact"
              mark={
                <ChainLogoStack
                  chains={[ChainId.Mainnet, ChainId.Base, ChainId.BSC]}
                />
              }
              name="Available networks"
              supporting="Ethereum, Base, BNB Chain"
            />
            <EntityIdentity
              density="compact"
              mark={
                <img
                  src="/svgs/defaultLogo.svg"
                  className="size-6 rounded-full"
                  alt="Unlisted collateral"
                />
              }
              name="Unlisted collateral"
              supporting="$UNLISTED"
            />
          </div>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Constrained name</Trans>}>
          <div className="w-56 max-w-full">
            <EntityIdentity
              className="max-w-full"
              mark={<DocumentationDtfMark product={CMC20_FIXTURE} size="xl" />}
              name="CoinMarketCap 20 Diversified Digital Asset Index DTF"
              supporting="$CMC20 · BNB Chain"
            />
          </div>
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  if (itemId === 'metric') {
    return (
      <DocumentationSpecimenCanvas
        mode="fluid"
        backdrop="neutral"
        padding="contained"
        align="start"
        host={{
          name: t`Neutral data display`,
          backdropOwner: t`Documentation contrast canvas`,
          insetOwner: t`Documentation specimen region`,
        }}
        provenance={
          <Trans>
            Metric owns these inline and centered-headline roles. Its parent
            owns semantic tone, help, framing, and grid composition.
          </Trans>
        }
      >
        <DocumentationSpecimenGrid className="xl:grid-cols-2">
          <DocumentationSpecimenCell
            label={<Trans>Inline · long-value pressure</Trans>}
          >
            <div className="w-full max-w-sm">
              <Metric
                label={<Trans>Total collateral value</Trans>}
                value="$1,284,592,903.47"
              />
            </div>
          </DocumentationSpecimenCell>
          <DocumentationSpecimenCell label={<Trans>Headline · centered</Trans>}>
            <Metric
              role="headline"
              label={<Trans>Total value</Trans>}
              value="$14.82"
            />
          </DocumentationSpecimenCell>
        </DocumentationSpecimenGrid>
      </DocumentationSpecimenCanvas>
    )
  }

  if (itemId === 'copy-value') {
    return (
      <DocumentationSpecimenGrid className="xl:grid-cols-3">
        <DocumentationSpecimenCell label={<Trans>Separate copy action</Trans>}>
          <CopyableValue value="0x8ba1f109551bD432803012645Ac136ddd64DBA72" />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Inline · Primary</Trans>}>
          <CopyableValue
            treatment="inline"
            value="0x8ba1f109551bD432803012645Ac136ddd64DBA72"
          />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Inline · Neutral</Trans>}>
          <CopyableValue
            treatment="inline"
            tone="neutral"
            value="0x8ba1f109551bD432803012645Ac136ddd64DBA72"
          />
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  return null
}

const CMC20_FIXTURE = DOCUMENTATION_DTF_FIXTURES[0]

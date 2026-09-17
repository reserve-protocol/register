import { Trans, useLingui } from '@lingui/react/macro'

import { CopyableValue } from '@/components/design-system-v1/copyable-value'
import { EntityIdentity } from '@/components/entity-identity/entity-identity'
import { LifecycleStatusPill } from '@/components/lifecycle-status'
import { Metric } from '@/components/metric'
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
        <DocumentationSpecimenCell
          label={<Trans>Default with supporting text</Trans>}
        >
          <EntityIdentity
            mark={
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
              >
                R
              </span>
            }
            name="Reserve Index DTF"
            supporting="$RSD · Ethereum"
          />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Compact</Trans>}>
          <EntityIdentity
            density="compact"
            mark={
              <span
                aria-hidden="true"
                className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
              >
                R
              </span>
            }
            name="Reserve Index DTF"
          />
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  if (itemId === 'metric') {
    return (
      <DocumentationSpecimenCanvas
        host={{
          name: t`Neutral data display`,
          backgroundOwner: t`Documentation neutral surface`,
          insetOwner: t`Documentation specimen region`,
        }}
        provenance={
          <Trans>
            Accepted Metric owner rendered directly in a provider-free
            documentation specimen.
          </Trans>
        }
      >
        <DocumentationSpecimenGrid className="xl:grid-cols-2">
          <DocumentationSpecimenCell label={<Trans>Inline pair</Trans>}>
            <div className="w-full max-w-sm space-y-2">
              <Metric label={<Trans>Market cap</Trans>} value="$48.3M" />
            </div>
          </DocumentationSpecimenCell>
          <DocumentationSpecimenCell label={<Trans>Headline</Trans>}>
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
      <DocumentationSpecimenGrid className="xl:grid-cols-2">
        <DocumentationSpecimenCell label={<Trans>Default</Trans>}>
          <CopyableValue value="0x8ba1f109551bD432803012645Ac136ddd64DBA72" />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Inline</Trans>}>
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

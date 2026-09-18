import { Trans, useLingui } from '@lingui/react/macro'
import { ArrowRight, ChevronDown, Settings2, Trash2, X } from 'lucide-react'

import { Button } from '@/components/button'
import { ActionGroup } from '@/components/design-system-v1/action-group'
import { IconButton } from '@/components/icon-button'
import {
  DocumentationSpecimenCell,
  DocumentationSpecimenGrid,
  DocumentationSpecimenMatrix,
} from './documentation-specimen-layout'

export const ActionComponentSpecimen = ({ itemId }: { itemId: string }) => {
  const { t } = useLingui()

  if (itemId === 'button') {
    const sizes = ['micro', 'compact', 'default'] as const
    const buttonFor = (
      tone: 'primary' | 'secondary' | 'quiet' | 'destructive',
      size: (typeof sizes)[number]
    ) => (
      <Button key={`${tone}-${size}`} size={size} tone={tone}>
        <Trans>Button</Trans>
      </Button>
    )

    return (
      <div className="space-y-6">
        <DocumentationSpecimenMatrix
          axisLabel={<Trans>Variant</Trans>}
          columns={[
            <Trans key="micro">Micro</Trans>,
            <Trans key="compact">Compact</Trans>,
            <Trans key="default">Default</Trans>,
          ]}
          rows={[
            {
              label: <Trans>Primary</Trans>,
              cells: sizes.map((size) => buttonFor('primary', size)),
            },
            {
              label: <Trans>Secondary</Trans>,
              cells: sizes.map((size) => buttonFor('secondary', size)),
            },
            {
              label: <Trans>Quiet</Trans>,
              cells: sizes.map((size) => buttonFor('quiet', size)),
            },
            {
              label: <Trans>Destructive</Trans>,
              cells: sizes.map((size) => buttonFor('destructive', size)),
            },
          ]}
        />
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">
            <Trans>Important states</Trans>
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button trailingIcon={<ArrowRight />}>
              <Trans>Available</Trans>
            </Button>
            <Button tone="secondary" disabled>
              <Trans>Unavailable</Trans>
            </Button>
            <Button loading>
              <Trans>Saving</Trans>
            </Button>
          </div>
        </div>
        <DocumentationSpecimenGrid className="xl:grid-cols-2">
          <DocumentationSpecimenCell
            label={<Trans>Micro and Compact keep their natural width</Trans>}
          >
            <p className="max-w-md text-sm leading-5 text-foreground">
              <Trans>
                Keep standalone and grouped Micro and Compact actions at their
                natural content width.
              </Trans>
            </p>
          </DocumentationSpecimenCell>
          <DocumentationSpecimenCell
            label={<Trans>Default can fill a layout-owned track</Trans>}
          >
            <p className="max-w-md text-sm leading-5 text-foreground">
              <Trans>
                Let the surrounding layout make Default actions equal-width when
                a narrow task stacks them vertically.
              </Trans>
            </p>
          </DocumentationSpecimenCell>
        </DocumentationSpecimenGrid>
      </div>
    )
  }

  if (itemId === 'icon-button') {
    const icon = <Settings2 aria-hidden="true" />
    return (
      <DocumentationSpecimenGrid className="sm:grid-cols-2 xl:grid-cols-3">
        <DocumentationSpecimenCell label={<Trans>Primary</Trans>}>
          <IconButton
            size="compact"
            tone="primary"
            label={t`Open settings`}
            icon={icon}
          />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Secondary</Trans>}>
          <IconButton size="compact" label={t`Close`} icon={<X />} />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Quiet</Trans>}>
          <IconButton
            size="compact"
            tone="quiet"
            label={t`Show details`}
            icon={<ChevronDown />}
          />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Destructive</Trans>}>
          <IconButton
            size="compact"
            tone="destructive"
            label={t`Delete`}
            icon={<Trash2 />}
          />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Unavailable</Trans>}>
          <IconButton
            disabled
            size="compact"
            label={t`Settings unavailable`}
            icon={icon}
          />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Loading</Trans>}>
          <IconButton
            loading
            size="compact"
            label={t`Saving settings`}
            icon={icon}
          />
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  if (itemId === 'button-group') {
    return (
      <DocumentationSpecimenGrid className="xl:grid-cols-3">
        <DocumentationSpecimenCell label={<Trans>Related actions</Trans>}>
          <ActionGroup>
            <Button tone="secondary" size="compact">
              <Trans>Cancel</Trans>
            </Button>
            <Button size="compact">
              <Trans>Apply</Trans>
            </Button>
          </ActionGroup>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell
          label={<Trans>Destructive confirmation</Trans>}
        >
          <ActionGroup>
            <Button tone="secondary">
              <Trans>Cancel</Trans>
            </Button>
            <Button tone="destructive">
              <Trans>Delete</Trans>
            </Button>
          </ActionGroup>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Narrow task</Trans>}>
          <ActionGroup direction="vertical" className="max-w-xs">
            <Button size="default">
              <Trans>Continue</Trans>
            </Button>
            <Button size="default" tone="secondary">
              <Trans>Back</Trans>
            </Button>
          </ActionGroup>
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  return null
}

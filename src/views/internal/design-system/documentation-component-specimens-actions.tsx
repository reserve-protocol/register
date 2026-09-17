import { Trans, useLingui } from '@lingui/react/macro'
import { ArrowRight, Settings2 } from 'lucide-react'

import { Button } from '@/components/button'
import { ActionGroup } from '@/components/design-system-v1/action-group'
import { IconButton } from '@/components/icon-button'
import {
  DocumentationSpecimenCell,
  DocumentationSpecimenGrid,
} from './documentation-specimen-layout'

export const ActionComponentSpecimen = ({ itemId }: { itemId: string }) => {
  const { t } = useLingui()

  if (itemId === 'button') {
    return (
      <DocumentationSpecimenGrid>
        <DocumentationSpecimenCell label={<Trans>Hierarchy</Trans>}>
          <div className="flex flex-wrap items-center gap-2">
            <Button trailingIcon={<ArrowRight />}>
              <Trans>Continue</Trans>
            </Button>
            <Button tone="secondary">
              <Trans>Secondary</Trans>
            </Button>
            <Button tone="quiet">
              <Trans>Quiet</Trans>
            </Button>
            <Button tone="destructive">
              <Trans>Delete</Trans>
            </Button>
          </div>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Sizes</Trans>}>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="micro">
              <Trans>Micro</Trans>
            </Button>
            <Button size="compact">
              <Trans>Compact</Trans>
            </Button>
          </div>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell
          label={<Trans>Unavailable and loading</Trans>}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Button tone="secondary" disabled>
              <Trans>Unavailable</Trans>
            </Button>
            <Button loading>
              <Trans>Saving</Trans>
            </Button>
          </div>
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  if (itemId === 'icon-button') {
    return (
      <DocumentationSpecimenGrid>
        <DocumentationSpecimenCell label={<Trans>Micro</Trans>}>
          <IconButton
            size="micro"
            label={t`Open settings`}
            icon={<Settings2 aria-hidden="true" />}
          />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Compact</Trans>}>
          <IconButton
            size="compact"
            label={t`Open settings`}
            icon={<Settings2 aria-hidden="true" />}
          />
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell
          label={<Trans>Default and unavailable</Trans>}
        >
          <div className="flex gap-2">
            <IconButton
              size="default"
              label={t`Open settings`}
              icon={<Settings2 aria-hidden="true" />}
            />
            <IconButton
              disabled
              label={t`Settings unavailable`}
              icon={<Settings2 aria-hidden="true" />}
            />
          </div>
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  if (itemId === 'button-group') {
    return (
      <DocumentationSpecimenGrid className="xl:grid-cols-2">
        <DocumentationSpecimenCell label={<Trans>Horizontal</Trans>}>
          <ActionGroup>
            <Button tone="secondary" size="compact">
              <Trans>Cancel</Trans>
            </Button>
            <Button size="compact">
              <Trans>Apply</Trans>
            </Button>
          </ActionGroup>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Constrained width</Trans>}>
          <ActionGroup direction="vertical" className="max-w-52">
            <Button>
              <Trans>Continue</Trans>
            </Button>
            <Button tone="secondary">
              <Trans>Back</Trans>
            </Button>
          </ActionGroup>
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  return null
}

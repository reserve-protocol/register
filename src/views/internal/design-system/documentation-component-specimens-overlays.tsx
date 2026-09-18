import { Trans, useLingui } from '@lingui/react/macro'
import {
  CircleHelp,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'

import { DialogSurface } from '@/components/dialog'
import { IconButton } from '@/components/icon-button'
import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
import { MultiSelectFilter } from '@/components/design-system-v1/multi-select-filter'
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuLinkItem,
  MenuSeparator,
  MenuTrigger,
} from '@/components/design-system-v1/menu'
import { tooltipSurfaceRecipe } from '@/components/design-system-v1/tooltip-surface'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DocumentationStatus } from './documentation-status'
import { EligibilityDialogCandidate } from './eligibility-dialog-candidate'
import {
  DocumentationSpecimenCell,
  DocumentationSpecimenGrid,
} from './documentation-specimen-layout'

export const OverlayComponentSpecimen = ({ itemId }: { itemId: string }) => {
  const { t } = useLingui()
  const [popoverNetworks, setPopoverNetworks] = useState(['ethereum'])

  if (itemId === 'dialog') {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium">
            <Trans>Eligibility dialog</Trans>
          </p>
          <div className="mt-1">
            <DocumentationStatus status="exploring">
              <Trans>Exploring</Trans>
            </DocumentationStatus>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            <Trans>
              This Eligibility composition is still in progress. It does not
              establish a generic Dialog shell or anatomy.
            </Trans>
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            <Trans>Collapsed jurisdictions</Trans>
          </p>
          <div className="flex justify-center overflow-x-auto bg-muted/20 p-5 sm:p-8">
            <DialogSurface width="standard">
              <EligibilityDialogCandidate idPrefix="overview-eligibility-collapsed" />
            </DialogSurface>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            <Trans>Expanded jurisdictions</Trans>
          </p>
          <div className="flex justify-center overflow-x-auto bg-muted/20 p-5 sm:p-8">
            <DialogSurface width="standard">
              <EligibilityDialogCandidate
                idPrefix="overview-eligibility-expanded"
                jurisdictionsDefaultOpen
              />
            </DialogSurface>
          </div>
        </div>
      </div>
    )
  }

  if (itemId === 'popover') {
    return (
      <MultiSelectFilter
        accessibleLabel={t`Filter networks`}
        selected={popoverNetworks}
        onApply={setPopoverNetworks}
        triggerContent={
          popoverNetworks.length === 1
            ? t`1 network`
            : t`${popoverNetworks.length} networks`
        }
        options={[
          { value: 'ethereum', label: 'Ethereum' },
          { value: 'base', label: 'Base' },
          { value: 'bsc', label: 'BNB Chain' },
        ]}
      />
    )
  }

  if (itemId === 'dropdown-menu') {
    return (
      <DocumentationSpecimenGrid className="xl:grid-cols-2">
        <DocumentationSpecimenCell
          label={<Trans>Open · complete anatomy</Trans>}
        >
          <div className="min-h-64">
            <Menu open modal={false}>
              <MenuTrigger asChild>
                <IconButton
                  label={t`Open contract actions`}
                  icon={<MoreHorizontal aria-hidden="true" />}
                />
              </MenuTrigger>
              <MenuContent align="start">
                <MenuItem leadingIcon={<Copy aria-hidden="true" />}>
                  <Trans>Copy address</Trans>
                </MenuItem>
                <MenuLinkItem
                  href="https://etherscan.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  leadingIcon={<ExternalLink aria-hidden="true" />}
                >
                  <Trans>View on explorer</Trans>
                </MenuLinkItem>
                <MenuItem disabled>
                  <Trans>Unavailable action</Trans>
                </MenuItem>
                <MenuSeparator />
                <MenuItem
                  tone="destructive"
                  leadingIcon={<Trash2 aria-hidden="true" />}
                >
                  <Trans>Remove resource</Trans>
                </MenuItem>
              </MenuContent>
            </Menu>
          </div>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Unavailable trigger</Trans>}>
          <IconButton
            label={t`Contract actions unavailable`}
            icon={<MoreHorizontal aria-hidden="true" />}
            disabled
          />
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  if (itemId === 'tooltip') {
    return (
      <DocumentationSpecimenGrid className="xl:grid-cols-2">
        <DocumentationSpecimenCell label={<Trans>Short explanation</Trans>}>
          <div className="flex items-center gap-1 text-sm">
            <Trans>Annualized TVL fee</Trans>
            <HelpTooltip
              accessibleLabel={t`About annualized TVL fee`}
              content={t`The yearly fee charged against total value locked.`}
            />
          </div>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Visible explanation</Trans>}>
          <div className="flex min-h-32 items-start gap-1 text-sm">
            <Trans>Governance quorum</Trans>
            <DocumentationOpenHelpTooltip
              accessibleLabel={t`About governance quorum`}
              content={t`The minimum share of eligible voting power that must participate before a proposal can pass.`}
            />
          </div>
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  return null
}

const DocumentationOpenHelpTooltip = ({
  accessibleLabel,
  content,
}: {
  accessibleLabel: string
  content: string
}) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip open>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={accessibleLabel}
          className="relative inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-120 after:absolute after:-inset-3 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <CircleHelp aria-hidden="true" className="size-4" strokeWidth={1.5} />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        sideOffset={8}
        collisionPadding={8}
        className={tooltipSurfaceRecipe}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

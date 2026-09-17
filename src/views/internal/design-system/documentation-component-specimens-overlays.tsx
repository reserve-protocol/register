import { Trans, useLingui } from '@lingui/react/macro'
import { MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/button'
import {
  DialogBody,
  DialogDescription,
  DialogHeader,
  DialogSurface,
  DialogTitle,
} from '@/components/dialog'
import { IconButton } from '@/components/icon-button'
import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
} from '@/components/design-system-v1/menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/design-system-v1/popover'

export const OverlayComponentSpecimen = ({ itemId }: { itemId: string }) => {
  const { t } = useLingui()

  if (itemId === 'dialog') {
    return (
      <DialogSurface width="compact" className="max-w-sm border border-border">
        <DialogHeader>
          <DialogTitle>
            <Trans>Review proposal</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>Confirm the proposal details before continuing.</Trans>
          </DialogDescription>
        </DialogHeader>
        <DialogBody />
      </DialogSurface>
    )
  }

  if (itemId === 'popover') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button tone="secondary" size="compact">
            <Trans>Open filters</Trans>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-4">
          <p className="text-sm">
            <Trans>Filter controls belong to the composition.</Trans>
          </p>
        </PopoverContent>
      </Popover>
    )
  }

  if (itemId === 'dropdown-menu') {
    return (
      <Menu>
        <MenuTrigger asChild>
          <IconButton
            label={t`Open actions`}
            icon={<MoreHorizontal aria-hidden="true" />}
          />
        </MenuTrigger>
        <MenuContent align="start">
          <MenuItem>
            <Trans>View details</Trans>
          </MenuItem>
          <MenuItem>
            <Trans>Share</Trans>
          </MenuItem>
        </MenuContent>
      </Menu>
    )
  }

  if (itemId === 'tooltip') {
    return (
      <div className="flex items-center gap-1 text-sm">
        <Trans>Annualized TVL fee</Trans>
        <HelpTooltip
          accessibleLabel={t`About annualized TVL fee`}
          content={t`The yearly fee charged against total value locked.`}
        />
      </div>
    )
  }

  return null
}

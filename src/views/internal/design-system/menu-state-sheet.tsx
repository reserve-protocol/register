import { Button } from '@/components/button'
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuLinkItem,
  MenuSeparator,
  MenuTrigger,
} from '@/components/design-system-v1/menu'
import {
  PopupChevron,
  popupTriggerPadding,
} from '@/components/design-system-v1/popup-chevron'
import { IconButton } from '@/components/icon-button'
import {
  ArrowUpRight,
  Copy,
  Ellipsis,
  ExternalLink,
  Trash2,
} from 'lucide-react'

const MenuStateSheet = () => (
  <section
    data-testid="menu-state-sheet"
    className="space-y-4"
    aria-labelledby="menu-state-sheet-title"
  >
    <div>
      <p className="text-sm font-medium text-primary">Candidate for review</p>
      <h2 id="menu-state-sheet-title" className="mt-1 text-2xl font-light">
        Action Menu
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
        The candidate retains Radix action-menu behavior and reuses the accepted
        floating-surface and option rhythm where that language transfers from
        Select: 8px popup offset and radius, 4px item radius, 16px icons, and
        the shared subtle interaction surface. Rows currently render the shared
        provisional balanced-inset candidate: 8px around the popup list and 12px
        inside each item pair with the provisional 14px/16px single-line role to
        produce a 40px row. Menu owns immediate actions and links—not chart
        range, language, theme, or other committed values. Grouped header
        panels, selection items, submenus, and production adoption remain
        separate. The destructive role is intentional; its exact cross-theme
        foreground value still depends on the provisional feedback palette.
      </p>
    </div>

    <div className="grid gap-0.5 bg-secondary p-0.5 lg:grid-cols-3">
      <Specimen label="Interactive · contract actions" className="min-h-72">
        <Menu>
          <MenuTrigger asChild>
            <IconButton
              label="Contract actions"
              icon={<Ellipsis aria-hidden="true" />}
            />
          </MenuTrigger>
          <MenuContent align="start">
            <MenuItem leadingIcon={<Copy aria-hidden="true" />}>
              Copy address
            </MenuItem>
            <MenuLinkItem
              href="https://etherscan.io"
              target="_blank"
              rel="noopener noreferrer"
              leadingIcon={<ExternalLink aria-hidden="true" />}
            >
              View on explorer
            </MenuLinkItem>
            <MenuSeparator />
            <MenuItem
              tone="destructive"
              leadingIcon={<Trash2 aria-hidden="true" />}
            >
              Remove resource
            </MenuItem>
          </MenuContent>
        </Menu>
      </Specimen>

      <Specimen label="Labeled trigger · external links">
        <Menu>
          <MenuTrigger asChild>
            <Button
              size="compact"
              tone="secondary"
              className={popupTriggerPadding.compactText}
              trailingIcon={<PopupChevron />}
            >
              Links
            </Button>
          </MenuTrigger>
          <MenuContent align="start">
            <MenuLinkItem
              href="https://reserve.org"
              target="_blank"
              rel="noopener noreferrer"
              trailingVisual={<ArrowUpRight aria-hidden="true" />}
            >
              Website
            </MenuLinkItem>
            <MenuLinkItem
              href="https://x.com/reserveprotocol"
              target="_blank"
              rel="noopener noreferrer"
              trailingVisual={<ArrowUpRight aria-hidden="true" />}
            >
              X Account
            </MenuLinkItem>
          </MenuContent>
        </Menu>
      </Specimen>

      <Specimen label="Disabled · trigger unavailable">
        <Menu>
          <MenuTrigger asChild disabled>
            <IconButton
              label="Contract actions unavailable"
              icon={<Ellipsis aria-hidden="true" />}
              disabled
            />
          </MenuTrigger>
          <MenuContent>
            <MenuItem>Copy address</MenuItem>
          </MenuContent>
        </Menu>
      </Specimen>
    </div>
  </section>
)

const Specimen = ({
  children,
  className,
  label,
}: {
  children: React.ReactNode
  className?: string
  label: string
}) => (
  <div className={`min-w-0 bg-card ${className ?? ''}`}>
    <p className="border-b border-border px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <div className="flex min-h-36 items-start p-6">{children}</div>
  </div>
)

export default MenuStateSheet

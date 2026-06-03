import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import useIsComplianceRestricted from '@/hooks/use-is-compliance-restricted'
import { indexDTFStatusAtom } from '@/state/dtf/atoms'
import { Trans } from '@lingui/macro'
import { useZapperModal } from '@reserve-protocol/react-zapper'
import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

const RestrictionPopover = ({
  enabled,
  children,
}: {
  enabled: boolean
  children: ReactNode
}) => {
  if (!enabled) return <>{children}</>

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[260px] text-sm text-center">
        <Trans>
          This product isn't available in your region due to local restrictions.{' '}
          <a
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
            href="https://reserve.org/terms-and-conditions"
          >
            Learn More
          </a>
        </Trans>
      </PopoverContent>
    </Popover>
  )
}

const DISABLED_BUTTON_CLASSES =
  'aria-disabled:!bg-muted aria-disabled:!text-muted-foreground aria-disabled:!border-transparent aria-disabled:cursor-not-allowed disabled:!bg-muted disabled:!text-muted-foreground disabled:!border-transparent'

const IndexCTAsOverviewMobile = () => {
  const { open, setTab } = useZapperModal()
  const isDeprecated = isInactiveDTF(useAtomValue(indexDTFStatusAtom))
  const isRestricted = useIsComplianceRestricted()

  return (
    <div className="block xl:hidden w-full mt-0 xl:mt-3">
      <div className="flex gap-2">
        <RestrictionPopover enabled={isRestricted}>
          <Button
            className={`rounded-3xl h-8 w-full ${DISABLED_BUTTON_CLASSES}`}
            variant="outline"
            aria-disabled={isRestricted || undefined}
            onClick={() => {
              if (isRestricted) return
              setTab('sell')
              open()
            }}
          >
            SELL
          </Button>
        </RestrictionPopover>
        <RestrictionPopover enabled={isRestricted}>
          <Button
            className={`rounded-3xl h-8 w-full ${DISABLED_BUTTON_CLASSES}`}
            aria-disabled={isRestricted || undefined}
            disabled={isDeprecated && !isRestricted}
            onClick={() => {
              if (isRestricted || isDeprecated) return
              setTab('buy')
              open()
            }}
          >
            BUY
          </Button>
        </RestrictionPopover>
      </div>
    </div>
  )
}

export default IndexCTAsOverviewMobile

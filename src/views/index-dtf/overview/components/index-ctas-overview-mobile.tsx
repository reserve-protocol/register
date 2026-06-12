import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import useComplianceRestrictions from '@/hooks/use-compliance-restrictions'
import { indexDTFStatusAtom } from '@/state/dtf/atoms'
import { Trans } from '@lingui/react/macro'
import { useZapperModal } from '@reserve-protocol/react-zapper'
import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'
import EligibilityCard from './eligibility-card'

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
  const { isLoading, data: complianceData } = useComplianceRestrictions()
  const isRestricted = isLoading || complianceData?.restricted === true

  if (complianceData?.reason === 'geolocation-restricted') {
    return (
      <div className="block xl:hidden w-full mt-0 xl:mt-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-3xl h-8 w-full">
              <Trans>Verify eligibility</Trans>
            </Button>
          </DialogTrigger>
          <DialogContent className="p-1 bg-secondary border-none shadow-lg max-w-full sm:max-w-[420px] top-[100%] translate-y-[-100%] sm:top-[50%] sm:translate-y-[-50%] rounded-b-none rounded-t-3xl sm:rounded-3xl data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out">
            <DialogTitle className="sr-only">
              <Trans>Verify eligibility</Trans>
            </DialogTitle>
            <DialogDescription className="sr-only">
              <Trans>Request access to this product</Trans>
            </DialogDescription>
            <EligibilityCard className="bg-transparent p-0" />
          </DialogContent>
        </Dialog>
      </div>
    )
  }

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
            <Trans>SELL</Trans>
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
            <Trans>BUY</Trans>
          </Button>
        </RestrictionPopover>
      </div>
    </div>
  )
}

export default IndexCTAsOverviewMobile

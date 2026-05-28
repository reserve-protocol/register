import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import useIsComplianceRestricted from '@/hooks/use-is-compliance-restricted'
import { indexDTFStatusAtom } from '@/state/dtf/atoms'
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
      <PopoverTrigger asChild>
        <span className="w-full">{children}</span>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] text-sm text-center">
        This product isn't available in your region due to local restrictions.{' '}
        <a
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
          href="https://reserve.org/terms-and-conditions"
        >
          Learn More
        </a>
      </PopoverContent>
    </Popover>
  )
}

const IndexCTAsOverviewMobile = () => {
  const { open, setTab } = useZapperModal()
  const isDeprecated = isInactiveDTF(useAtomValue(indexDTFStatusAtom))
  const isRestricted = useIsComplianceRestricted()

  return (
    <div className="block xl:hidden w-full mt-0 xl:mt-3">
      <div className="flex gap-2">
        <RestrictionPopover enabled={isRestricted}>
          <Button
            className="rounded-3xl h-8 w-full disabled:!bg-muted disabled:!text-muted-foreground disabled:!border-transparent"
            variant="outline"
            disabled={isRestricted}
            onClick={() => {
              setTab('sell')
              open()
            }}
          >
            SELL
          </Button>
        </RestrictionPopover>
        <RestrictionPopover enabled={isRestricted}>
          <Button
            className="rounded-3xl h-8 w-full disabled:!bg-muted disabled:!text-muted-foreground disabled:!border-transparent"
            disabled={isDeprecated || isRestricted}
            onClick={() => {
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

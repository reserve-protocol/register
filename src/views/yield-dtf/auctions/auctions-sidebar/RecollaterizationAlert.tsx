import { Trans } from '@lingui/macro'
import { Separator } from '@/components/ui/separator'
import { useAtomValue } from 'jotai'
import { auctionsOverviewAtom } from '../atoms'
import ConfirmAuction from './ConfirmAuction'

const RecollaterizationAlert = () => {
  const data = useAtomValue(auctionsOverviewAtom)

  if (!data?.recollaterization) {
    return null
  }

  return (
    <div className="mt-4 border border-dashed border-warning rounded-xl text-center bg-background p-8">
      <img
        src="/svgs/asterisk.svg"
        height={24}
        width={24}
        className="mb-2 mx-auto"
        alt=""
      />
      <span className="font-semibold">
        <Trans>
          Unknown amount of recollateralization auctions left to run
        </Trans>
      </span>
      <p className="mt-2 text-sm text-legend">
        <Trans>
          Wait to trigger revenue auctions until after recollateralization has
          finished.
        </Trans>
      </p>
      <Separator className="-mx-4 my-4" />
      <ConfirmAuction />
    </div>
  )
}
export default RecollaterizationAlert

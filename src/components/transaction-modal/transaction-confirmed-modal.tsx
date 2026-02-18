import { Trans } from '@lingui/macro'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import TransactionSignedIcon from 'components/icons/SignedTransactionIcon'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from 'state/atoms'
import {
  ETHERSCAN_NAMES,
  ExplorerDataType,
  getExplorerLink,
} from 'utils/getExplorerLink'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'

const TransactionConfirmedModal = ({
  hash,
  onClose,
}: {
  hash: string
  onClose(): void
}) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <div className="flex flex-col items-center justify-center p-4">
          <TransactionSignedIcon />
          <br />
          <span className="text-lg font-bold">
            <Trans>Transaction signed!</Trans>
          </span>
          <br />
          <a
            href={getExplorerLink(hash, chainId, ExplorerDataType.TRANSACTION)}
            target="_blank"
            rel="noreferrer"
            className="text-xs flex items-center text-primary hover:underline"
          >
            <Trans>View on</Trans> {ETHERSCAN_NAMES[chainId]}{' '}
            <ExternalArrowIcon />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TransactionConfirmedModal

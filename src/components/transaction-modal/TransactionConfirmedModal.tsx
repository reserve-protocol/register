import { Trans } from '@lingui/macro'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import TransactionSignedIcon from 'components/icons/SignedTransactionIcon'
import { Modal } from 'components'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from 'state/atoms'
import {
  ETHERSCAN_NAMES,
  ExplorerDataType,
  getExplorerLink,
} from 'utils/getExplorerLink'

const TransactionConfirmedModal = ({
  hash,
  onClose,
}: {
  hash: string
  onClose(): void
}) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <Modal onClose={onClose} style={{ maxWidth: '420px' }}>
      <div className="flex flex-col items-center justify-center p-6">
        <TransactionSignedIcon />
        <br />
        <span className="text-xl font-medium">
          <Trans>Transaction signed!</Trans>
        </span>
        <br />
        <a
          href={getExplorerLink(hash, chainId, ExplorerDataType.TRANSACTION)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-sm text-primary hover:underline"
        >
          <Trans>View on</Trans> {ETHERSCAN_NAMES[chainId]}{' '}
          <ExternalArrowIcon />
        </a>
      </div>
    </Modal>
  )
}

export default TransactionConfirmedModal

import { Trans } from '@lingui/macro'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import TransactionSignedIcon from 'components/icons/SignedTransactionIcon'
import Modal from 'components/modal'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from 'state/atoms'
import { Flex, Link, Text } from 'theme-ui'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

const TransactionConfirmedModal = ({
  hash,
  onClose,
}: {
  hash: string
  onClose(): void
}) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <Modal
      onClose={onClose}
      style={{ maxWidth: '420px' }}
      data-testid="confirmation-modal"
    >
      <Flex
        p={4}
        sx={{
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <TransactionSignedIcon />
        <br />
        <Text variant="title">
          <Trans>Transaction signed!</Trans>
        </Text>
        <br />
        <Link
          href={getExplorerLink(hash, chainId, ExplorerDataType.TRANSACTION)}
          target="_blank"
          sx={{ fontSize: 1, alignItems: 'center', display: 'flex' }}
        >
          <Trans>View on etherscan </Trans> <ExternalArrowIcon />
        </Link>
      </Flex>
    </Modal>
  )
}

export default TransactionConfirmedModal

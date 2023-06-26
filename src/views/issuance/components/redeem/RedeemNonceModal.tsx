import { Modal } from 'components'
import { useAtom } from 'jotai'
import { atomWithLoadable } from 'utils/atoms/utils'
import { customRedeemNonceAtom } from './atoms'

const RedeemNonceModal = () => {
  const [nonce, setNonce] = useAtom(customRedeemNonceAtom)

  return <Modal></Modal>
}

export default RedeemNonceModal

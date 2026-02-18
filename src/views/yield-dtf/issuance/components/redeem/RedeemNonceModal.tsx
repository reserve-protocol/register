import { t } from '@lingui/macro'
import { Modal } from 'components'
import { ModalProps } from 'components'
import TokenItem from 'components/token-item'
import { useAtomValue, useSetAtom } from 'jotai'
import { ChevronLeft } from 'lucide-react'
import { rTokenAssetsAtom, rTokenStateAtom } from 'state/atoms'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { formatCurrency } from 'utils'
import { formatUnits } from 'viem'
import {
  customRedeemModalAtom,
  customRedeemNonceAtom,
  redeemNonceAtom,
  redeemQuotesAtom,
} from './atoms'

interface Props extends Partial<ModalProps> {}

const RedeemNonceModal = ({ onClose, ...props }: Props) => {
  const setNonce = useSetAtom(customRedeemNonceAtom)
  const nonce = useAtomValue(redeemNonceAtom)
  const basketNonce = useAtomValue(rTokenStateAtom).basketNonce
  const setNonceModal = useSetAtom(customRedeemModalAtom)
  const quote = useAtomValue(redeemQuotesAtom)
  const assets = useAtomValue(rTokenAssetsAtom)

  const handleSelection = (nonce: number) => {
    setNonce(nonce)
    setNonceModal(false)
  }

  const handleClose = () => {
    if (onClose) onClose()
    setNonceModal(false)
  }

  return (
    <Modal
      title={t`Choose Redemption Basket`}
      titleProps={{ ml: 5 }}
      className="bg-secondary"
      onClose={handleClose}
      {...props}
    >
      <button
        onClick={() => setNonceModal(false)}
        className="absolute left-4 top-6 cursor-pointer p-2 hover:bg-muted rounded"
      >
        <ChevronLeft />
      </button>
      {!!quote &&
        assets &&
        Object.keys(quote).map((quoteNonce, index) => {
          return (
            <div
              className="rounded-xl border border-secondary bg-card p-4 mt-0 first:mt-0"
              style={{ marginTop: index ? '12px' : '0' }}
              key={quoteNonce}
            >
              <div
                className="flex items-center cursor-pointer"
                onClick={() => handleSelection(Number(quoteNonce))}
              >
                <Checkbox checked={Number(quoteNonce) === nonce} />
                <span className="ml-1">
                  {basketNonce === Number(quoteNonce) ? 'Current' : 'Previous'}{' '}
                  basket
                </span>
              </div>
              <Separator className="mt-4 border-dashed" />
              <div>
                {Object.keys(quote[quoteNonce]).map((erc20) => (
                  <div className="flex items-center mt-4" key={erc20}>
                    <TokenItem symbol={assets[erc20].token.symbol} />
                    <span className="ml-auto">
                      {formatCurrency(
                        +formatUnits(
                          quote[quoteNonce][erc20].amount,
                          assets[erc20].token.decimals
                        )
                      )}
                    </span>
                    {!!quote[quoteNonce][erc20].loss && (
                      <span className="ml-4 block flex-shrink-0 text-xs text-destructive">
                        ({formatCurrency(quote[quoteNonce][erc20].loss)})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
    </Modal>
  )
}

export default RedeemNonceModal

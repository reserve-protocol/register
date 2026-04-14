import { Trans, t } from '@lingui/macro'
import { Modal } from 'components'
import ShowMore from 'components/transaction-modal/ShowMore'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { rateAtom, stRsrTickerAtom } from '@/views/yield-dtf/staking/atoms'
import AmountPreview from '../amount-preview'
import UnstakeDelay from '../unstake-delay'
import ConfirmUnstakeButton from './confirm-unstake-button'
import { unStakeAmountAtom } from './atoms'
import { rsrPriceAtom } from 'state/atoms'

const UnstakePreview = () => {
  const amount = useAtomValue(unStakeAmountAtom)
  const rate = useAtomValue(rateAtom)
  const price = useAtomValue(rsrPriceAtom)
  const ticker = useAtomValue(stRsrTickerAtom)
  const rsrAmount = Number(amount) * rate
  const usdAmount = rsrAmount * price

  return (
    <>
      <AmountPreview
        src="/svgs/strsr.svg"
        title={t`You use:`}
        amount={Number(amount)}
        usdAmount={usdAmount}
        symbol={ticker}
      />
      <AmountPreview
        title={t`You receive:`}
        amount={rsrAmount}
        usdAmount={usdAmount}
        symbol="RSR"
        className="mt-3"
      />
    </>
  )
}

const UnstakeExtra = () => (
  <ShowMore className="mt-4 mb-2">
    <UnstakeDelay />
    <div className="flex items-center mt-2">
      <span>
        <Trans>Staking yield share ends</Trans>:
      </span>
      <span className="ml-auto font-semibold">
        <Trans>Immediate</Trans>
      </span>
    </div>
  </ShowMore>
)

const UnstakeModal = ({ onClose }: { onClose(): void }) => {
  const setAmount = useSetAtom(unStakeAmountAtom)
  const handleClose = useCallback(() => {
    setAmount('')
    onClose()
  }, [setAmount])

  return (
    <Modal title={t`Review stake`} onClose={handleClose} width={440}>
      <UnstakePreview />
      <UnstakeExtra />
      <ConfirmUnstakeButton />
    </Modal>
  )
}

export default UnstakeModal

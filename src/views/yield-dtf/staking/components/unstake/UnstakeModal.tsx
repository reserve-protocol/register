import { Trans, t } from '@lingui/macro'
import { Modal } from 'components'
import ShowMore from 'components/transaction-modal/ShowMore'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { Box, Text } from 'theme-ui'
import { rateAtom, stRsrTickerAtom } from '@/views/yield-dtf/staking/atoms'
import AmountPreview from '../AmountPreview'
import UnstakeDelay from '../UnstakeDelay'
import ConfirmUnstakeButton from './ConfirmUnstakeButton'
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
        mt="3"
      />
    </>
  )
}

const UnstakeExtra = () => (
  <ShowMore mt="3" mb="2">
    <UnstakeDelay />
    <Box variant="layout.verticalAlign" mt={2}>
      <Text>
        <Trans>Staking yield share ends</Trans>:
      </Text>
      <Text ml="auto" variant="bold">
        <Trans>Immediate</Trans>
      </Text>
    </Box>
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

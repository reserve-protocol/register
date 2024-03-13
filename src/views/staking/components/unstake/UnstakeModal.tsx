import { Trans, t } from '@lingui/macro'
import { Button, Modal } from 'components'
import { Box, Text } from 'theme-ui'
import AmountPreview from '../AmountPreview'
import { atom, useAtomValue } from 'jotai'
import {
  isValidUnstakeAmountAtom,
  rateAtom,
  stRsrTickerAtom,
  unStakeAmountAtom,
} from 'views/staking/atoms'
import { rTokenAtom, rTokenConfigurationAtom, rsrPriceAtom } from 'state/atoms'
import StRSR from 'abis/StRSR'
import { parseDuration, safeParseEther } from 'utils'
import CollapsableBox from 'components/boxes/CollapsableBox'
import { ArrowRight } from 'react-feather'

const unstakeDelayAtom = atom((get) => {
  const params = get(rTokenConfigurationAtom)

  return parseDuration(+params?.unstakingDelay || 0, { units: ['d', 'h', 's'] })
})

const unstakeTxAtom = atom((get) => {
  const isValid = get(isValidUnstakeAmountAtom)
  const amount = get(unStakeAmountAtom)
  const rToken = get(rTokenAtom)

  if (!rToken?.stToken || !isValid) {
    return undefined
  }

  return {
    abi: StRSR,
    address: rToken.stToken.address,
    functionName: 'unstake',
    args: [safeParseEther(amount)],
  }
})

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

const UnstakeFlow = () => {
  const delay = useAtomValue(unstakeDelayAtom)

  return (
    <Box
      mt={3}
      variant="layout.verticalAlign"
      sx={{ fontSize: 1, justifyContent: 'space-between' }}
    >
      <Box>
        <Box
          mb="1"
          sx={{ height: '4px', width: '12px', backgroundColor: 'text' }}
        />
        <Text variant="bold" sx={{ display: 'block' }}>
          <Trans>Trigger Unstake</Trans>
        </Text>
        <Text>1 Transaction</Text>
      </Box>
      <ArrowRight size={16} />
      <Box>
        <Box
          mb="1"
          sx={{ height: '4px', width: '100%', backgroundColor: 'warning' }}
        />
        <Text variant="bold" sx={{ display: 'block', color: 'warning' }}>
          {delay} Delay
        </Text>
        <Text>Wait entire period</Text>
      </Box>
      <ArrowRight size={16} />
      <Box>
        <Box
          ml="auto"
          mb="1"
          sx={{ height: '4px', width: '12px', backgroundColor: 'text' }}
        />
        <Text variant="bold" sx={{ display: 'block' }}>
          <Trans>Withdraw RSR</Trans>
        </Text>
        <Text>1 Transaction</Text>
      </Box>
    </Box>
  )
}

const UnstakeDelay = () => {
  const delay = useAtomValue(unstakeDelayAtom)

  return (
    <CollapsableBox
      divider={false}
      mt={3}
      header={
        <Box variant="layout.verticalAlign">
          <Text>
            <Trans>Unstaking delay:</Trans>
          </Text>
          <Text mr="3" ml="auto" variant="strong">
            {delay}
          </Text>
        </Box>
      }
    >
      <UnstakeFlow />
    </CollapsableBox>
  )
}

const UnstakeModal = ({ onClose }: { onClose(): void }) => {
  return (
    <Modal title={t`Review stake`} onClose={onClose} width={440}>
      <UnstakePreview />
      <UnstakeDelay />
      <Button mt="4" fullWidth>
        <Trans>Begin unstaking process</Trans>
      </Button>
    </Modal>
  )
}

export default UnstakeModal

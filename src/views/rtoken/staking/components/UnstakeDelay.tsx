import { Trans } from '@lingui/macro'
import CollapsableBox from 'components/boxes/CollapsableBox'
import { useAtomValue } from 'jotai'
import { ArrowRight } from 'lucide-react'
import { Box, BoxProps, Text } from 'theme-ui'
import { unstakeDelayAtom } from '../atoms'

export const UnstakeFlow = () => {
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

const UnstakeDelay = (props: BoxProps) => {
  const delay = useAtomValue(unstakeDelayAtom)

  return (
    <CollapsableBox
      divider={false}
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
      {...props}
    >
      <UnstakeFlow />
    </CollapsableBox>
  )
}

export default UnstakeDelay

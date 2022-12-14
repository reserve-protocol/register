import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import { InfoBox } from 'components'
import { useFormContext } from 'react-hook-form'
import { useTransaction } from 'state/web3/hooks/useTransactions'
import {
  Box,
  BoxProps,
  Button,
  Divider,
  Flex,
  Image,
  Spinner,
  Text,
} from 'theme-ui'
import { formatCurrency } from 'utils'
import useDeploy from '../useDeploy'

const Container = styled(Box)`
  height: fit-content;
`

interface DeployStatusProps extends BoxProps {
  txId: string
}

const DeployStatus = ({ txId }: DeployStatusProps) => {
  const tx = useTransaction(txId)

  return <Box>Deploy status</Box>
}

const StakingTokenOverview = () => {
  const { watch } = useFormContext()
  const [tickerValue] = watch(['ticker'])

  return (
    <Box>
      <InfoBox
        light
        mb={3}
        title={'Staking token'}
        subtitle={tickerValue ? `${tickerValue}RSR Token` : 'Undefined'}
      />
      <InfoBox
        light
        title={'Staking token ticker'}
        subtitle={tickerValue ? `${tickerValue}RSR` : 'Undefined'}
      />
    </Box>
  )
}

const DeployOverview = (props: BoxProps) => {
  const { fee, deploy, isValid } = useDeploy()

  return (
    <Container variant="layout.borderBox" {...props}>
      <Flex sx={{ alignItems: 'center', flexDirection: 'column' }}>
        <Image height={32} width={32} src="/svgs/deploytx.svg" />
        <Text variant="title" sx={{ fontSize: 4 }} mt={2}>
          <Trans>Tx1. RToken Deploy</Trans>
        </Text>
        <Text variant="legend" as="p" mt={2} sx={{ textAlign: 'center' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ipsum dolor
          sit amet, consectetur adipiscing elit. Sit amet, consectetur
          adipiscing elit.
        </Text>
        <Button
          onClick={deploy}
          variant="accentAction"
          disabled={!isValid || !fee}
          mt={3}
          sx={{ width: '100%' }}
        >
          <Trans>Deploy RToken</Trans>
        </Button>
        <Box mt={3} sx={{ fontSize: 1, textAlign: 'center' }}>
          <Text variant="legend" mr={1}>
            <Trans>Estimated gas cost:</Trans>
            {!isValid && ' --'}
          </Text>
          {isValid && !fee && <Spinner color="black" size={12} />}
          {isValid && !!fee && (
            <Text sx={{ fontWeight: 500 }}>${formatCurrency(fee)}</Text>
          )}
        </Box>
      </Flex>

      <Divider sx={{ borderColor: 'darkBorder' }} my={3} mx={-4} />
      <StakingTokenOverview />
      <Divider sx={{ borderColor: 'darkBorder' }} my={3} mx={-4} />
      <Box>
        <Text variant="strong" mb={2}>
          Help title
        </Text>
        <Text as="p" variant="legend">
          Help text
        </Text>
      </Box>
    </Container>
  )
}

export default DeployOverview

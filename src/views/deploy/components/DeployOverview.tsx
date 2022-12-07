import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import { InfoBox } from 'components'
import useTransactionCost from 'hooks/useTransactionCost'
import { useSetAtom } from 'jotai'
import { useState } from 'react'
import { addTransactionAtom } from 'state/atoms'
import { v4 as uuid } from 'uuid'
import {
  Box,
  Flex,
  BoxProps,
  Image,
  Text,
  Button,
  Divider,
  Spinner,
} from 'theme-ui'
import { formatCurrency, getTransactionWithGasLimit } from 'utils'
import useDeployTx from '../useDeployTx'
import { useTransaction } from 'state/web3/hooks/useTransactions'

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

const DeployOverview = (props: BoxProps) => {
  const [deployId, setDeployId] = useState('')
  const deployTx = useDeployTx()
  const addTransaction = useSetAtom(addTransactionAtom)

  const [fee, gasError, gasLimit] = useTransactionCost(
    deployTx ? [deployTx] : []
  )

  const handleDeploy = () => {
    if (deployTx) {
      const id = uuid()
      addTransaction([
        { ...getTransactionWithGasLimit(deployTx, gasLimit), id },
      ])
      setDeployId(id)
    }
  }

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
          onClick={handleDeploy}
          variant="accentAction"
          disabled={!fee}
          mt={3}
          sx={{ width: '100%' }}
        >
          <Trans>Deploy RToken</Trans>
        </Button>
        <Box mt={3} sx={{ fontSize: 1, textAlign: 'center' }}>
          <Text variant="legend" mr={1}>
            <Trans>Estimated gas cost:</Trans>
            {!deployTx && '--'}
          </Text>
          {!!deployTx && !fee && <Spinner color="black" size={12} />}
          {!!fee && (
            <Text sx={{ fontWeight: 500 }}>${formatCurrency(fee)}</Text>
          )}
        </Box>
      </Flex>

      <Divider sx={{ borderColor: 'darkBorder' }} my={3} mx={-4} />
      <Box>
        <InfoBox light mb={3} title={'Staking token'} subtitle={'test'} />
        <InfoBox light title={'Staking token ticker'} subtitle={'test'} />
      </Box>
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

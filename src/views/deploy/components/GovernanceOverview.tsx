import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import CopyValue from 'components/button/CopyValue'
import GoTo from 'components/button/GoTo'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { formatCurrency, shortenString } from 'utils'
import { ROUTES, TRANSACTION_STATUS } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import useDeploy, { useDeployTxState } from '../useDeploy'

const Container = styled(Box)`
  height: fit-content;
`

const GovernanceStatus = () => {
  const navigate = useNavigate()
  const { fee, deploy, isValid } = useDeploy()
  const tx = useDeployTxState()

  useEffect(() => {
    if (tx?.status === TRANSACTION_STATUS.CONFIRMED) {
      navigate(`${ROUTES.GOVERNANCE_INFO}/${tx.id}`)
    }
  }, [tx?.status])

  if (
    tx?.status === TRANSACTION_STATUS.PENDING ||
    tx?.status === TRANSACTION_STATUS.SIGNING
  ) {
    return (
      <>
        <Spinner mt={3} size={24} mb={2} />
        <Text sx={{ fontWeight: 500, display: 'block' }}>
          <Trans>Pending, sign in wallet</Trans>
        </Text>
        <Text as="p" variant="legend">
          <Trans>
            Please sign the transaction in your wallet to continue with the
            government configuration process.
          </Trans>
        </Text>
      </>
    )
  }

  if (
    tx?.status === TRANSACTION_STATUS.MINING ||
    tx?.status === TRANSACTION_STATUS.CONFIRMED
  ) {
    return (
      <>
        <Spinner size={24} mt={3} mb={2} />
        <Text sx={{ fontWeight: 500, fontSize: 3, display: 'block' }} mb={2}>
          <Trans>Deploy transaction submitted</Trans>
        </Text>
        <Text as="p" variant="legend">
          <Trans>
            Stay patient while the transaction is in progress & don’t close this
            window to avoid issues finding your way back here.
          </Trans>
        </Text>
        <Box
          variant="layout.verticalAlign"
          sx={{ justifyContent: 'center' }}
          mt={4}
        >
          <Text variant="legend">{shortenString(tx?.hash ?? '')}</Text>
          <CopyValue ml={3} mr={2} value={tx?.hash ?? ''} />
          <GoTo
            href={getExplorerLink(tx?.hash ?? '', ExplorerDataType.TRANSACTION)}
          />
        </Box>
      </>
    )
  }

  return (
    <>
      <Text variant="legend" as="p" mt={2} sx={{ textAlign: 'center' }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ipsum dolor sit
        amet, consectetur adipiscing elit. Sit amet, consectetur adipiscing
        elit.
      </Text>
      <Button
        onClick={deploy}
        variant="accentAction"
        disabled={!isValid || !fee}
        mt={3}
        sx={{ width: '100%' }}
      >
        <Trans>Deploy Governance</Trans>
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
    </>
  )
}

const GovernanceOverview = (props: BoxProps) => (
  <Container variant="layout.borderBox" {...props}>
    <Flex
      sx={{
        alignItems: 'center',
        flexDirection: 'column',
        textAlign: 'center',
      }}
    >
      <Image height={32} width={32} src="/svgs/deploytx.svg" />
      <Text variant="title" sx={{ fontSize: 4 }} mt={2}>
        <Trans>Tx2. Governance</Trans>
      </Text>
      <GovernanceStatus />
    </Flex>
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

export default GovernanceOverview

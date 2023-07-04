import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import CopyValue from 'components/button/CopyValue'
import GoTo from 'components/button/GoTo'
import DeployActionIcon from 'components/icons/DeployActionIcon'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { getValidWeb3Atom, selectedRTokenAtom } from 'state/atoms'
import { Box, BoxProps, Button, Divider, Flex, Spinner, Text } from 'theme-ui'
import { formatCurrency, shortenString } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import useDeploy, { useDeployTxState } from '../useDeploy'

const Container = styled(Box)`
  height: fit-content;
`

const DeployStatus = () => {
  const { account, chainId } = useAtomValue(getValidWeb3Atom)
  const setRToken = useSetAtom(selectedRTokenAtom)
  const { fee, deploy, isValid } = useDeploy()
  const tx = useDeployTxState()

  useEffect(() => {
    if (tx?.extra?.rTokenAddress) {
      setRToken(tx?.extra?.rTokenAddress)
    }
  }, [tx?.extra?.rTokenAddress])

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
            deployment process.
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
            Meditate peacefully on the stability of a future asset backed
            reserve currency while your RToken deploys 🧘‍♂️
          </Trans>
        </Text>
        <Text as="p" variant="legend" mt={2}>
          <Trans>
            Please don't close this window to avoid issues finding your way back
            here.
          </Trans>
        </Text>
        <Box
          variant="layout.verticalAlign"
          sx={{ justifyContent: 'center' }}
          mt={4}
        >
          <Text>{shortenString(tx?.hash ?? '')}</Text>
          <CopyValue ml={3} mr={2} value={tx?.hash ?? ''} />
          <GoTo
            href={getExplorerLink(
              tx?.hash ?? '',
              chainId ?? 1,
              ExplorerDataType.TRANSACTION
            )}
          />
        </Box>
      </>
    )
  }

  return (
    <>
      <Text variant="legend" as="p" sx={{ textAlign: 'center' }}>
        <Trans>
          You will be the temporary owner until governance is deployed in
          transaction 2.
        </Trans>
      </Text>
      <Button
        onClick={deploy}
        variant="accentAction"
        disabled={!isValid || !fee}
        mt={4}
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
        {!account && (
          <Text mt={3} sx={{ display: 'block', color: 'warning' }}>
            <Trans>Please connect your wallet</Trans>
          </Text>
        )}
      </Box>
    </>
  )
}

const DeployOverview = (props: BoxProps) => (
  <Container variant="layout.borderBox" {...props}>
    <Flex
      sx={{
        alignItems: 'center',
        flexDirection: 'column',
        textAlign: 'center',
      }}
      py={2}
    >
      <DeployActionIcon />
      <Text variant="title" mt={2} mb={1}>
        <Trans>Tx1. RToken Deploy</Trans>
      </Text>
      <DeployStatus />
    </Flex>
  </Container>
)

export default DeployOverview

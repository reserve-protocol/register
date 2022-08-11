import { Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { selectedRTokenAtom } from 'state/atoms'
import { useTransaction } from 'state/web3/hooks/useTransactions'
import { Box, Card, Spinner, Text } from 'theme-ui'
import { shortenString } from 'utils'
import { ROUTES } from 'utils/constants'
import { deployIdAtom } from '../atoms'

const Pending = () => (
  <Box sx={{ textAlign: 'center', width: 400 }}>
    <Spinner size={24} />
    <Text sx={{ fontWeight: 500, display: 'block' }}>
      <Trans>Pending, sign in wallet</Trans>
    </Text>
    <Text as="p" variant="legend">
      <Trans>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit adipiscing elit
        consectetur.
      </Trans>
    </Text>
  </Box>
)

const Mining = ({ hash }: { hash: string }) => (
  <Box sx={{ textAlign: 'center', width: 400 }}>
    <Spinner size={24} />
    <Text sx={{ fontWeight: 500, display: 'block' }}>
      <Trans>RToken is being deployed</Trans>
    </Text>
    <Text as="p" variant="legend">
      <Trans>
        Stay patient & don’t close this window to avoid issues getting back to
        your next steps.
      </Trans>
    </Text>
    <Text mt={4} sx={{ display: 'block' }} variant="legend">
      Tx hash: {shortenString(hash)}
    </Text>
  </Box>
)

// TODO: Handle no id case -> redirect to step 0? that should be a bug
const DeployStatus = () => {
  const txId = useAtomValue(deployIdAtom)
  const tx = useTransaction(txId)
  const setRToken = useUpdateAtom(selectedRTokenAtom)
  const navigate = useNavigate()

  // TODO: Error case? user can get stuck here
  useEffect(() => {
    if (tx?.extra?.rTokenAddress) {
      setRToken(tx?.extra?.rTokenAddress)
      // TODO: Before fetching anything set user as owner

      // Deployment flow is complete! redirect the user to the management page
      navigate(ROUTES.MANAGEMENT)
    }
  }, [tx?.status])

  return (
    <Card
      mt={5}
      sx={{
        height: 'calc(100vh - 180px)',
        minHeight: 220,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {tx?.hash ? <Mining hash={tx.hash} /> : <Pending />}
    </Card>
  )
}

export default DeployStatus

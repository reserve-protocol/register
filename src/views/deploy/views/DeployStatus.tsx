import { Trans } from '@lingui/macro'
import CopyValue from 'components/button/CopyValue'
import GoTo from 'components/button/GoTo'
import useRToken from 'hooks/useRToken'
import { useAtom, useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { accountRoleAtom, selectedRTokenAtom } from 'state/atoms'
import { useTransaction } from 'state/web3/hooks/useTransactions'
import { Box, Card, Spinner, Text } from 'theme-ui'
import { shortenString } from 'utils'
import { ROUTES, TRANSACTION_STATUS } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { deployIdAtom } from '../atoms'
import { deployStepAtom } from '../components/DeployHeader'

const Pending = () => (
  <Box sx={{ textAlign: 'center', width: 420 }}>
    <Spinner size={24} />
    <Text sx={{ fontWeight: 500, display: 'block' }}>
      <Trans>Pending, sign in wallet</Trans>
    </Text>
    <Text as="p" variant="legend">
      <Trans>
        Please sign the transaction in your wallet to continue with the
        deployment process.
      </Trans>
    </Text>
  </Box>
)

const Mining = ({ hash }: { hash: string }) => (
  <Box sx={{ textAlign: 'center', width: 400 }}>
    <Spinner size={24} mb={2} />
    <Text sx={{ fontWeight: 500, fontSize: 3, display: 'block' }} mb={2}>
      <Trans>Deploy transaction submitted</Trans>
    </Text>
    <Text as="p" variant="legend">
      <Trans>
        Meditate peacefully on the stability of a future asset backed reserve
        currency while your RToken deploys 🧘‍♂️
      </Trans>
      <br />
      <br />
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
      <Text variant="legend">{shortenString(hash)}</Text>
      <CopyValue ml={3} mr={2} value={hash} />
      <GoTo href={getExplorerLink(hash, ExplorerDataType.TRANSACTION)} />
    </Box>
  </Box>
)

const DeployStatus = () => {
  const txId = useAtomValue(deployIdAtom)
  const tx = useTransaction(txId)
  const rToken = useRToken()
  const setRToken = useUpdateAtom(selectedRTokenAtom)
  const setOwner = useUpdateAtom(accountRoleAtom)
  const navigate = useNavigate()
  const [current, setStep] = useAtom(deployStepAtom)

  useEffect(() => {
    if (tx?.extra?.rTokenAddress) {
      setRToken(tx?.extra?.rTokenAddress)
    }

    if (tx?.status === TRANSACTION_STATUS.REJECTED) {
      setStep(current - 1)
    }
  }, [tx?.status])

  // Wait until rToken is selected and fetched to redirect the user to the management screen
  useEffect(() => {
    if (
      tx?.extra?.rTokenAddress &&
      rToken?.address === tx.extra.rTokenAddress
    ) {
      // In case user role is still being fetched, set the current account as owner
      setOwner({
        owner: true,
        pauser: true,
        freezer: true,
      })

      // Deployment flow is complete! redirect the user to the management page
      navigate(ROUTES.MANAGEMENT)
    }
  }, [rToken?.address])

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

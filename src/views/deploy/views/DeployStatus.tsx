import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect } from 'react'
import { Box, Card, Spinner, Text } from 'theme-ui'
import { shortenString } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { deployIdAtom } from '../atoms'
import { DeployerInterface } from 'abis'
import { DEPLOYER_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'

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
  // const tx = useTransaction(txId)
  const tx = {
    hash: '0xef59f35794a80c877668d566828337933be60e2c28260d1fa48da540c8747f52',
    status: TRANSACTION_STATUS.CONFIRMED,
  }
  const { provider } = useWeb3React()

  const handleDeploy = useCallback(async (hash: string) => {
    const receipt = await provider?.getTransactionReceipt(hash)

    if (receipt) {
      const log = receipt.logs.find(
        (logs) => logs.address === DEPLOYER_ADDRESS[CHAIN_ID]
      )

      if (log) {
        console.log('result', DeployerInterface.parseLog(log).args.rToken)
      }
    }

    // FacadeWriteInterface.decodeEventLog(receipt.logs[0])
    // if (receipt) {
    //   const events = receipt.events.filter((e: Event) => e.event === eventName)
    // }
  }, [])

  useEffect(() => {
    if (tx?.hash && tx?.status === TRANSACTION_STATUS.CONFIRMED) {
      handleDeploy(tx.hash)
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

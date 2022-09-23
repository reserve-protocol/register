import { t, Trans } from '@lingui/macro'
import { InfoBox } from 'components'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useTransaction } from 'state/web3/hooks/useTransactions'
import { Box, Button, Card, Divider, Flex, Grid, Text } from 'theme-ui'
import ListingInfo from 'views/management/components/ListingInfo'

const GovernanceConfigured = () => {
  let { txId } = useParams()
  const tx = useTransaction(txId ?? '')
  const config = useMemo(() => {
    const data = {
      owner: '',
      pauser: '',
      guardian: '',
      timelock: '',
      governance: '',
      rToken: '',
    }

    if (tx) {
      data.rToken = tx.call.args[0] || ''
      data.guardian = tx.call.args[5] || ''
      data.pauser = tx.call.args[6] || ''

      // Governance configured
      if (tx.call.args[1]) {
        data.governance = tx.extra?.governance ?? ''
        data.timelock = tx.extra?.timelock ?? ''
      } else {
        data.owner = tx.call.args[4] || ''
      }
    }

    return data
  }, [tx])

  const handleTally = () => {
    window.open('https://www.tally.xyz/?action=start-a-dao', '_blank')
  }

  return (
    <Box p={5}>
      <Flex ml={3} mb={4} sx={{ alignItems: 'center' }}>
        <Box>
          <Text sx={{ display: 'block', fontSize: 4, fontWeight: 500 }}>
            <Trans>Governance setup completed</Trans>
          </Text>
          <Text variant="legend">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Text>
        </Box>
        <Button ml="auto" px={3} onClick={handleTally}>
          <Trans>Setup Tally</Trans>
        </Button>
      </Flex>
      <Grid columns={2} gap={5}>
        <Card px={4}>
          <Text variant="title">
            <Trans>Main addresses</Trans>
          </Text>
          <Divider my={3} />
          <InfoBox mb={3} title={t`rToken address`} subtitle={config.rToken} />
          <InfoBox
            mb={3}
            title={t`Guardian address`}
            subtitle={config.guardian}
          />
          <InfoBox mb={3} title={t`Pauser address`} subtitle={config.pauser} />
          {config.governance ? (
            <>
              <InfoBox
                mb={3}
                title={t`Governor address`}
                subtitle={config.governance}
              />
              <InfoBox
                title={t`Timelock contract address`}
                subtitle={config.timelock}
              />
            </>
          ) : (
            <InfoBox title={t`Owner address`} subtitle={config.owner} />
          )}
        </Card>
        <ListingInfo />
      </Grid>
    </Box>
  )
}

export default GovernanceConfigured

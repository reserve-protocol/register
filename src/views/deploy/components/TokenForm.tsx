import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { Card } from 'components'
import { useEffect } from 'react'
import { Box, Text, BoxProps, Divider } from 'theme-ui'
import Field from './Field'

const TokenForm = (props: BoxProps) => {
  const { account } = useWeb3React()

  useEffect(() => {}, [account])

  return (
    <Card>
      <Box p={2}>
        <Text sx={{ fontSize: 3 }}>
          <Trans>RToken Details</Trans>
        </Text>
      </Box>
      <Divider mx={-3} mb={3} />
      <Field
        label={<Trans>Token name</Trans>}
        placeholder="Input token name"
        onChange={() => {}}
        value=""
        help={<Trans>Test</Trans>}
        mb={3}
      />
      <Field
        label={<Trans>Ticker</Trans>}
        placeholder="Input token name"
        onChange={() => {}}
        value=""
        help={<Trans>Test</Trans>}
        mb={3}
      />
      <Field
        label={<Trans>Ownership Address</Trans>}
        placeholder="Input token name"
        onChange={() => {}}
        value=""
        help={<Trans>Test</Trans>}
      />
    </Card>
  )
}

export default TokenForm

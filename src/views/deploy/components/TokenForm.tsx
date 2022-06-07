import { t, Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { Card } from 'components'
import { useAtomValue } from 'jotai'
import { selectAtom, useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { Box, Text, BoxProps, Divider } from 'theme-ui'
import { deployerFormAtom, updateFormAtom } from '../atoms'
import Field from './Field'
import deepEqual from 'fast-deep-equal'
import { useFormContext } from 'react-hook-form'
import { getAddress } from '@ethersproject/address'
import { isAddress } from 'utils'

const dataAtom = selectAtom(
  deployerFormAtom,
  (data) => ({
    name: data.name,
    symbol: data.symbol,
    ownerAddress: data.ownerAddress,
  }),
  deepEqual
)

const TokenForm = (props: BoxProps) => {
  const { account } = useWeb3React()
  const update = useUpdateAtom(updateFormAtom)

  useEffect(() => {
    update({ ownerAddress: account })
  }, [account])

  const handleChange = (field: string) => {
    return (value: string) => {
      update({ [field]: value })
    }
  }

  return (
    <Card p={4} {...props}>
      <Box p={1} pt={0} pb={2}>
        <Text sx={{ fontSize: 3 }}>
          <Trans>RToken Details</Trans>
        </Text>
      </Box>
      <Divider mx={-4} mb={3} />
      <Field
        label={t`Token name`}
        placeholder={t`Input token name`}
        help={t`Test`}
        mb={3}
        name="name"
        options={{
          required: t`Token name required`,
        }}
      />

      <Field
        label={t`Ticker`}
        placeholder={t`Input ticker`}
        help={t`Test`}
        mb={3}
        name="ticker"
        options={{
          required: t`Token ticker is required`,
        }}
      />
      <Field
        label={t`Ownership address`}
        placeholder={t`Input ownership address`}
        help={t`Test`}
        name="ownerAddress"
        options={{
          required: t`RToken owner address is required`,
          validate: (value) => !!isAddress(value) || t`Invalid address`,
        }}
      />
    </Card>
  )
}

export default TokenForm

import { t, Trans } from '@lingui/macro'
import Button from 'components/button'
import Field from 'components/field'
import Input from 'components/input'
import NumericalInput from 'components/numerical-input'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { Plus } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Box, BoxProps, Card, Divider, Flex, Text } from 'theme-ui'
import { StringMap } from 'types'
import { revenueSplitAtom } from '../atoms'

interface ExternalRevenueSplitProps extends BoxProps {
  index: number
}

const ExternalRevenueSpit = ({
  index,
  ...props
}: ExternalRevenueSplitProps) => {
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      total: '',
      stakers: '',
      holders: '',
    },
  })
  const [split, setSplit] = useAtom(revenueSplitAtom)
  const [total, setTotal] = useState(split.external[index].total)
  const [stakers, setStakers] = useState(split.external[index].stakers)
  const [holders, setHolders] = useState(split.external[index].holders)
  const [errors, setErrors] = useState<StringMap>({})

  const handleChange = (name: string) => (value: string) => {
    if (name !== 'total') {
    }
  }

  return (
    <Box {...props}>
      <Field label={t`% Revenue to RSR Stakers`}>
        <NumericalInput
          onChange={(value) => handleChange('total')}
          pattern="^[0-9]*[.,]?[0-9]$"
          placeholder={t`Input RSR stakers revenue distribution`}
        />
      </Field>
    </Box>
  )
}

const RevenueSplit = (props: BoxProps) => {
  const [revenueSplit, setRevenueSplit] = useAtom(revenueSplitAtom)

  const handleAddExternal = () => {}

  const handleChange = (value: string) => {
    console.log('value', value)
  }

  const handleExternalChange = (index: number, value: string) => {}

  return (
    <Card {...props}>
      <Text variant="strong" sx={{ fontSize: 4 }}>
        <Trans>Revenue Distribution</Trans>
      </Text>
      <Divider my={3} />
      <Field label={t`% Revenue to RToken Holders`} mb={3}>
        <Input
          onChange={handleChange}
          placeholder={t`Input token holders revenue distribution`}
        />
      </Field>
      <Field label={t`% Revenue to RSR Stakers`}>
        <Input
          onChange={handleChange}
          placeholder={t`Input RSR stakers revenue distribution`}
        />
      </Field>
      <Button mt={5} variant="muted" sx={{ width: '100%' }}>
        <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={14} />
          <Text pl={2}>
            <Trans>New external destination</Trans>
          </Text>
        </Flex>
      </Button>
    </Card>
  )
}

export default RevenueSplit

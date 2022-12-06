import { t, Trans } from '@lingui/macro'
import Button from 'components/button'
import Field, { FieldInput, getErrorMessage } from 'components/field'
import Input from 'components/input'
import NumericalInput from 'components/numerical-input'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { Plus } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Box, BoxProps, Card, Divider, Flex, Text } from 'theme-ui'
import { StringMap } from 'types'
import { decimalPattern } from 'utils'
import { revenueSplitAtom } from '../atoms'

interface ExternalRevenueSplitProps extends BoxProps {
  index: number
}

const ExternalRevenueSpit = ({
  index,
  ...props
}: ExternalRevenueSplitProps) => {
  const [split, setSplit] = useAtom(revenueSplitAtom)
  const {
    register,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      total: split.external[index].total,
      stakers: split.external[index].stakers,
      holders: split.external[index].holders,
    },
  })
  const formValues = watch(['total', 'stakers', 'holders'])

  useEffect(() => {
    if (!isDirty) {
      const [total, stakers, holders] = formValues
      setSplit({
        ...split,
        external: [
          ...split.external.slice(0, index),
          { total, stakers, holders },
          ...split.external.slice(index + 1),
        ],
      })
    }
  }, [...formValues])

  const options = {
    required: true,
    pattern: decimalPattern,
    min: 0,
    max: 100,
  }

  return (
    <Box {...props}>
      <Field label={t`% Totals`} mb={3}>
        <FieldInput
          {...register('total', options)}
          error={errors['total'] ? getErrorMessage(errors['total']) : ''}
        />
      </Field>
      <Field label={t`% Stakers`} mb={3}>
        <FieldInput
          {...register('stakers', options)}
          error={errors['stakers'] ? getErrorMessage(errors['stakers']) : ''}
        />
      </Field>
      <Field label={t`% Holders`}>
        <FieldInput
          {...register('holders', options)}
          error={errors['holders'] ? getErrorMessage(errors['holders']) : ''}
        />
      </Field>
    </Box>
  )
}

const RevenueSplit = (props: BoxProps) => {
  const [revenueSplit, setRevenueSplit] = useAtom(revenueSplitAtom)

  const handleAddExternal = () => {
    setRevenueSplit({
      ...revenueSplit,
      external: [
        ...revenueSplit.external,
        { total: '', stakers: '50', holders: '50' },
      ],
    })
  }

  const handleChange = (value: string) => {
    console.log('value', value)
  }

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
      {revenueSplit.external.map((split, index) => (
        <ExternalRevenueSpit index={index} />
      ))}
      <Button
        mt={5}
        variant="muted"
        sx={{ width: '100%' }}
        onClick={handleAddExternal}
      >
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

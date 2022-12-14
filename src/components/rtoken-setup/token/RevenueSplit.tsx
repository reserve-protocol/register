import { t, Trans } from '@lingui/macro'
import Button from 'components/button'
import Field, { FieldInput, getErrorMessage } from 'components/field'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { Plus } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Box, BoxProps, Card, Divider, Flex, Text } from 'theme-ui'
import {
  ExternalAddressSplit,
  isRevenueValidAtom,
  isValidExternalMapAtom,
  revenueSplitAtom,
} from '../atoms'
import ExternalRevenueSpit from './ExternalRevenueSplit'

const updateExternalShareAtom = atom(
  null,
  (get, set, [index, data]: [number, ExternalAddressSplit]) => {
    const current = get(revenueSplitAtom)
    set(revenueSplitAtom, {
      ...current,
      external: [
        ...current.external.slice(0, index),
        data,
        ...current.external.slice(index + 1),
      ],
    })
  }
)

const inputValidation = {
  required: true,
  pattern: /^[0-9]*[.]?[0-9]$/i,
  min: 0,
  max: 100,
}

const RevenueSplit = (props: BoxProps) => {
  const [revenueSplit, setRevenueSplit] = useAtom(revenueSplitAtom)
  const updateExternalShare = useUpdateAtom(updateExternalShareAtom)
  const isValid = useAtomValue(isRevenueValidAtom)
  const isValidExteranls = useAtomValue(isValidExternalMapAtom)
  const {
    register,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      stakers: revenueSplit.stakers,
      holders: revenueSplit.holders,
    },
  })
  const formValues = watch(['stakers', 'holders'])

  useEffect(() => {
    if (isDirty) {
      const [stakers, holders] = formValues
      setRevenueSplit({
        ...revenueSplit,
        stakers,
        holders,
      })
    }
  }, [...formValues])

  const handleAddExternal = () => {
    setRevenueSplit({
      ...revenueSplit,
      external: [
        ...revenueSplit.external,
        { total: '', stakers: '50', holders: '50', address: '' },
      ],
    })
  }

  const handleRemoveExternal = (index: number) => {
    setRevenueSplit({
      ...revenueSplit,
      external: [
        ...revenueSplit.external.slice(0, index),
        ...revenueSplit.external.slice(index + 1),
      ],
    })
  }

  return (
    <Card p={4} {...props}>
      <Text ml={2} variant="title">
        <Trans>Revenue Distribution</Trans>
      </Text>
      <Divider my={3} />
      <Field label={t`% Revenue to RToken Holders`} mb={3}>
        <FieldInput
          placeholder={t`Input token holders revenue distribution`}
          {...register('holders', inputValidation)}
          error={
            errors['holders'] ? getErrorMessage(errors['holders']) : !isValid
          }
        />
      </Field>
      <Field label={t`% Revenue to RSR Stakers`}>
        <FieldInput
          placeholder={t`Input RSR stakers revenue distribution`}
          {...register('stakers', inputValidation)}
          error={
            errors['stakers'] ? getErrorMessage(errors['stakers']) : !isValid
          }
        />
      </Field>
      {revenueSplit.external.map((split, index) => (
        <ExternalRevenueSpit
          mt={3}
          key={index}
          defaultValues={split}
          onRemove={() => handleRemoveExternal(index)}
          onChange={(data) => updateExternalShare([index, data])}
        />
      ))}
      {(!isValid || !isValidExteranls) && (
        <Box mt={3}>
          <Text variant="error" sx={{ fontSize: 1 }}>
            {!isValid ? (
              <Trans>Distributed revenue does not add up to 100%</Trans>
            ) : (
              <Trans>Invalid destination address</Trans>
            )}
          </Text>
        </Box>
      )}
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

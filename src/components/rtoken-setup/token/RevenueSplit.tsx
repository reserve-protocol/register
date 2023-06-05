import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import Field, { FieldInput, getErrorMessage } from 'components/field'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Plus } from 'react-feather'
import { useForm } from 'react-hook-form'
import DocsLink from 'components/docs-link/DocsLink'
import { Box, BoxProps, Card, Divider, Flex, Text, Link } from 'theme-ui'
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
  const updateExternalShare = useSetAtom(updateExternalShareAtom)
  const isValid = useAtomValue(isRevenueValidAtom)
  const isValidExternals = useAtomValue(isValidExternalMapAtom)
  const {
    register,
    watch,
    reset,
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
    if (!isDirty) {
      reset({
        stakers: revenueSplit.stakers || '0',
        holders: revenueSplit.holders || '0',
      })
    }
  }, [revenueSplit])

  useEffect(() => {
    const [stakers, holders] = formValues
    setRevenueSplit({
      ...revenueSplit,
      stakers,
      holders,
    })
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
      <Box variant="layout.verticalAlign">
        <Text variant="title">
          <Trans>Revenue Distribution</Trans>
        </Text>
        <DocsLink link="https://reserve.org/protocol/protocol_operations/#revenue-handling" />
      </Box>
      <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
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
      {isDirty && (!isValid || !isValidExternals) && (
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
      <SmallButton variant="muted" mt={4} onClick={handleAddExternal}>
        <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={16} />
          <Text pl={1}>
            <Trans>Add new address</Trans>
          </Text>
        </Flex>
      </SmallButton>
      <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
      <Text variant="legend" as="p" sx={{ fontSize: 1 }} mb={1} mr={2}>
        <Trans>
          Define what portion of the revenue goes to the RToken holders versus
          RSR stakers. It can also be configured to send a portion of the
          revenue of an RToken to any arbitrary Ethereum address (wallet or
          smart contract).
          <br />
          <br />
        </Trans>
        <Link
          href="https://reserve.org/protocol/protocol_operations/#revenue-distribution"
          target="_blank"
          sx={{ textDecoration: 'underline' }}
        >
          <Trans>Read more about revenue distribution</Trans>
        </Link>
      </Text>
    </Card>
  )
}

export default RevenueSplit

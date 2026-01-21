import { t, Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Field, { FieldInput, getErrorMessage } from 'components/field'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import DocsLink from '@/components/utils/docs-link'
import {
  ExternalAddressSplit,
  isRevenueValidAtom,
  isValidExternalMapAtom,
  revenueSplitAtom,
} from '../atoms'
import ExternalRevenueSpit from './ExternalRevenueSplit'
import { PROTOCOL_DOCS } from '@/utils/constants'

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

interface RevenueSplitProps {
  className?: string
}

const RevenueSplit = ({ className }: RevenueSplitProps) => {
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
    <Card className={`p-4 bg-secondary ${className || ''}`}>
      <div className="flex items-center">
        <span className="text-xl font-medium">
          <Trans>Revenue Distribution</Trans>
        </span>
        <DocsLink
          link={`${PROTOCOL_DOCS}yield_dtfs/overview/#revenue-handling`}
        />
      </div>
      <Separator className="my-4 -mx-4 border-muted" />
      <Field label={t`% Revenue to RToken Holders`} className="mb-4">
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
          className="mt-3"
          key={index}
          defaultValues={split}
          onRemove={() => handleRemoveExternal(index)}
          onChange={(data) => updateExternalShare([index, data])}
        />
      ))}
      {isDirty && (!isValid || !isValidExternals) && (
        <div className="mt-3">
          <span className="text-destructive text-xs">
            {!isValid ? (
              <Trans>Distributed revenue does not add up to 100%</Trans>
            ) : (
              <Trans>Invalid destination address</Trans>
            )}
          </span>
        </div>
      )}
      <Button
        size="sm"
        variant="ghost"
        className="mt-6"
        onClick={handleAddExternal}
      >
        <div className="flex items-center justify-center">
          <Plus size={16} />
          <span className="pl-1">
            <Trans>Add new address</Trans>
          </span>
        </div>
      </Button>
      <Separator className="my-4 -mx-4 border-muted" />
      <p className="text-legend text-xs mb-1 mr-2">
        <Trans>
          Define what portion of the revenue goes to the RToken holders versus
          RSR stakers. It can also be configured to send a portion of the
          revenue of an RToken to any arbitrary Ethereum address (wallet or
          smart contract).
          <br />
          <br />
        </Trans>
        <a
          href={`${PROTOCOL_DOCS}yield_dtfs/protocol_operations/#revenue-distribution`}
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          <Trans>Read more about revenue distribution</Trans>
        </a>
      </p>
    </Card>
  )
}

export default RevenueSplit

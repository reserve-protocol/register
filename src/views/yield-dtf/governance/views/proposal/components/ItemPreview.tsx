import { t, Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import { ArrowRight, Plus, Square, X } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { ParameterChange } from '../hooks/useParametersChanges'
import { isAddress, shortenAddress } from 'utils'

interface ParameterPreviewProps {
  values: ParameterChange
  className?: string
}

interface ParameterChangePreview {
  title: string
  subtitle: string
  current: string
  proposed: string
  onRevert?(): void
  className?: string
}

interface ListChangePreviewProps {
  isNew: boolean
  subtitle?: string
  value: string
  onRevert(): void
  className?: string
}

export const ListChangePreview = ({
  isNew,
  value,
  subtitle = '',
  onRevert,
  className,
}: ListChangePreviewProps) => (
  <div className={`flex items-center ${className || ''}`}>
    {isNew ? (
      <Plus color="#11BB8D" size={18} />
    ) : (
      <X color="#FF0000" size={18} />
    )}
    <div className="ml-2">
      <span className="text-legend text-xs block">
        {isNew ? <Trans>Add</Trans> : <Trans>Remove</Trans>} {subtitle}
      </span>
      <span>{value}</span>
    </div>
    <Button size="sm" variant="ghost" onClick={onRevert} className="ml-auto">
      <Trans>Revert</Trans>
    </Button>
  </div>
)

export const ParameterChangePreview = ({
  title,
  subtitle,
  current,
  proposed,
  onRevert,
  className,
}: ParameterChangePreview) => (
  <div className={className}>
    <div className="flex items-center">
      <div>
        <span className="text-legend text-xs block">{title}</span>
        <span>{subtitle}</span>
      </div>
      {!!onRevert && (
        <Button size="sm" variant="ghost" onClick={onRevert} className="ml-auto">
          <Trans>Discard</Trans>
        </Button>
      )}
    </div>
    <div className="flex items-center mt-2 justify-center flex-wrap">
      <Square fill="#FF0000" size={4} color="#FF0000" />
      <div className="ml-2">
        <span className="text-legend text-xs block">
          <Trans>Current</Trans>
        </span>
        <span>{isAddress(current) ? shortenAddress(current) : current}</span>
      </div>
      <ArrowRight
        style={{ marginLeft: 24, marginRight: 24 }}
        size={18}
        color="#808080"
      />
      <div className="flex items-center">
        <Square fill="#11BB8D" size={4} color="#11BB8D" />
        <div className="ml-2">
          <span className="text-legend text-xs block">
            <Trans>Proposed</Trans>
          </span>
          <span>
            {isAddress(proposed) ? shortenAddress(proposed) : proposed}
          </span>
        </div>
      </div>
    </div>
  </div>
)

export const ParameterPreview = ({
  values,
  className,
}: ParameterPreviewProps) => {
  const { resetField } = useFormContext()
  const { field, current, proposed } = values

  const handleRevert = () => {
    resetField(field)
  }

  return (
    <ParameterChangePreview
      title={t`Change`}
      subtitle={field}
      current={current}
      proposed={proposed}
      onRevert={handleRevert}
      className={className}
    />
  )
}

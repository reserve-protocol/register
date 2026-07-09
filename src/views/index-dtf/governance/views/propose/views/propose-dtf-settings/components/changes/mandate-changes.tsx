import { indexDTFAtom } from '@/state/dtf/atoms'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtom, useAtomValue } from 'jotai'
import { useFormContext } from 'react-hook-form'
import { ArrowRight, FileText } from 'lucide-react'
import { mandateChangeAtom, hasMandateChangeAtom } from '../../atoms'
import { ChangeSection, RevertButton } from './shared'

const MandateChanges = () => {
  const { t } = useLingui()
  const indexDTF = useAtomValue(indexDTFAtom)
  const [mandateChange, setMandateChange] = useAtom(mandateChangeAtom)
  const hasMandateChange = useAtomValue(hasMandateChangeAtom)
  const { setValue } = useFormContext()

  if (!hasMandateChange || !indexDTF || !mandateChange) return null

  const handleRevert = () => {
    setMandateChange(undefined)
    setValue('mandate', indexDTF.mandate || '')
  }

  return (
    <ChangeSection
      title={<Trans>Mandate Update</Trans>}
      icon={<FileText size={16} />}
    >
      <div className="p-4 rounded-lg bg-muted/70 border  space-y-3">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            <Trans>Current mandate:</Trans>
          </div>
          <p className="text-sm text-muted-foreground">
            {indexDTF.mandate || t`No mandate set`}
          </p>
        </div>
        <ArrowRight size={16} className="text-primary" />
        <div className="space-y-2">
          <div className="text-xs text-primary">
            <Trans>New mandate:</Trans>
          </div>
          <p className="text-sm">{mandateChange}</p>
        </div>
        <RevertButton onClick={handleRevert} />
      </div>
    </ChangeSection>
  )
}

export default MandateChanges

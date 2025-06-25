import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { useFormContext } from 'react-hook-form'
import { ArrowRight, FileText } from 'lucide-react'
import { mandateChangeAtom, hasMandateChangeAtom } from '../../atoms'
import { ChangeSection, RevertButton } from './shared'

const MandateChanges = () => {
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
    <ChangeSection title="Mandate Update" icon={<FileText size={16} />}>
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Current mandate:</div>
          <p className="text-sm text-muted-foreground">
            {indexDTF.mandate || 'No mandate set'}
          </p>
        </div>
        <ArrowRight size={16} className="text-primary" />
        <div className="space-y-2">
          <div className="text-xs text-primary">New mandate:</div>
          <p className="text-sm">{mandateChange}</p>
        </div>
        <RevertButton onClick={handleRevert} />
      </div>
    </ChangeSection>
  )
}

export default MandateChanges
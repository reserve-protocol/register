import { indexDTFAtom, indexDTFVersionAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { useFormContext } from 'react-hook-form'
import { ArrowRight, FileText, Type } from 'lucide-react'
import {
  mandateChangeAtom,
  hasMandateChangeAtom,
  tokenNameChangeAtom,
  hasTokenNameChangeAtom,
} from '../../atoms'
import { ChangeSection, RevertButton } from './shared'

const BasicsChanges = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const version = useAtomValue(indexDTFVersionAtom)
  const isV5 = version.startsWith('5')
  const [tokenNameChange, setTokenNameChange] = useAtom(tokenNameChangeAtom)
  const [mandateChange, setMandateChange] = useAtom(mandateChangeAtom)
  const hasTokenNameChange = useAtomValue(hasTokenNameChangeAtom)
  const hasMandateChange = useAtomValue(hasMandateChangeAtom)
  const { setValue } = useFormContext()

  const hasAnyChange = hasTokenNameChange || hasMandateChange

  if (!hasAnyChange || !indexDTF) return null

  const handleRevertTokenName = () => {
    setTokenNameChange(undefined)
    setValue('tokenName', indexDTF.token.name || '')
  }

  const handleRevertMandate = () => {
    setMandateChange(undefined)
    setValue('mandate', indexDTF.mandate || '')
  }

  return (
    <ChangeSection title="Basics Update" icon={<FileText size={16} />}>
      {hasTokenNameChange && isV5 && tokenNameChange && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-muted/70 border">
          <Type size={16} />
          <div className="mr-auto">
            <div className="text-sm font-medium">Token Name</div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">
                {indexDTF.token.name}
              </span>
              <ArrowRight size={16} className="text-primary" />
              <span className="text-primary font-medium">{tokenNameChange}</span>
            </div>
          </div>
          <RevertButton size="icon-rounded" onClick={handleRevertTokenName} />
        </div>
      )}

      {hasMandateChange && mandateChange && (
        <div className="p-4 rounded-lg bg-muted/70 border space-y-3">
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
          <RevertButton onClick={handleRevertMandate} />
        </div>
      )}
    </ChangeSection>
  )
}

export default BasicsChanges

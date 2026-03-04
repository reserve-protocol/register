import { useAtomValue } from 'jotai'
import { cn } from '@/lib/utils'
import { parametersChangesAtom } from '../atoms'
import { ParameterPreview } from './ItemPreview'
import PreviewBox from './PreviewBox'

interface Props {
  className?: string
}

const ProposedParametersPreview = ({ className }: Props) => {
  const changes = useAtomValue(parametersChangesAtom)

  if (!changes.length) {
    return null
  }

  // TODO: Split by contract or bucket
  return (
    <PreviewBox
      count={changes.length}
      title="Parameters"
      className={cn('border border-border rounded-xl p-6', className)}
    >
      {changes.map((change) => (
        <ParameterPreview key={change.field} className="mt-4" values={change} />
      ))}
    </PreviewBox>
  )
}

export default ProposedParametersPreview

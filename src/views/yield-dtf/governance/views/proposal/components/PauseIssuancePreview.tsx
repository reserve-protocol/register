import { useAtom } from 'jotai'
import { cn } from '@/lib/utils'
import { pauseIssuanceAtom } from '../atoms'
import { ListChangePreview } from './ItemPreview'
import PreviewBox from './PreviewBox'

interface Props {
  className?: string
}

const PauseIssuancePreview = ({ className }: Props) => {
  const [pauseAction, setPauseAction] = useAtom(pauseIssuanceAtom)

  if (pauseAction === 'none') return null

  return (
    <PreviewBox
      className={cn('border border-border rounded-xl p-6', className)}
      count={1}
      title="Pause issuance"
    >
      <ListChangePreview
        onRevert={() => setPauseAction('none')}
        isNew={pauseAction === 'unpause'}
        value={
          pauseAction === 'pause' ? 'Pause issuance' : 'Unpause issuance'
        }
        className="mt-4"
      />
    </PreviewBox>
  )
}

export default PauseIssuancePreview

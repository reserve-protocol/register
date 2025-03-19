import { Textarea } from '@/components/ui/textarea'
import { useFormContext } from 'react-hook-form'
import { GovernanceInputs } from '../schema'

const Mandate = () => {
  const { register } = useFormContext<GovernanceInputs>()

  return (
    <div className="p-4">
      <div className="space-y-3">
        <Textarea
          id="mandate"
          placeholder="Enter the mandate for this Reserve Index..."
          className="min-h-[120px] resize-none bg-background border-border focus-visible:ring-primary"
          {...register('mandate')}
        />
        <p className="text-xs text-muted-foreground mt-2">
          A clear mandate helps governance members make informed decisions about
          the future of this DTF.
        </p>
      </div>
    </div>
  )
}

export default Mandate

import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Circle, Play } from 'lucide-react'

export enum DTFChoice {
  IndexDTF,
  YieldDTF,
}

interface IDiscoverDTFChoice extends ButtonProps {
  isSelected: boolean
}

const ChoiceButton = ({ isSelected, ...props }: IDiscoverDTFChoice) => {
  return (
    <Button
      {...props}
      variant="ghost"
      className={cn(
        'flex gap-2 font-light items-center border-b-2 h-auto text-legend/60 border-b-legend/60 py-4 rounded-none hover:text-primary hover:border-primary ',
        isSelected ? 'border-b-primary text-primary' : ''
      )}
    />
  )
}

const DiscoverDTFChoice = ({
  value,
  onChange,
}: {
  value: DTFChoice
  onChange(value: DTFChoice): void
}) => {
  return (
    <div className="flex flex-col items-center mb-12 mt-12">
      <h2 className="text-primary text-xl font-bold mb-4">Discover</h2>
      <div className="flex items-center ">
        <ChoiceButton
          variant="ghost"
          isSelected={value === DTFChoice.IndexDTF}
          onClick={() => onChange(DTFChoice.IndexDTF)}
        >
          <Circle className="h-9 w-9" />
          <h1 className="text-4xl">Index DTFs</h1>
        </ChoiceButton>
        <ChoiceButton
          isSelected={value === DTFChoice.YieldDTF}
          onClick={() => onChange(DTFChoice.YieldDTF)}
        >
          <Circle className="h-9 w-9" />
          <h1 className="text-4xl">Yield DTFs</h1>
        </ChoiceButton>
      </div>

      <p className="text-xl text-primary text-center max-w-[596px] mt-4">
        Reserve Folios allow you to get simple index exposure to narrative bets
        while holding 1 token
      </p>

      <Button variant="outline-primary" className="rounded-[50px] mt-4">
        <Circle />
        <span className="ml-1 mr-2">What are RFolios?</span>
        <div className="rounded-full w-6 h-6 bg-primary flex items-center justify-center">
          <Play size={16} stroke="primary" fill="white" />
        </div>
      </Button>
    </div>
  )
}

export default DiscoverDTFChoice

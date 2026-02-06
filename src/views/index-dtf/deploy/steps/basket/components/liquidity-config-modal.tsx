import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAtom } from 'jotai'
import { Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { liquiditySimulationAmountAtom } from '../atoms'

const MIN_AMOUNT = 10
const MAX_AMOUNT = 100000

const LiquidityConfigModal = () => {
  const [amount, setAmount] = useAtom(liquiditySimulationAmountAtom)
  const [open, setOpen] = useState(false)
  const [localAmount, setLocalAmount] = useState(amount)
  const [inputValue, setInputValue] = useState(amount.toString())

  useEffect(() => {
    if (open) {
      setLocalAmount(amount)
      setInputValue(amount.toString())
    }
  }, [open, amount])

  const handleSliderChange = (value: number[]) => {
    const newValue = value[0]
    setInputValue(newValue.toString())
    setLocalAmount(newValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    setInputValue(value)

    const numValue = Number(value)
    if (numValue >= MIN_AMOUNT && numValue <= MAX_AMOUNT) {
      setLocalAmount(numValue)
    }
  }

  const handleInputBlur = () => {
    const numValue = Number(inputValue)
    if (numValue < MIN_AMOUNT) {
      setInputValue(MIN_AMOUNT.toString())
      setLocalAmount(MIN_AMOUNT)
    } else if (numValue > MAX_AMOUNT) {
      setInputValue(MAX_AMOUNT.toString())
      setLocalAmount(MAX_AMOUNT)
    }
  }

  const handleSimulate = () => {
    setAmount(localAmount)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="accent"
                size="icon"
                className="h-14 w-14 rounded-xl bg-muted/80"
              >
                <Settings size={18} />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Simulation config</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Liquidity simulation amount</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <p className="text-sm text-muted-foreground">
            Set the USD amount per token used to simulate price impact.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">$</span>
            <Input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="text-lg"
            />
          </div>
          <div className="px-2">
            <Slider
              value={[localAmount]}
              onValueChange={handleSliderChange}
              min={MIN_AMOUNT}
              max={MAX_AMOUNT}
              step={100}
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>${MIN_AMOUNT.toLocaleString()}</span>
              <span>${MAX_AMOUNT.toLocaleString()}</span>
            </div>
          </div>
          <Button onClick={handleSimulate} className="w-full">
            Simulate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LiquidityConfigModal

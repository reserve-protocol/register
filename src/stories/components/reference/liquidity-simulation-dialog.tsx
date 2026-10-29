import { useId, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { DialogTaskHeader } from './dialog-task-header'

import { Button } from '@/components/button'
import { TextInput } from '@/components/design-system-v1/field'
import { v1Typography } from '@/components/design-system-v1/typography'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  type DialogWidth,
} from '@/components/dialog'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

const MIN_AMOUNT = 10
const MAX_AMOUNT = 100000
const boundAmount = (draft: string) =>
  Math.min(MAX_AMOUNT, Math.max(MIN_AMOUNT, Number(draft)))

export const LiquiditySimulationDialog = ({
  width = 'standard',
  topicHeader = false,
}: {
  width?: DialogWidth
  topicHeader?: boolean
}) => {
  const titleId = useId()
  const descriptionId = useId()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(10000)
  const [localAmount, setLocalAmount] = useState(amount)
  const [draft, setDraft] = useState(String(amount))

  const changeOpen = (next: boolean) => {
    if (next) {
      setLocalAmount(amount)
      setDraft(String(amount))
    }
    setOpen(next)
  }
  const normalizeDraft = () => {
    const next = boundAmount(draft)
    setLocalAmount(next)
    setDraft(String(next))
    return next
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button>Simulation config</Button>
      </DialogTrigger>
      <DialogContent width={width}>
        <form
          className="flex min-h-0 flex-col"
          onSubmit={(event) => {
            event.preventDefault()
            setAmount(normalizeDraft())
            setOpen(false)
          }}
        >
          <DialogTaskHeader
            title={<span id={titleId}>Liquidity simulation amount</span>}
            description={
              <span id={descriptionId}>
                Set the USD amount per token used to simulate price impact.
              </span>
            }
            topicIcon={
              topicHeader ? (
                <SlidersHorizontal className="size-5" strokeWidth={1.5} />
              ) : undefined
            }
          />
          <DialogBody className="space-y-4 py-4">
            <TextInput
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              inputMode="numeric"
              leading="$"
              inputClassName="tabular-nums"
              value={draft}
              onChange={(event) => {
                const nextDraft = event.target.value.replace(/[^0-9]/g, '')
                setDraft(nextDraft)
                const next = Number(nextDraft)
                if (next >= MIN_AMOUNT && next <= MAX_AMOUNT)
                  setLocalAmount(next)
              }}
              onBlur={normalizeDraft}
            />
            <div>
              <Slider
                aria-label="Liquidity simulation amount"
                className="h-11"
                min={MIN_AMOUNT}
                max={MAX_AMOUNT}
                step={100}
                value={[localAmount]}
                onValueChange={([next]) => {
                  setLocalAmount(next)
                  setDraft(String(next))
                }}
              />
              <div
                className={cn(
                  'flex justify-between text-supporting-foreground',
                  v1Typography.supporting
                )}
              >
                <span>$10</span>
                <span>$100,000</span>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="submit" className="w-full">
              Simulate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

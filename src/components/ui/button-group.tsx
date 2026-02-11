/**
 * ButtonGroup - Group of toggle buttons
 */
import { FC, useState } from 'react'
import { Button } from './button'
import { cn } from '@/lib/utils'

type ButtonGroupItem = {
  label: string
  onClick: () => void
}

type ButtonGroupProps = {
  buttons: ButtonGroupItem[]
  startActive?: number
}

const ButtonGroup: FC<ButtonGroupProps> = ({ buttons, startActive = 0 }) => {
  const [active, setActive] = useState(startActive)

  return (
    <div className="flex flex-row rounded-lg overflow-hidden bg-border gap-0.5 p-0.5 w-fit">
      {buttons.map((button, index) => (
        <Button
          key={index}
          variant="ghost"
          onClick={() => {
            setActive(index)
            button.onClick()
          }}
          className={cn(
            'rounded-md cursor-pointer px-3 py-2 text-sm whitespace-nowrap border-0',
            index === active
              ? 'bg-background text-primary'
              : 'bg-border text-foreground hover:bg-background hover:text-primary'
          )}
        >
          {button.label}
        </Button>
      ))}
    </div>
  )
}

export default ButtonGroup

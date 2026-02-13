import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useCallback, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export interface SelectOption {
  label: string
  value: string
  icon: React.ReactNode | null
}

export interface IMultiselectDropdrown {
  options: SelectOption[]
  selected: string[]
  allOption?: boolean
  minLimit?: number
  onChange: (selected: string[]) => void
  className?: string
  children?: React.ReactNode
}

const OptionSelection = ({
  options,
  selected,
  onChange,
  allOption,
  minLimit,
}: IMultiselectDropdrown) => {
  const [values, setValues] = useState(
    options.reduce(
      (acc, v) => {
        acc[v.value] = selected.includes(v.value)

        return acc
      },
      {} as Record<string, boolean>
    )
  )

  const handleApply = () => {
    const selected = Object.entries(values).reduce((acc, [key, value]) => {
      if (value) {
        acc.push(key)
      }

      return acc
    }, [] as string[])

    onChange(selected)
  }

  const handleAll = () => {
    setValues(
      Object.keys(values).reduce(
        (acc, key) => {
          acc[key] = false
          return acc
        },
        {} as Record<string, boolean>
      )
    )
  }

  const selectedCount = Object.values(values).filter((v) => v).length
  const allSelected = !selectedCount
  const lowerBound = allOption ? 0 : minLimit || 0

  return (
    <div className="bg-background rounded-xl mt-4">
      <div className="max-h-[260px] overflow-auto hidden-scrollbar">
        {allOption && (
          <div className="flex items-center px-4 py-2">
            <span className="mr-4 font-semibold">All options</span>
            <div className="ml-auto">
              <Switch
                variant="small"
                disabled={allSelected}
                checked={allSelected}
                onCheckedChange={handleAll}
              />
            </div>
          </div>
        )}
        {options.map((option) => (
          <div className="flex items-center px-4 py-2" key={option.value}>
            {option.icon}
            <span className="ml-1 mr-4">{option.label}</span>
            <div className="ml-auto">
              <Switch
                variant="small"
                checked={values[option.value]}
                disabled={values[option.value] && selectedCount <= lowerBound}
                onCheckedChange={() =>
                  setValues({
                    ...values,
                    [option.value]: !values[option.value],
                  })
                }
              />
            </div>
          </div>
        ))}
      </div>

      <Separator className="mt-2 mb-4" />
      <div className="px-4 pb-4">
        <Button size="sm" className="w-full" onClick={handleApply}>
          Apply
        </Button>
      </div>
    </div>
  )
}

const MultiselectDropdrown = ({
  children,
  options,
  selected,
  allOption = false,
  minLimit,
  onChange,
  className,
}: IMultiselectDropdrown) => {
  const [isVisible, setVisible] = useState(false)

  const handleChange = useCallback(
    (selected: string[]) => {
      setVisible(false)
      onChange(selected)
    },
    [setVisible, onChange]
  )

  return (
    <Popover open={isVisible} onOpenChange={setVisible}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            'flex items-center cursor-pointer justify-between gap-2',
            className
          )}
        >
          <div className="flex items-center">{children}</div>
          <div className="flex items-center">
            {isVisible ? (
              <ChevronUp size={18} color="#808080" />
            ) : (
              <ChevronDown size={18} color="#808080" />
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 rounded-xl border-2 border-border shadow-lg"
        align="start"
      >
        <OptionSelection
          options={options}
          selected={selected}
          onChange={handleChange}
          allOption={allOption}
          minLimit={minLimit}
        />
      </PopoverContent>
    </Popover>
  )
}

export default MultiselectDropdrown

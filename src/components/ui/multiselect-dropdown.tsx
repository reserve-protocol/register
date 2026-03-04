import { useCallback, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export interface SelectOption {
  label: string
  value: string
  icon?: React.ReactNode
}

export interface MultiselectDropdownProps {
  options: SelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  allOption?: boolean
  minLimit?: number
  className?: string
  children?: React.ReactNode
}

const OptionSelection = ({
  options,
  selected,
  onChange,
  allOption,
  minLimit,
  onClose,
}: MultiselectDropdownProps & { onClose: () => void }) => {
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
    const selectedValues = Object.entries(values).reduce(
      (acc, [key, value]) => {
        if (value) {
          acc.push(key)
        }
        return acc
      },
      [] as string[]
    )

    onChange(selectedValues)
    onClose()
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
    <div>
      <div className="max-h-[260px] overflow-y-auto p-2 hidden-scrollbar">
        {allOption && (
          <div
            className="flex items-center justify-between px-3 py-2 hover:bg-accent rounded-md cursor-pointer"
            onClick={!allSelected ? handleAll : undefined}
          >
            <span className="font-medium text-sm">All options</span>
            <Switch
              checked={allSelected}
              disabled={allSelected}
              onCheckedChange={handleAll}
              onClick={(e) => e.stopPropagation()}
              variant="small"
            />
          </div>
        )}
        {options.map((option) => (
          <div
            key={option.value}
            className="flex items-center justify-between px-3 py-2 hover:bg-accent rounded-md cursor-pointer"
            onClick={() => {
              if (!(values[option.value] && selectedCount <= lowerBound)) {
                setValues({
                  ...values,
                  [option.value]: !values[option.value],
                })
              }
            }}
          >
            <div className="flex items-center gap-2">
              {option.icon}
              <span className="text-sm">{option.label}</span>
            </div>
            <Switch
              checked={values[option.value]}
              disabled={values[option.value] && selectedCount <= lowerBound}
              onCheckedChange={(checked) =>
                setValues({
                  ...values,
                  [option.value]: checked,
                })
              }
              onClick={(e) => e.stopPropagation()}
              variant="small"
            />
          </div>
        ))}
      </div>

      <div className="p-1 border-t">
        <Button size="sm" className="w-full rounded-lg" onClick={handleApply}>
          Apply
        </Button>
      </div>
    </div>
  )
}

const MultiselectDropdown = ({
  children,
  options,
  selected,
  allOption = false,
  minLimit,
  onChange,
  placeholder = 'Select options',
  className,
}: MultiselectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleChange = useCallback(
    (selectedValues: string[]) => {
      onChange(selectedValues)
    },
    [onChange]
  )

  const displayText = () => {
    if (children) {
      return children
    }

    if (!selected.length || (allOption && !selected.length)) {
      return placeholder
    }

    return `${selected.length} selected`
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'justify-between font-normal',
            !children && 'text-muted-foreground',
            className
          )}
        >
          <div className="flex items-center gap-2">{displayText()}</div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 opacity-50" />
          ) : (
            <ChevronDown className="h-4 w-4 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-0 rounded-xl border-2 border-border"
        align="center"
        sideOffset={4}
      >
        <OptionSelection
          options={options}
          selected={selected}
          onChange={handleChange}
          allOption={allOption}
          minLimit={minLimit}
          onClose={() => setIsOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}

export default MultiselectDropdown

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/design-system-v1/select'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'

export function TablePreviewSelect({
  id,
  label,
  value,
  choices,
  onChange,
}: {
  id: string
  label: string
  value: string
  choices: Record<string, string>
  onChange: (value: string) => void
}) {
  return (
    <div className="min-w-0 space-y-2">
      <label
        htmlFor={id}
        className={cn(type.supporting, 'text-muted-foreground')}
      >
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} data-testid={id} className="w-64 max-w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(choices).map(([key, title]) => (
            <SelectItem key={key} value={key} data-testid={`${id}-${key}`}>
              {title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

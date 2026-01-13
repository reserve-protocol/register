import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Mail, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import XIcon from 'components/icons/XIcon'
import TelegramIcon from 'components/icons/TelegramIcon'

export type SocialMediaOption = {
  key: string
  name: string
  placeholder: string
  icon: React.ReactNode
}

export const SOCIAL_MEDIA_OPTIONS: SocialMediaOption[] = [
  {
    key: 'telegram',
    name: 'Telegram',
    placeholder: 'Telegram username',
    icon: <TelegramIcon className="h-4 w-4" />,
  },
  {
    key: 'twitter',
    name: 'x.com',
    placeholder: 'x.com username',
    icon: <XIcon className="h-4 w-4" />,
  },
  {
    key: 'email',
    name: 'Email',
    placeholder: 'Email address',
    icon: <Mail className="h-4 w-4" />,
  },
]

type SocialMediaInputProps = {
  value: string
  onChange: (value: string) => void
  selected: SocialMediaOption
  onSelectChange: (option: SocialMediaOption) => void
  disabled?: boolean
  error?: boolean
}

const SocialMediaInput = ({
  value,
  onChange,
  selected,
  onSelectChange,
  disabled,
  error,
}: SocialMediaInputProps) => {
  return (
    <div className="relative flex-grow">
      <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 border-r pr-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={disabled}>
            <button
              type="button"
              className="flex items-center gap-2 px-2 h-8 hover:bg-accent rounded-md disabled:opacity-50"
            >
              {selected.icon}
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {SOCIAL_MEDIA_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.key}
                onClick={() => {
                  onChange('')
                  onSelectChange(option)
                }}
                className="flex items-center gap-2"
              >
                {option.icon}
                {option.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Input
        className={cn(
          'pl-20 h-12 rounded-xl',
          disabled && 'text-muted-foreground',
          error && 'border-destructive'
        )}
        placeholder={selected.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  )
}

export default SocialMediaInput

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Mail, ChevronDown } from 'lucide-react'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { walletAtom } from '@/state/atoms'
import { cn } from '@/lib/utils'
import XIcon from 'components/icons/XIcon'
import DiscordColorIcon from 'components/icons/DiscordColorIcon'
import TelegramIcon from 'components/icons/TelegramIcon'

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || ''

type SocialMediaOption = {
  key: string
  name: string
  placeholder: string
  icon: React.ReactNode
}

const SOCIAL_MEDIA_OPTIONS: SocialMediaOption[] = [
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
    key: 'discord',
    name: 'Discord',
    placeholder: 'Discord username',
    icon: <DiscordColorIcon className="h-4 w-4" />,
  },
  {
    key: 'email',
    name: 'Email',
    placeholder: 'Email address',
    icon: <Mail className="h-4 w-4" />,
  },
]

const SocialMediaInput = () => {
  const account = useAtomValue(walletAtom)
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selected, setSelected] = useState<SocialMediaOption>(
    SOCIAL_MEDIA_OPTIONS[0]
  )

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 5000)
      return () => clearTimeout(timeout)
    }
  }, [copied])

  const handleTrackUsername = useCallback(
    async (key: string) => {
      setSubmitted(true)
      try {
        await fetch(STORAGE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: account,
            amount: 'Create index DTF',
            [key]: value,
          }),
        })
      } catch (error) {
        setSubmitted(false)
        console.error('Error submitting data:', error)
      }
    },
    [value, account]
  )

  const onChange = (newValue: string) => {
    if (!submitted) setValue(newValue)
  }

  return (
    <div className="relative flex-grow min-w-[360px]">
      <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 border-r pr-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 px-2 h-8"
            >
              {selected.icon}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {SOCIAL_MEDIA_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.key}
                onClick={() => {
                  setValue('')
                  setSelected(option)
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
          'pl-20 pr-28 h-12 bg-card rounded-xl shadow-[0_4px_32px_rgba(0,0,0,0.05)]',
          submitted && 'text-muted-foreground'
        )}
        placeholder={selected.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={submitted}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleTrackUsername(selected.key)
          }
        }}
      />

      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        {submitted ? (
          <Button
            size="xs"
            variant="outline"
            disabled={copied}
            onClick={() => {
              navigator.clipboard.writeText(value)
              setCopied(true)
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        ) : (
          <Button
            size="xs"
            disabled={!value || submitted}
            onClick={() => handleTrackUsername(selected.key)}
          >
            Contact me
          </Button>
        )}
      </div>
    </div>
  )
}

export default SocialMediaInput

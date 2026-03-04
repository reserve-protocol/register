import { Button } from '@/components/ui/button'
import { Input } from 'components'
import DiscordColorIcon from 'components/icons/DiscordColorIcon'
import TelegramIcon from 'components/icons/TelegramIcon'
import XIcon from 'components/icons/XIcon'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Mail } from 'lucide-react'
import { walletAtom } from 'state/atoms'
import { cn } from '@/lib/utils'
import { useZap } from '../context/ZapContext'

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || ''

type SocialMediaOption = {
  key: string
  name: string
  placeholder: string
  icon: React.ReactNode
}

const SOCIAL_MEDIA_OPTIONS = [
  {
    key: 'telegram',
    name: 'Telegram',
    placeholder: 'Telegram username',
    icon: <TelegramIcon />,
  },
  {
    key: 'twitter',
    name: 'x.com',
    placeholder: 'x.com username',
    icon: <XIcon height={18} width={18} />,
  },
  {
    key: 'discord',
    name: 'Discord',
    placeholder: 'Discord username',
    icon: <DiscordColorIcon />,
  },
  {
    key: 'email',
    name: 'Email',
    placeholder: 'Email address',
    icon: <Mail size={14} />,
  },
]

const Dropdown = ({
  selected,
  options,
  onSelectOption,
  className,
}: {
  selected: SocialMediaOption
  options: SocialMediaOption[]
  onSelectOption: (option: SocialMediaOption) => void
  className?: string
}) => {
  const [isVisible, setVisible] = useState(false)

  return (
    <Popover open={isVisible} onOpenChange={setVisible}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            'flex items-center cursor-pointer justify-center absolute left-2 top-1/2 -translate-y-1/2 border-r border-border pr-1 pl-0.5',
            className
          )}
        >
          {selected.icon}
          <div className="pl-1" />
          {isVisible ? (
            <ChevronUp color="currentColor" strokeWidth={1.2} size={16} />
          ) : (
            <ChevronDown color="currentColor" strokeWidth={1.2} size={16} />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 rounded-xl border-2 border-border shadow-lg"
        align="start"
      >
        <div className="rounded-lg bg-background">
          {options.map((option) => (
            <div
              key={option.key}
              className="flex items-center px-2 py-1 cursor-pointer text-xs font-medium hover:bg-muted hover:rounded-lg"
              onClick={() => {
                onSelectOption(option)
                setVisible(false)
              }}
            >
              {option.icon}
              <div className="pl-2" />
              {option.name}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

const SocialMediaInput = ({ className }: { className?: string }) => {
  const account = useAtomValue(walletAtom)
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selected, setSelected] = useState<SocialMediaOption>(
    SOCIAL_MEDIA_OPTIONS[0]
  )
  const { tokenIn, amountIn, tokenOut } = useZap()

  const amount = +amountIn * (tokenIn?.price || 0)

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false)
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [copied, setCopied])

  const handleTrackUsername = useCallback(
    async (key: string) => {
      setSubmitted(true)
      try {
        await fetch(STORAGE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: account,
            amount: `$${amount} in ${tokenIn.symbol} used to mint ${tokenOut.symbol}`,
            [key]: value,
          }),
        })
      } catch (error) {
        setSubmitted(false)
        console.error('Error submitting data:', error)
      }
    },
    [value, account, setSubmitted, amount, tokenIn, tokenOut]
  )

  const onChange = (newValue: string) => {
    if (submitted) return
    setValue(newValue)
  }

  return (
    <div
      className={cn('flex-grow relative min-w-[360px]', className)}
    >
      <Dropdown
        selected={selected}
        options={SOCIAL_MEDIA_OPTIONS}
        onSelectOption={(option: SocialMediaOption) => {
          setValue('')
          setSelected(option)
        }}
      />
      <Input
        className="w-full h-8 text-sm pl-14 pr-[70px]"
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
      {submitted ? (
        <Button
          className="absolute right-1 top-1"
          size="sm"
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
          className="absolute right-1 top-1"
          size="sm"
          disabled={!value || submitted}
          onClick={() => handleTrackUsername(selected.key)}
        >
          Count me in
        </Button>
      )}
    </div>
  )
}

export default SocialMediaInput

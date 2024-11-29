import { Button, Input } from 'components'
import DiscordColorIcon from 'components/icons/DiscordColorIcon'
import TelegramIcon from 'components/icons/TelegramIcon'
import XIcon from 'components/icons/XIcon'
import Popup from 'components/popup'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Mail } from 'lucide-react'
import { walletAtom } from 'state/atoms'
import { Box, BoxProps } from 'theme-ui'
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
  sx,
  ...props
}: {
  selected: SocialMediaOption
  options: SocialMediaOption[]
  onSelectOption: (option: SocialMediaOption) => void
} & BoxProps) => {
  const [isVisible, setVisible] = useState(false)

  return (
    <Popup
      show={isVisible}
      onDismiss={() => setVisible(false)}
      placement="bottom-start"
      content={
        <Box sx={{ borderRadius: '10px', bg: 'background' }}>
          {options.map((option) => (
            <Box
              key={option.key}
              variant="layout.verticalAlign"
              px={2}
              py={1}
              sx={{
                cursor: 'pointer',
                fontSize: 1,
                fontWeight: 500,
                '&:hover': {
                  bg: 'border',
                  borderRadius: '10px',
                },
              }}
              onClick={() => {
                onSelectOption(option)
                setVisible(false)
              }}
            >
              {option.icon}
              <Box pl={2} />
              {option.name}
            </Box>
          ))}
        </Box>
      }
    >
      <Box
        {...props}
        variant="layout.verticalAlign"
        sx={{
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          position: 'absolute',
          left: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          borderRight: '1px solid',
          borderColor: 'border',
          pr: 1,
          pl: '2px',
        }}
        onClick={() => setVisible(!isVisible)}
      >
        {selected.icon}
        <Box pl={1} />
        {isVisible ? (
          <ChevronUp color="currentColor" strokeWidth={1.2} size={16} />
        ) : (
          <ChevronDown color="currentColor" strokeWidth={1.2} size={16} />
        )}
      </Box>
    </Popup>
  )
}

const SocialMediaInput = ({ sx, ...props }: BoxProps) => {
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
    <Box
      sx={{ flexGrow: '1', position: 'relative', minWidth: 360, ...sx }}
      {...props}
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
        variant="smallInput"
        sx={{
          width: '100%',
          pl: '58px',
          pr: '70px',
          fontSize: 1,
        }}
        placeholder={selected.placeholder}
        value={value}
        onChange={onChange}
        disabled={submitted}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleTrackUsername(selected.key)
          }
        }}
      />
      {submitted ? (
        <Button
          sx={{
            position: 'absolute',
            right: '4px',
            top: '4px',
          }}
          small
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
          sx={{
            position: 'absolute',
            right: '4px',
            top: '4px',
          }}
          small
          disabled={!value || submitted}
          onClick={() => handleTrackUsername(selected.key)}
        >
          Count me in
        </Button>
      )}
    </Box>
  )
}

export default SocialMediaInput

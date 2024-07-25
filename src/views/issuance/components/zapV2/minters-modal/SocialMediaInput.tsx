import { Button, Input } from 'components'
import TelegramIcon from 'components/icons/TelegramIcon'
import { useAtomValue } from 'jotai'
import { useCallback, useState } from 'react'
import { walletAtom } from 'state/atoms'
import { Box, BoxProps } from 'theme-ui'

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || ''

const SocialMediaInput = ({ sx, ...props }: BoxProps) => {
  const account = useAtomValue(walletAtom)
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleTrackUsername = useCallback(async () => {
    try {
      const response = await fetch(STORAGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: account,
          telegram: value,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit data')
      }

      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting data:', error)
    }
    setSubmitted(true)
  }, [value, account, setSubmitted])

  const onChange = (newValue: string) => {
    if (submitted) return
    setValue(newValue)
  }

  return (
    <Box
      sx={{ flexGrow: '1', position: 'relative', minWidth: 360, ...sx }}
      {...props}
    >
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            position: 'absolute',
            left: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            borderRight: '1px solid',
            borderColor: 'border',
          }}
        >
          <TelegramIcon style={{ marginRight: '6px' }} />
        </Box>
      </Box>
      <Input
        variant="smallInput"
        sx={{
          width: '100%',
          pl: '38px',
          pr: '70px',
          fontSize: 1,
        }}
        placeholder="Telegram username"
        value={value}
        onChange={onChange}
        disabled={submitted}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleTrackUsername()
          }
        }}
      />
      <Button
        sx={{
          position: 'absolute',
          right: '4px',
          top: '4px',
        }}
        small
        disabled={!value || submitted}
        onClick={handleTrackUsername}
      >
        Count me in
      </Button>
    </Box>
  )
}

export default SocialMediaInput

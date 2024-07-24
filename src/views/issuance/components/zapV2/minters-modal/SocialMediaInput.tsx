import { Button, Input } from 'components'
import TelegramIcon from 'components/icons/TelegramIcon'
import { useState } from 'react'
import { Box, BoxProps } from 'theme-ui'

const SocialMediaInput = ({ sx, ...props }: BoxProps) => {
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleTrackUsername = () => {
    console.log(value)
    setSubmitted(true)
  }

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

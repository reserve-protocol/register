import { keyframes, useTheme } from '@emotion/react'
import { Button } from 'components'
import BankIcon from 'components/icons/BankIcon'
import { ChevronLeft } from 'react-feather'
import { Box, Text } from 'theme-ui'
import SocialMediaInput from './SocialMediaInput'
import { useZap } from '../context/ZapContext'

const slideOut = keyframes`
  from {
    right: 0;
  }
  to {
    right: -395px;
  }
`

const MintersModal = () => {
  const { showEliteProgramModal, setShowEliteProgramModal } = useZap()
  const theme = useTheme()

  if (!showEliteProgramModal) return null

  return (
    <Box
      sx={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        top: 0,
        right: 0,
        width: 400,
        height: '100%',
        bg: 'borderFocused',
        boxShadow: `0 0 0 3px ${
          (theme as any)?.colors?.borderFocused
        }, 0px 10px 38px 6px rgba(0, 0, 0, 0.05)`,
        pl: 5,
        pr: 4,
        py: 4,
        borderTopRightRadius: '8px',
        borderBottomRightRadius: '8px',
        zIndex: -1,
        animation: `${slideOut} 0.5s forwards`,
      }}
    >
      <Box
        variant="layout.verticalAlign"
        color="accentInverted"
        sx={{ gap: 2, justifyContent: 'space-between' }}
      >
        <BankIcon />
        <Button
          small
          sx={{
            background: 'transparent',
            color: 'text',
            border: '1px solid',
            borderColor: 'darkBorder',
          }}
          onClick={() => setShowEliteProgramModal(false)}
        >
          <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
            <ChevronLeft
              height={16}
              width={16}
              style={{ marginLeft: '-4px' }}
            />
            <Text>Dismiss invitation</Text>
          </Box>
        </Button>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          maxWidth: '330px',
          lineHeight: '18px',
        }}
      >
        <Text
          sx={{
            fontSize: '28px',
            lineHeight: '28px',
            fontWeight: 'bold',
            color: 'primary',
          }}
        >
          Whale hello there 👋
        </Text>
        <Text sx={{ fontSize: '14px' }}>
          Congratulations — You’ve unlocked an invitation to Reserve’s elite
          program for large RToken minters. Opt-in participants enjoy access to
        </Text>
        <Box
          as="ul"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            px: 3,
            py: 0,
            fontSize: '14px',
          }}
        >
          <Text as="li">Support from Reserve Institutional</Text>
          <Text as="li">Exclusive alpha</Text>
          <Text as="li">Online and in-person invite-only events</Text>
        </Box>
        <SocialMediaInput />
      </Box>
    </Box>
  )
}

export default MintersModal

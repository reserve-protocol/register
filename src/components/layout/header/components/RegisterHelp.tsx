import { t } from '@lingui/macro'
import Button from '@/components/old/button'
import ThemeColorMode from 'components/dark-mode-toggle/ThemeColorMode'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import Popup from '@/components/old/popup'
import { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { borderRadius } from 'theme'
import { Box, BoxProps, Divider, Text } from 'theme-ui'
import {
  DISCORD_INVITE,
  PROTOCOL_DOCS,
  REGISTER_FEEDBACK,
  RESERVE_FORUM,
} from 'utils/constants'
import CoinbaseSubscribe from './CoinbaseSubscribe'

interface HelpItemProps extends BoxProps {
  title: string
  subtitle: string
  href: string
  onClose(): void
}

const HelpItem = ({
  title,
  subtitle,
  href,
  onClose,
  ...props
}: HelpItemProps) => (
  <Box
    {...props}
    p={2}
    role="button"
    sx={{
      border: '1px solid',
      borderColor: 'border',
      borderRadius: borderRadius.inputs,
      cursor: 'pointer',
      userSelect: 'none',
      ':hover': {
        backgroundColor: 'inputBackground',
      },
    }}
    onClick={() => {
      window.open(href, '_blank')
      onClose()
    }}
  >
    <Box variant="layout.verticalAlign">
      <Text variant="strong" mr={2}>
        {title}
      </Text>
      <ExternalArrowIcon />
    </Box>
    <Text variant="legend" as="p" sx={{ fontSize: 1 }}>
      {subtitle}
    </Text>
  </Box>
)

const HelpContent = ({ onClose }: { onClose(): void }) => {
  const items = [
    {
      title: t`Register Feedback`,
      subtitle: t`File new issues or view & upvote existing feedback.`,
      href: REGISTER_FEEDBACK,
    },
    {
      title: t`Protocol Docs`,
      subtitle: t`Understand the Reserve Protocol.`,
      href: PROTOCOL_DOCS,
    },
    {
      title: t`Reserve Forum`,
      subtitle: t`Discussions of ideas and suggestion that the community has on improving the Reserve Ecosystem`,
      href: RESERVE_FORUM,
    },
    {
      title: t`Reserve Discord`,
      subtitle: t`Can’t find what you’re looking for elsewhere or want to join the conversation?`,
      href: DISCORD_INVITE,
    },
    {
      title: t`Reserve Bridge`,
      subtitle: t`Transfer RTokens between Ethereum, Base, and Arbitrum`,
      href: 'https://app.reserve.org/bridge',
    },
  ]

  return (
    <Box sx={{}}>
      <Box
        p={2}
        sx={{
          '>div': {
            marginBottom: 2,
          },
          'div:last-child': {
            marginBottom: 0,
          },
        }}
      >
        {items.map((item, i) => (
          <HelpItem key={item.href} onClose={onClose} {...item} />
        ))}
      </Box>
      <Box sx={{ display: ['block', 'none'] }}>
        <Divider mt={3} mb={0} />
        <Box p={3} variant="layout.verticalAlign">
          <CoinbaseSubscribe />
          <ThemeColorMode ml="auto" />
        </Box>
      </Box>
    </Box>
  )
}

const RegisterHelp = () => {
  const [isVisible, setVisible] = useState(false)

  return (
    <Popup
      show={isVisible}
      onDismiss={() => setVisible(false)}
      content={<HelpContent onClose={() => setVisible(false)} />}
      containerProps={{
        sx: {
          border: '3px solid',
          borderColor: 'borderFocused',
          maxWidth: 270,
          backgroundColor: 'backgroundNested',
        },
      }}
    >
      <Button
        variant="hover"
        small
        py={1}
        mr={[0, 2]}
        onClick={() => setVisible(!isVisible)}
        px={{ borderRadius: borderRadius.inner }}
      >
        <Box variant="layout.verticalAlign">
          <MoreHorizontal size="20" />
        </Box>
      </Button>
    </Popup>
  )
}

export default RegisterHelp

import { t } from '@lingui/macro'
import Button from 'components/button'
import ChainSelector from 'components/chain-selector/ChainSelector'
import ThemeColorMode from 'components/dark-mode-toggle/ThemeColorMode'
import AsteriskIcon from 'components/icons/AsteriskIcon'
import CustomHelpIcon from 'components/icons/CustomHelpIcon'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import Popup from 'components/popup'
import { useState } from 'react'
import { MoreHorizontal } from 'react-feather'
import { borderRadius } from 'theme'
import { Box, BoxProps, Divider, Text } from 'theme-ui'
import {
  DISCORD_INVITE,
  PROTOCOL_DOCS,
  REGISTER_FEEDBACK,
} from 'utils/constants'

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
    p={3}
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
      title: t`Reserve Discord`,
      subtitle: t`Can’t find what you’re looking for elsewhere or want to join the conversation?`,
      href: DISCORD_INVITE,
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
          <ChainSelector />
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
        py={2}
        mr={[1, 0]}
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

import styled from '@emotion/styled'
import { t, Trans } from '@lingui/macro'
import { Button } from 'components'
import RTokenLight from 'components/icons/RTokenLight'
import { ArrowRight, Info, Plus } from 'react-feather'
import { Box, Flex, Text, BoxProps } from 'theme-ui'

const InfoContainer = styled(Flex)`
  border-radius: 25px;
  border-color: var(--theme-ui-colors-border) !important;
  border-top: 2px solid;
  border-left: 2px solid;
  border-right: 2px solid;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  padding: 20px;
  padding-bottom: 0;
  align-items: center;
`

interface InfoBoxProps extends BoxProps {
  title: string
  subtitle: string
}

const InfoBox = ({ title, subtitle, ...props }: InfoBoxProps) => (
  <Box sx={{ textAlign: 'center' }} {...props}>
    <Text sx={{ fontSize: 3, fontWeight: 500, display: 'block' }}>{title}</Text>
    <Text variant="legend">{subtitle}</Text>
  </Box>
)

const iconProps = {
  size: '16px',
  color: 'var(--theme-ui-colors-lightText)',
  style: { marginLeft: 20, marginRight: 20 },
}

const DeployIntro = () => (
  <Flex
    sx={{
      position: 'absolute',
      top: 5,
      bottom: 5,
      left: 5,
      right: 5,
      flexDirection: 'column',
      alignItems: 'center',
      borderRadius: 24,
      backgroundColor: 'contentBackground',
      justifyContent: 'center',
    }}
  >
    <RTokenLight />
    <Text mt={2} sx={{ fontSize: 3 }}>
      <Trans>Deploy process</Trans>
    </Text>
    <Box
      mt={4}
      sx={(theme: any) => ({
        borderRight: `2px solid ${theme.colors.border}`,
        height: '10px',
        width: '1px',
      })}
    />
    <InfoContainer>
      <InfoBox
        title={t`Define parameters`}
        subtitle={t`“Info”, backing manager, etc`}
      />
      <Plus {...iconProps} />
      <InfoBox
        title={t`Define collateral`}
        subtitle={t`Primary basket, emergency collateral, etc`}
      />
      <ArrowRight {...iconProps} />
      <InfoBox
        title={t`Deploy RToken`}
        subtitle={t`Large >$1500 transaction `}
      />
      <ArrowRight {...iconProps} />
      <InfoBox
        title={t`Governance unpause`}
        subtitle={t`Governance unpauses the contract`}
      />
    </InfoContainer>
    <Button mt={5} px={4}>
      <Trans>Continue to RToken deployer</Trans>
    </Button>
    <Text
      mt={6}
      mb={2}
      sx={{
        display: 'block',
        color: 'transparent',
        textShadow: '0 0 0 #D9D9D9',
        fontSize: 5,
      }}
    >
      👋
    </Text>
    <Box sx={{ maxWidth: 600 }}>
      <InfoBox
        title={t`Who is this for?`}
        subtitle={t`The Register RToken Deployer requires a good understanding of the Reserve Protocol. The interface itself doesn’t require deep technical knowledge, but it’s not for beginners. Talk to the Reserve team or read our docs to learn more.`}
      />
    </Box>
    <Flex mt={4}>
      <Button variant="muted" px={4} mr={3}>
        <Trans>Community discord</Trans>
      </Button>
      <Button variant="muted" px={4}>
        <Trans>Docs</Trans>
      </Button>
    </Flex>
  </Flex>
)

export default DeployIntro

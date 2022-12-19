import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { Circle } from 'react-feather'
import { Box, BoxProps, Divider as _Divider, Flex, Image, Text } from 'theme-ui'
import ListingInfo from './ListingInfo'

const Divider = () => (
  <_Divider sx={{ borderColor: 'darkBorder' }} my={3} mx={-4} />
)

interface ItemProps extends BoxProps {
  icon?: string
  title: string
  subtitle: string
  value?: string
  action?: string
  actionVariant?: string
  onAction?(): void
}

// TODO: Better name? no idea
const Item = ({
  icon,
  title,
  subtitle,
  value,
  action,
  actionVariant = 'muted',
  onAction,
  ...props
}: ItemProps) => {
  return (
    <Box variant="layout.verticalAlign" {...props}>
      {!!icon ? (
        <Image src={`/svgs/${icon}.svg`} height={14} width={14} />
      ) : (
        <Box
          mx={1}
          sx={{
            height: '6px',
            width: '6px',
            borderRadius: '100%',
            backgroundColor: 'text',
          }}
        />
      )}
      <Box ml={3}>
        <Text>{title}</Text>
        <Box sx={{ fontSize: 1 }}>
          <Text variant="legend">{subtitle}</Text>
          {!!value && <Text ml={1}>{value}</Text>}
        </Box>
      </Box>
      {!!action && (
        <SmallButton ml="auto" variant={actionVariant} onClick={onAction}>
          {action}
        </SmallButton>
      )}
    </Box>
  )
}

const About = () => (
  <Flex
    sx={{
      alignItems: 'center',
      flexDirection: 'column',
      textAlign: 'center',
    }}
  >
    <Image height={32} width={32} src="/svgs/deploytx.svg" />
    <Text variant="title" sx={{ fontSize: 4 }} mt={2}>
      <Trans>RToken Controls</Trans>
    </Text>
    <Text variant="legend" as="p" mt={2} sx={{ textAlign: 'center' }}>
      All possible governance related actions are listed here, but disabled if
      you’re not connected with the address with the right permissions.
    </Text>
  </Flex>
)

const RTokenManagement = () => {
  const handlePause = () => {}

  const handleFreeze = () => {}

  const handleLongFreeze = () => {}
  const handleProposal = () => {}

  const handleEdit = () => {}

  return (
    <Box variant="layout.sticky" sx={{ height: '100%', overflowY: 'auto' }}>
      <Box variant="layout.borderBox" mb={4}>
        <About />
        <Divider />
        <Item
          title="RToken is not paused"
          subtitle={t`Current status:`}
          value="Unpaused"
          icon="danger"
          mb={3}
        />
        <Item
          title="RToken pauser"
          subtitle={t`Role held by:`}
          value="0xfb...0344"
          action={t`Pause`}
          onAction={handlePause}
          actionVariant="danger"
        />
        <Divider />
        <Item
          title="RToken is not paused"
          subtitle={t`Current status:`}
          value="Unpaused"
          mb={3}
        />
        <Item
          title="Short Freeze"
          subtitle={t`Role held by:`}
          value="0xfb...0344"
          action={t`Freeze`}
          onAction={handleFreeze}
          actionVariant="danger"
          mb={3}
        />
        <Item
          title="Long Freeze"
          subtitle={t`Role held by:`}
          value="0xfb...0344"
          action={t`Long Freeze`}
          onAction={handleLongFreeze}
          actionVariant="danger"
        />
        <Divider />
        <Item
          title="Governance proposals"
          subtitle={t`Role held by`}
          value="All stakers"
          action={t`Create proposal`}
          onAction={handleProposal}
        />
        <Divider />
        <Item
          title="Make changes to RToken"
          subtitle={t`Available when no governance set up:`}
          action={t`Edit`}
          onAction={handleEdit}
        />
      </Box>
      <ListingInfo />
    </Box>
  )
}

export default RTokenManagement

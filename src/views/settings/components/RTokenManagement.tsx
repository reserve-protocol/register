import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { accountRoleAtom, rTokenStatusAtom } from 'state/atoms'
import { Box, BoxProps, Divider as _Divider, Flex, Image, Text } from 'theme-ui'
import { RTOKEN_STATUS } from 'utils/constants'

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
        <Image src={`/svgs/${icon}.svg`} height={16} width={16} />
      ) : (
        <Box
          mx={1}
          sx={{
            height: '4px',
            width: '4px',
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

// TODO: Fetch roles from theGraph
// TODO: detect if it is alexios governance
const RTokenManagement = () => {
  const accountRole = useAtomValue(accountRoleAtom)
  const rtokenStatus = useAtomValue(rTokenStatusAtom)
  const [pauseActionLabel, freezeActionLabel, longFreezeActionLabel] = useMemo(
    () => [
      rtokenStatus === RTOKEN_STATUS.PAUSED ? t`Unpause` : t`Pause`,
      rtokenStatus === RTOKEN_STATUS.FROZEN ? t`Unfreeze` : t`Freeze`,
      rtokenStatus === RTOKEN_STATUS.FROZEN ? t`Unfreeze` : t`Long Freeze`,
    ],
    [rtokenStatus]
  )

  // const handleUnpause = () => {
  //   if (rToken?.main) {
  //     const txId = uuid()
  //     setUnpausing(txId)
  //     addTransaction([
  //       {
  //         id: txId,
  //         description: t`Unpause ${rToken?.symbol}`,
  //         status: TRANSACTION_STATUS.PENDING,
  //         value: '0',
  //         call: {
  //           abi: 'main',
  //           address: rToken?.main || '',
  //           method: 'unpause',
  //           args: [],
  //         },
  //       },
  //     ])
  //   }
  // }

  //   <LoadingButton
  //   loading={!!unpausing}
  //   text={t`Unpause`}
  //   onClick={handleUnpause}
  //   variant={!unpausing ? 'primary' : 'accent'}
  //   sx={{ ...smallButton }}
  //   ml="auto"
  // />

  const handlePause = () => {}

  const handleFreeze = () => {}

  const handleLongFreeze = () => {}
  const handleProposal = () => {}

  const handleEdit = () => {}

  return (
    <Box variant="layout.sticky" sx={{ height: '100%', overflowY: 'auto' }}>
      <Box variant="layout.borderBox" mb={4}>
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
          action={
            accountRole.pauser || accountRole.owner ? pauseActionLabel : ''
          }
          onAction={handlePause}
          actionVariant="danger"
        />
        <Divider />
        <Item
          title="RToken is not frozen"
          subtitle={t`Current status:`}
          value="Active"
          mb={3}
        />
        <Item
          title="Short Freeze"
          subtitle={t`Role held by:`}
          value="0xfb...0344"
          action={
            accountRole.shortFreezer || accountRole.owner
              ? freezeActionLabel
              : ''
          }
          onAction={handleFreeze}
          actionVariant="danger"
          mb={3}
        />
        <Item
          title="Long Freeze"
          subtitle={t`Role held by:`}
          value="0xfb...0344"
          action={
            accountRole.longFreezer || accountRole.owner
              ? longFreezeActionLabel
              : ''
          }
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
        {accountRole.owner && (
          <>
            <Divider />
            <Item
              title="Make changes to RToken"
              subtitle={t`Available when no governance set up:`}
              action={t`Edit`}
              onAction={handleEdit}
            />
          </>
        )}
      </Box>
    </Box>
  )
}

export default RTokenManagement

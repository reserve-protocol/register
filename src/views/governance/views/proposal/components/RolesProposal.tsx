import { Trans } from '@lingui/macro'
import { Input } from 'components'
import { SmallButton } from 'components/button'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { rTokenManagersAtom } from 'state/atoms'
import { Box, BoxProps, Card, Divider, Text } from 'theme-ui'
import { isAddress } from 'utils'
import { proposedRolesAtom } from '../atoms'

type RoleKey = 'owners' | 'pausers' | 'freezers' | 'longFreezers'

interface RoleEditionProps extends BoxProps {
  roleKey: RoleKey
  title: string
}

const NewRoleAddress = ({
  onSave,
  onDismiss,
  addresses,
}: {
  onSave(value: string): void
  onDismiss(): void
  addresses: string[]
}) => {
  const [address, setAddress] = useState('')
  const isValid = !!isAddress(address)
  const isExisting =
    isValid &&
    addresses.findIndex((a) => a.toLowerCase() === address.toLowerCase()) !== -1

  return (
    <Box>
      <Input my={3} value={address} onChange={setAddress} />
      {((address && !isValid) || isExisting) && (
        <Text
          variant="error"
          mt={-2}
          mb={3}
          ml={3}
          sx={{ fontSize: 1, display: 'block' }}
        >
          {isExisting ? (
            <Trans>This address already holds this role</Trans>
          ) : (
            <Trans>Invalid address</Trans>
          )}
        </Text>
      )}
      <SmallButton
        disabled={!isValid || isExisting}
        onClick={() => onSave(address)}
        ml={3}
      >
        <Trans>Save</Trans>
      </SmallButton>
      <SmallButton onClick={() => onDismiss()} variant="muted" ml={3}>
        <Trans>Dismiss</Trans>
      </SmallButton>
    </Box>
  )
}

const RoleEdition = ({ roleKey, title, ...props }: RoleEditionProps) => {
  const [rTokenRoles, setRTokenRoles] = useAtom(rTokenManagersAtom)
  const [roles, setRoles] = useAtom(proposedRolesAtom)
  const [isCreating, setCreate] = useState(false)

  const handleAdd = (address: string) => {
    setCreate(false)
  }

  return (
    <Box {...props}>
      <Text variant="title">{title}</Text>
      {!roles[roleKey].length && (
        <Text
          variant="legend"
          sx={{ fontStyle: 'italic', display: 'block' }}
          mt={3}
          ml={3}
        >
          No holders for this role...
        </Text>
      )}
      {roles[roleKey].map((addr) => (
        <Box variant="layout.verticalAlign" sx={{ flexWrap: 'wrap' }} mt={3}>
          <Box mr={2} variant="layout.verticalAlign">
            <Box
              ml={1}
              mr={3}
              sx={{
                height: '4px',
                width: '4px',
                borderRadius: '100%',
                backgroundColor: 'text',
              }}
            />
            <Box>
              <Text sx={{ fontSize: 1, display: 'block' }} variant="legend">
                <Trans>Current holder</Trans>
              </Text>
              <Text sx={{ wordBreak: 'break-word' }}>{addr}</Text>
            </Box>
          </Box>

          <SmallButton
            ml="auto"
            variant="danger"
            sx={{ backgroundColor: 'inputBorder' }}
          >
            <Trans>Remove</Trans>
          </SmallButton>
        </Box>
      ))}
      {isCreating ? (
        <NewRoleAddress
          onSave={handleAdd}
          onDismiss={() => setCreate(false)}
          addresses={roles[roleKey]}
        />
      ) : (
        <SmallButton
          ml={3}
          mt={4}
          onClick={() => setCreate(true)}
          variant="muted"
        >
          Add new {title.toLowerCase()}
        </SmallButton>
      )}
    </Box>
  )
}

// TODO: Governance proposal veto
const roleMap: {
  roleKey: RoleKey
  title: string
}[] = [
  { roleKey: 'owners', title: 'Owners' },
  { roleKey: 'pausers', title: 'Pausers' },
  { roleKey: 'freezers', title: 'Freezers' },
  { roleKey: 'longFreezers', title: 'Long Freezers' },
]

const RolesProposal = (props: BoxProps) => {
  const rTokenRoles = useAtomValue(rTokenManagersAtom)
  const setProposedRoles = useSetAtom(proposedRolesAtom)

  useEffect(() => {
    setProposedRoles({ ...rTokenRoles })
  }, [JSON.stringify(rTokenRoles)])

  return (
    <Card {...props} p={4}>
      <Text variant="sectionTitle">
        <Trans>Governance roles</Trans>
      </Text>
      <Divider my={4} mx={-4} />
      {roleMap.map((value, index) => (
        <Box>
          {!!index && <Divider mb={3} mt={4} mx={-4} />}
          <RoleEdition {...value} key={value.roleKey} />
        </Box>
      ))}
    </Card>
  )
}

export default RolesProposal

import { proposedRolesAtom } from './../atoms'
import { useAtomValue } from 'jotai'
import { rTokenGovernanceAtom, rTokenManagersAtom } from 'state/atoms'
import { RoleKey } from 'types'
import { useMemo } from 'react'

export interface RoleChange {
  role: RoleKey
  address: string
  isNew: boolean
}

const useRoleChanges = () => {
  const currentRoles = useAtomValue(rTokenManagersAtom)
  const { guardians: currentGuardians = [] } =
    useAtomValue(rTokenGovernanceAtom)
  const proposedRoles = useAtomValue(proposedRolesAtom)

  return useMemo(() => {
    const changes: RoleChange[] = []

    for (const role of Object.keys(proposedRoles) as RoleKey[]) {
      const current = new Set(
        role === 'guardians' ? currentGuardians : currentRoles[role]
      )
      const proposed = new Set(proposedRoles[role])
      const allAddresses = Array.from(
        new Set([...Array.from(current), ...Array.from(proposed)])
      )

      for (const address of allAddresses as string[]) {
        if (!current.has(address) || !proposed.has(address)) {
          changes.push({
            role,
            address,
            isNew: proposed.has(address),
          })
        }
      }
    }

    return changes
  }, [proposedRoles])
}

export default useRoleChanges

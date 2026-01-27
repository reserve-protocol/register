import { Trans } from '@lingui/macro'
import GoTo from '@/components/go-to'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Card } from '@/components/ui/card'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { chainIdAtom } from '@/state/atoms'
import { shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'

const RoleList = ({ roles }: { roles: string[] }) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <Card className="p-3">
      {roles.map((address, index) => (
        <div className={`flex items-center ${index ? 'mt-2' : ''}`} key={address}>
          <span className="mr-1">{shortenAddress(address)}</span>
          <GoTo
            className="ml-auto"
            href={getExplorerLink(address, chainId, ExplorerDataType.ADDRESS)}
          />
        </div>
      ))}
    </Card>
  )
}

const RolesView = ({ roles }: { roles: string[] }) => {
  const [isOpen, setIsOpen] = useState(false)
  const chainId = useAtomValue(chainIdAtom)

  if (roles.length <= 1) {
    return (
      <div className="flex items-center">
        <span className="text-xs">
          {roles[0] ? shortenAddress(roles[0]) : 'None'}
        </span>
        {!!roles[0] && (
          <GoTo
            className="ml-1"
            href={getExplorerLink(roles[0], chainId, ExplorerDataType.ADDRESS)}
          />
        )}
      </div>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <span
          className="underline cursor-pointer hover:text-primary"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Trans>View</Trans>
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        <RoleList roles={roles} />
      </PopoverContent>
    </Popover>
  )
}

export default RolesView

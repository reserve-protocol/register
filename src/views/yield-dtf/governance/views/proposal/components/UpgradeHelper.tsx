import { Button } from '@/components/ui/button'
import { useSetAtom } from 'jotai'
import { useState } from 'react'
import { isAssistedUpgradeAtom } from '../atoms'
import { useNavigate } from 'react-router-dom'
import useRToken from 'hooks/useRToken'
import { ROUTES } from 'utils/constants'

const UpgradeHelper = ({ className }: { className?: string }) => {
  const navigate = useNavigate()
  const rToken = useRToken()

  const [show, setShow] = useState<boolean>(true)
  const setAssistedUpgrade = useSetAtom(isAssistedUpgradeAtom)

  if (!show) {
    return null
  }

  const handleDismiss = () => {
    setShow(false)
  }

  return (
    <div
      className={`flex items-center flex-wrap bg-blue-50 border border-blue-500 rounded-lg px-4 py-2 ${className ?? ''}`}
    >
      <div>
        <div className="font-bold">
          <span className="text-blue-600">Upgrade to the 3.0.0 Release</span>{' '}
          <span>of the Reserve Protocol</span>
        </div>
        <p>
          To harness the powerful new upgrades on {rToken?.symbol} (announcement{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://blog.reserve.org/reserve-protocol-v1-3-0-0-release-9c539334f771"
            className="text-primary hover:underline"
          >
            here
          </a>
          ) , consider using the upgrade helper.
          <br />
          <br />
          For a more in-depth explanation of what this proposal entails, see
          this{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://www.loom.com/share/8c47272036ce4e2d98b34133e67b0637"
            className="text-primary hover:underline"
          >
            video
          </a>
          .
        </p>
      </div>
      <div className="ml-0 lg:ml-auto mt-4">
        <Button size="sm" variant="outline" className="border-2" onClick={handleDismiss}>
          Dismiss
        </Button>
        <Button
          className="ml-3 bg-[#2150A9] whitespace-nowrap"
          size="sm"
          onClick={() => {
            setAssistedUpgrade(true)
            navigate(`${ROUTES.GOVERNANCE_PROPOSAL}?token=${rToken?.address}`)
          }}
        >
          Upgrade
        </Button>
      </div>{' '}
    </div>
  )
}

export default UpgradeHelper

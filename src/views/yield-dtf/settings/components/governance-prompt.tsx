import { Trans } from '@lingui/macro'
import { AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/utils/constants'

const GovernancePrompt = () => {
  const navigate = useNavigate()

  return (
    <div className="sticky top-0">
      <div className="border rounded-3xl p-4 mb-4">
        <div className="pt-2 flex items-center flex-col text-center">
          <div className="text-warning flex items-center flex-col">
            <AlertCircle />
            <span className="text-legend mt-2 text-warning">
              <Trans>Required setup:</Trans>
            </span>
          </div>
          <h2 className="text-xl font-semibold mt-1">
            <Trans>Setup Governance</Trans>
          </h2>
          <p className="text-legend mt-2 text-center">
            <Trans>
              Please complete the required governance configuration to complete
              deployment.
            </Trans>
          </p>
          <Button
            onClick={() => navigate(`../${ROUTES.GOVERNANCE_SETUP}`)}
            className="mt-4 w-full"
          >
            <Trans>Begin governance setup</Trans>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default GovernancePrompt

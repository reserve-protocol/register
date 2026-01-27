import { Trans } from '@lingui/macro'
import TokenLogo from 'components/icons/TokenLogo'
import Spinner from '@/components/ui/spinner'
import { Check } from 'lucide-react'
import { Allowance } from 'types'
import { Hex } from 'viem'

interface IApprovalStatus {
  allowance: Allowance
  hash: Hex | undefined
  success: boolean
}

const ApprovalStatus = ({ allowance, hash, success }: IApprovalStatus) => {
  if (success) {
    return (
      <div className="flex items-center text-muted-foreground mb-4">
        <Check size={16} />
        <span className="ml-2">{allowance.symbol} Approved</span>
      </div>
    )
  }

  return (
    <div className="flex items-center mb-4">
      <TokenLogo width={24} symbol={allowance.symbol} />
      <div className="ml-4">
        <span className="block font-bold">
          <Trans>Approve in wallet</Trans>
        </span>
        <span className="text-legend">
          {!hash && 'Proceed in wallet'}
          {hash && 'Confirming transaction'}
        </span>
      </div>
      <Spinner className="ml-auto" size={16} />
    </div>
  )
}

export default ApprovalStatus

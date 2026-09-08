import { Trans } from '@lingui/react/macro'

import { Button } from '@/components/button'
import { Link } from '@/components/design-system-v1/link'
import { cn } from '@/lib/utils'
import { getFolioRoute } from '@/utils'
import { CMC20_ADDRESS } from '@/utils/addresses'
import { ROUTES } from '@/utils/constants'

import type {
  AutomatedIssuanceChain,
  AutomatedIssuanceOperation,
} from './transaction-composition-staged-fixtures'

export const AutomatedIssuanceManualLink = ({
  chain,
  className,
  operation,
  presentation = 'link',
}: {
  chain: AutomatedIssuanceChain
  className?: string
  operation: AutomatedIssuanceOperation
  presentation?: 'button' | 'link'
}) => {
  const href = getFolioRoute(
    CMC20_ADDRESS[chain],
    chain,
    `${ROUTES.ISSUANCE}/manual`
  )

  if (presentation === 'button') {
    return (
      <Button
        asChild
        className={cn('w-full', className)}
        tone="secondary"
      >
        <a href={href}>
          {operation === 'redeem' ? (
            <Trans>Redeem directly to basket assets</Trans>
          ) : (
            <Trans>Mint directly with basket assets</Trans>
          )}
        </a>
      </Button>
    )
  }

  return (
    <Link
      className={cn('inline-flex', className)}
      href={href}
      treatment="standalone"
    >
      {operation === 'redeem' ? (
        <Trans>Switch to manual redeeming</Trans>
      ) : (
        <Trans>Switch to manual minting</Trans>
      )}
    </Link>
  )
}

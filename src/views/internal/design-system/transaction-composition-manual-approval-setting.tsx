import { Trans, useLingui } from '@lingui/react/macro'
import type { ReactNode } from 'react'
import { Checkbox } from '@/components/checkbox'
import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
import { v1Typography } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import {
  manualIsBusy,
  type ManualSession,
} from './transaction-composition-manual-lifecycle'

export const ManualApprovalSetting = ({
  session,
  onChange,
  children,
}: {
  session: ManualSession
  onChange: (unlimited: boolean) => void
  children?: ReactNode
}) => {
  const { t } = useLingui()
  return (
    <div
      className="flex flex-col gap-4"
      data-testid="manual-approval-setting-region"
    >
      <div
        data-testid="manual-unlimited-setting"
        className="mx-4 flex items-center gap-4"
      >
        <label
          className={cn(
            'flex min-w-0 flex-1 cursor-pointer items-center gap-2',
            v1Typography.label
          )}
        >
          <Checkbox
            checked={session.unlimited}
            disabled={manualIsBusy(session)}
            onCheckedChange={onChange}
            aria-label="Approve unlimited token amounts"
          />
          <span>Approve unlimited token amounts</span>
        </label>
        <HelpTooltip
          accessibleLabel={t`About unlimited token approvals`}
          content={
            <Trans>
              When selected, approvals set the token spending allowance to its
              maximum. This does not change the amount you mint.
            </Trans>
          }
        />
      </div>
      {children}
    </div>
  )
}

import { t, Trans } from '@lingui/macro'
import { Field, FormField } from 'components/field'
import { useFormContext } from 'react-hook-form'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { addressPattern } from 'utils'
import GovernanceParameters from './GovernanceParameters'
import DocsLink from '@/components/utils/docs-link'
import RolesSetup from './RoleSetup'
import { PROTOCOL_DOCS } from '@/utils/constants'

interface GovernanceSetupProps {
  disabled?: boolean
  className?: string
}

const GovernanceSetup = ({
  disabled = false,
  className,
}: GovernanceSetupProps) => {
  const { register, watch, setValue } = useFormContext()
  const defaultGovernance = watch('defaultGovernance')
  const unfreeze = watch('unfreeze')
  const unpause = watch('unpause')

  return (
    <Card className={`p-4 bg-secondary ${className || ''}`}>
      <div className="flex items-center">
        <span className="text-xl font-medium">
          <Trans>Governance</Trans>
        </span>
        <DocsLink
          link={`${PROTOCOL_DOCS}yield_dtfs/deployment_guide/ui_walkthrough/#step-5-configure-governance`}
        />
      </div>
      <Separator className="my-4 -mx-4 border-muted" />
      <div className="mb-5">
        <div>
          <span className="text-xl font-medium block mb-2">
            <Trans>Use the Alexios governor format?</Trans>
          </span>
          <span className="text-legend">
            <Trans>
              Choose between our Alexios Governor and anything between
              one-person rule to arbitrary DAO structure under your defined
              Ethereum address.
            </Trans>
          </span>
        </div>
        <div className="ml-auto mt-3">
          <Switch
            checked={defaultGovernance}
            onCheckedChange={(checked) => setValue('defaultGovernance', checked)}
          />
        </div>
      </div>
      <Separator className="my-4 -mx-4 border-muted" />
      <div className="flex items-center mb-4">
        <span className="text-xl font-medium">
          <Trans>Roles</Trans>
        </span>
        <DocsLink
          link={`${PROTOCOL_DOCS}yield_dtfs/smart_contracts/#governance-roles`}
        />
      </div>
      {!defaultGovernance ? (
        <FormField
          label={t`Owner address`}
          placeholder={t`Input the owner ethereum address`}
          help={t`The top level decision maker, typically a decentralized governance smart contract, responsible for setting or updating all RToken parameter values, RToken baskets, etc. - The RToken OWNER has the power to:
          grant and revoke roles to any Ethereum account
          pause and unpause the system
          freeze and unfreeze the system
          set governance parameters
          upgrade system contracts`}
          mb={3}
          name="owner"
          options={{
            required: true,
            pattern: {
              value: addressPattern,
              message: t`Invalid ethereum address`,
            },
          }}
        />
      ) : (
        <FormField
          label={t`Guardian address`}
          placeholder={t`Input the guardian ethereum address`}
          help={t`The guardian has the ability to reject proposals even if they pass. Should be assigned to a multisig or EOA that can be trusted to act as a backstop. It is acceptable if it is relatively slow to act. Only one guardian address should be defined.`}
          mb={3}
          name="guardian"
          options={{
            disabled,
            required: true,
            pattern: {
              value: addressPattern,
              message: t`Invalid ethereum address`,
            },
          }}
        />
      )}
      <RolesSetup />
      {defaultGovernance && (
        <>
          <Separator className="my-4 -mx-4 border-muted" />
          <GovernanceParameters />
        </>
      )}
      <Separator className="my-4 -mx-4 border-muted" />
      <div className="flex items-center mb-4">
        <span className="text-xl font-medium">
          <Trans>Initial RToken state after deployment</Trans>
        </span>
        <DocsLink
          link={`${PROTOCOL_DOCS}yield_dtfs/deployment_guide/ui_walkthrough/#step-6-configure-initial-state`}
        />
      </div>
      <Field label={t`Pause status`}>
        <Select
          value={unpause?.toString() || '0'}
          onValueChange={(value) => setValue('unpause', Number(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">
              <Trans>RToken will be left in pause state</Trans>
            </SelectItem>
            <SelectItem value="1">
              <Trans>RToken will be fully functional</Trans>
            </SelectItem>
          </SelectContent>
        </Select>
        {unfreeze === '0' && (
          <span className="text-warning block text-xs mt-1 ml-1">
            <Trans>
              Only the guardian address or governance will be able to unpause
            </Trans>
          </span>
        )}
      </Field>
    </Card>
  )
}

export default GovernanceSetup

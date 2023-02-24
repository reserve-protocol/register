import { t, Trans } from '@lingui/macro'
import { Field, FormField } from 'components/field'
import { useFormContext } from 'react-hook-form'
import {
  Box,
  BoxProps,
  Card,
  Flex,
  Select,
  Switch,
  Text,
  Image,
  Divider,
} from 'theme-ui'
import { addressPattern } from 'utils'
import GovernanceParameters from './GovernanceParameters'
import DocsLink from 'components/docs-link/DocsLink'

interface Props extends BoxProps {
  disabled?: boolean
}

const GovernanceSetup = ({ disabled = false, ...props }: Props) => {
  const { register, watch } = useFormContext()
  const defaultGovernance = watch('defaultGovernance')
  const unfreeze = watch('unfreeze')

  return (
    <Card p={4} {...props}>
      <Box variant="layout.verticalAlign">
        <Text variant="sectionTitle">
          <Trans>Governance</Trans>
        </Text>
        <DocsLink link="https://reserve.org/protocol/reserve_rights_rsr/#reserve-rights-governance" />
      </Box>
      <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
      <Box mb={5}>
        <Box>
          <Text variant="title" sx={{ display: 'block' }} mb={2}>
            <Trans>Use the Alexios governor format?</Trans>
          </Text>
          <Text variant="legend">
            <Trans>
              Choose between our Alexios Governor and anything between one man
              rule to arbitrary DAO structure under your defined Ethereum
              address.
            </Trans>
          </Text>
        </Box>
        <Box ml="auto" mt={3}>
          <Switch
            defaultChecked={defaultGovernance}
            {...register('defaultGovernance')}
          />
        </Box>
      </Box>
      <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
      <Flex variant="layout.verticalAlign" mb={4}>
        <Text variant="title">
          <Trans>Permissions</Trans>
        </Text>
        <DocsLink link="https://reserve.org/protocol/system_states_roles/" />
      </Flex>
      {!defaultGovernance && (
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
      )}
      <FormField
        label={t`Guardian address`}
        placeholder={t`Input the guardian ethereum address`}
        help={t`The Guardian has the permissions of the Pauser, the ability to invoke a LONG_FREEZE, and the ability to cancel any active proposals prior to execution.`}
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
      <FormField
        label={t`Pauser address`}
        placeholder={t`Input pauser ethereum address`}
        help={t`The Pauser can PAUSE and SHORT_FREEZE.
        When an RToken’s system is paused, all interactions besides redemption, issuance cancellation, ERC20 functions and staking of RSR are disabled.
        When an RToken’s system is frozen, all interactions besides ERC20 functions and staking of RSR are disabled.`}
        mb={4}
        name="pauser"
        options={{
          disabled,
          required: true,
          pattern: {
            value: addressPattern,
            message: t`Invalid ethereum address`,
          },
        }}
      />
      {defaultGovernance && (
        <>
          <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
          <GovernanceParameters />
        </>
      )}
      <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
      <Flex mb={4} sx={{ alignItems: 'center' }}>
        <Text variant="title">
          <Trans>Initial RToken state after deployment</Trans>
        </Text>
        <DocsLink link="https://reserve.org/protocol/reserve_rights_rsr/#reserve-governor-alexios" />
      </Flex>
      <Field label={t`Pause status`}>
        <Select {...register('unpause')}>
          <option value={0}>
            <Trans>RToken will be left in pause state</Trans>
          </option>
          <option value={1}>
            <Trans>RToken will be fully functional</Trans>
          </option>
        </Select>
        {unfreeze === '0' && (
          <Text
            sx={{ color: 'warning', display: 'block', fontSize: 1 }}
            mt={1}
            ml={1}
          >
            <Trans>
              Only the guardian address or governance will be able to unpause
            </Trans>
          </Text>
        )}
      </Field>
    </Card>
  )
}

export default GovernanceSetup

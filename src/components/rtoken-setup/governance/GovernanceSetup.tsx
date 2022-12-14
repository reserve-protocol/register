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

const GovernanceSetup = (props: BoxProps) => {
  const { register, watch } = useFormContext()
  const defaultGovernance = watch('defaultGovernance')
  const unfreeze = watch('unfreeze')

  return (
    <Card p={4} {...props}>
      <Text variant="title">
        <Trans>Governance</Trans>
      </Text>
      <Divider my={4} mx={-4} />
      <Image src="/svgs/governance.svg" />
      <Flex mb={5} variant="layout.verticalAlign">
        <Box>
          <Text sx={{ fontWeight: 500, display: 'block' }}>
            <Trans>Use Default Governance format?</Trans>
          </Text>
          <Text variant="legend" sx={{ fontSize: 1 }}>
            <Trans>
              The default governance structure instead of your custom setup.
            </Trans>
          </Text>
        </Box>
        <Box ml="auto">
          <Switch
            defaultChecked={defaultGovernance}
            {...register('defaultGovernance')}
          />
        </Box>
      </Flex>
      <Text variant="title" mb={4}>
        <Trans>Permissions</Trans>
      </Text>
      {!defaultGovernance && (
        <FormField
          label={t`Owner address`}
          placeholder={t`Input owner ethereum address`}
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
        mb={3}
        name="guardian"
        options={{
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
        mb={4}
        name="pauser"
        options={{
          required: true,
          pattern: {
            value: addressPattern,
            message: t`Invalid ethereum address`,
          },
        }}
      />
      <Text variant="title" mb={4}>
        <Trans>RToken state after transaction</Trans>
      </Text>
      <Field label={t`Pause status`} mb={4}>
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
      {defaultGovernance && <GovernanceParameters />}
    </Card>
  )
}

export default GovernanceSetup

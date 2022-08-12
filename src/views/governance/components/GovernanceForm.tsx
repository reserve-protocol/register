import { t, Trans } from '@lingui/macro'
import { Field, FormField } from 'components/field'
import { useFormContext } from 'react-hook-form'
import { Box, Flex, Select, Switch, Text } from 'theme-ui'
import { addressPattern, numberPattern } from 'utils'

const GovernanceForm = () => {
  const { register, watch } = useFormContext()
  const defaultGovernance = watch('defaultGovernance')
  const unfreeze = watch('unfreeze')

  return (
    <Box>
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
          <Switch defaultChecked {...register('defaultGovernance')} />
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
        label={t`Freezer address`}
        placeholder={t`Input freezer ethereum address`}
        mb={3}
        name="freezer"
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
      <Field label={t`Freeze status`} mb={4}>
        <Select {...register('unfreeze')}>
          <option value={0}>
            <Trans>RToken will be left in freeze state</Trans>
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
            <Trans>Only the unfreezer address will be able to unfreeze</Trans>
          </Text>
        )}
      </Field>
      {defaultGovernance && (
        <>
          <Text variant="title" mb={4}>
            <Trans>Governance parameters</Trans>
          </Text>
          <FormField
            label={t`Voting delay (blocks)`}
            placeholder={t`Input number of blocks`}
            mb={3}
            name="votingDelay"
            options={{
              required: true,
              pattern: numberPattern,
              min: 1,
              max: 80640,
            }}
          />
          <FormField
            label={t`Voting period (blocks)`}
            placeholder={t`Input number of blocks`}
            mb={4}
            name="votingPeriod"
            options={{
              required: true,
              pattern: numberPattern,
              min: 18000,
              max: 80640,
            }}
          />
          <FormField
            label={t`proposalThreshold (%)`}
            placeholder={t`Input proposal threshold`}
            mb={3}
            name="proposalThresholdAsMicroPercent"
            options={{
              required: true,
              pattern: numberPattern,
              min: 0,
              max: 5,
            }}
          />
          <FormField
            label={t`Quorum (%)`}
            placeholder={t`Input quorum percent`}
            mb={4}
            name="quorumPercent"
            options={{
              required: true,
              pattern: numberPattern,
              min: 0,
              max: 50,
            }}
          />
          <FormField
            label={t`Minimum delay (hours)`}
            placeholder={t`Input Minimum delay in hours`}
            mb={3}
            name="minDelay"
            options={{
              required: true,
              pattern: numberPattern,
              min: 1,
              max: 336,
            }}
          />
        </>
      )}
    </Box>
  )
}

export default GovernanceForm

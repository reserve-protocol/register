import { t, Trans } from '@lingui/macro'
import Help from 'components/help'
import OptionSwitch from 'components/option-switch'
import { Box, BoxProps, Button, Flex, Text } from 'theme-ui'

interface Props extends BoxProps {
  onViewChange(index: number): void
  onDeploy(): void
  currentView: number
  isValid: boolean
}

const NeedHelp = () => (
  <Flex sx={{ alignItems: 'center', color: 'lightText' }} mr={4} ml="auto">
    <Text mr={2}>
      <Trans>Need help?</Trans>
    </Text>
    <Help content={<Text>test</Text>} />
  </Flex>
)

const DeployHeader = ({
  currentView,
  onViewChange,
  onDeploy,
  isValid,
  sx = {},
  ...props
}: Props) => {
  // Preview
  if (currentView === 2) {
    return (
      <Flex variant="layout.verticalAlign" {...props}>
        <Box>
          <Text variant="sectionTitle">
            <Trans>RToken Summary</Trans>
          </Text>
          <Text variant="legend">
            <Trans>
              Confirm parameters & baskets before finalizing deployment.{' '}
            </Trans>
          </Text>
        </Box>
        <NeedHelp />
        <Button mr={3} variant="muted" px={4} onClick={() => onViewChange(1)}>
          <Trans>Edit</Trans>
        </Button>
        <Button onClick={onDeploy} disabled={!isValid} px={[0, 5]}>
          <Trans>Deploy RToken</Trans>
        </Button>
      </Flex>
    )
  }

  return (
    <Flex variant="layout.verticalAlign" {...props}>
      <OptionSwitch
        value={currentView}
        onChange={onViewChange}
        options={[t`Set parameters`, t`Set collateral basket`]}
      />
      <NeedHelp />
      <Button onClick={() => onViewChange(2)} disabled={!isValid} px={[0, 5]}>
        <Trans>Complete Setup</Trans>
      </Button>
    </Flex>
  )
}

export default DeployHeader

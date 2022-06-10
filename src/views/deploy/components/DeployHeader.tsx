import { t, Trans } from '@lingui/macro'
import OptionSwitch from 'components/option-switch'
import { HelpCircle } from 'react-feather'
import { Box, BoxProps, Button, Flex, Text } from 'theme-ui'

interface Props extends BoxProps {
  onViewChange(index: number): void
  currentView: number
  isValid: boolean
}

const DeployHeader = ({
  currentView,
  onViewChange,
  isValid,
  sx = {},
  ...props
}: Props) => {
  return (
    <Flex sx={{ alignItems: 'center', ...sx }} {...props}>
      <OptionSwitch
        value={currentView}
        onChange={onViewChange}
        options={[t`Set parameters`, t`Set collateral basket`]}
      />
      <Box mx="auto" />
      <Flex sx={{ alignItems: 'center', color: 'lightText' }} mr={4}>
        <Text mr={2}>
          <Trans>Need help?</Trans>
        </Text>
        <HelpCircle size={18} />
      </Flex>
      <Button disabled={!isValid} px={[0, 5]}>
        <Trans>Complete Setup</Trans>
      </Button>
    </Flex>
  )
}

export default DeployHeader

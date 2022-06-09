import { t } from '@lingui/macro'
import OptionSwitch from 'components/option-switch'
import { Box, BoxProps, Flex } from 'theme-ui'

interface Props extends BoxProps {
  onViewChange(index: number): void
  currentView: number
}

const DeployHeader = ({ currentView, onViewChange, ...props }: Props) => {
  return (
    <Flex {...props}>
      <OptionSwitch
        value={currentView}
        onChange={onViewChange}
        options={[t`Set parameters`, t`Set collateral basket`]}
      />
    </Flex>
  )
}

export default DeployHeader

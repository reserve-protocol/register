import Popup from 'components/popup'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Box, BoxProps, Flex } from 'theme-ui'

export interface SelectOption {
  label: string
  value: string
  icon: React.ReactNode
}

interface Props extends Omit<BoxProps, 'onChange'> {
  options: SelectOption[]
  selectedOptions: SelectOption[]
  onChange: (selectedOptions: SelectOption[]) => void
}

const OptionSelection = () => {
  return <Box />
}

const MultiselectDropdrown = ({ children }: Props) => {
  const [isVisible, setVisible] = useState(false)

  return (
    <Popup
      show={isVisible}
      onDismiss={() => setVisible(false)}
      content={<OptionSelection />}
      containerProps={{
        sx: { border: '2px solid', borderColor: 'darkBorder' },
      }}
    >
      <Flex
        sx={{ alignItems: 'center', cursor: 'pointer' }}
        onClick={() => setVisible(!isVisible)}
      >
        {children}
        <Box mr="2" />
        {isVisible ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </Flex>
    </Popup>
  )
}

export default MultiselectDropdrown

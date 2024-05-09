import { Button } from 'components'
import Popup from 'components/popup'
import { useCallback, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Box, BoxProps, Checkbox, Divider, Flex, Switch, Text } from 'theme-ui'

export interface SelectOption {
  label: string
  value: string
  icon: React.ReactNode
}

export interface IMultiselectDropdrown extends Omit<BoxProps, 'onChange'> {
  options: SelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
}

const OptionSelection = ({
  options,
  selected,
  onChange,
}: IMultiselectDropdrown) => {
  const [values, setValues] = useState(
    options.reduce((acc, v) => {
      acc[v.value] = selected.includes(v.value)

      return acc
    }, {} as Record<string, boolean>)
  )

  const handleApply = () => {
    const selected = Object.entries(values).reduce((acc, [key, value]) => {
      if (value) {
        acc.push(key)
      }

      return acc
    }, [] as string[])

    onChange(selected)
  }

  return (
    <Box
      sx={{
        maxHeight: 320,
        overflow: 'auto',
        backgroundColor: 'background',
        borderRadius: '12px',
      }}
      mt={3}
    >
      {options.map((option) => (
        <Box px={3} py={2} variant="layout.verticalAlign" key={option.value}>
          {option.icon}
          <Text ml="1" mr="3">
            {option.label}
          </Text>
          <Box ml="auto">
            <Switch
              checked={values[option.value]}
              onChange={() =>
                setValues({ ...values, [option.value]: !values[option.value] })
              }
            />
          </Box>
        </Box>
      ))}
      <Divider mt={2} mb={3} />
      <Box px={3} pb={3}>
        <Button small fullWidth onClick={handleApply}>
          Apply
        </Button>
      </Box>
    </Box>
  )
}

const MultiselectDropdrown = ({
  children,
  options,
  selected,
  onChange,
  sx,
  ...props
}: IMultiselectDropdrown) => {
  const [isVisible, setVisible] = useState(false)

  const handleChange = useCallback(
    (selected: string[]) => {
      setVisible(false)
      onChange(selected)
    },
    [setVisible, onChange]
  )

  return (
    <Popup
      show={isVisible}
      onDismiss={() => setVisible(false)}
      placement="bottom"
      content={
        isVisible ? (
          <OptionSelection
            options={options}
            selected={selected}
            onChange={handleChange}
          />
        ) : (
          <Box />
        )
      }
      containerProps={{
        sx: { border: '2px solid', borderColor: 'darkBorder' },
      }}
    >
      <Flex
        sx={{
          ...sx,
          alignItems: 'center',
          cursor: 'pointer',
          justifyContent: 'space-between',
          gap: 2,
        }}
        {...props}
        onClick={() => setVisible(!isVisible)}
      >
        <Box variant="layout.verticalAlign">{children}</Box>
        <Box variant="layout.verticalAlign">
          {isVisible ? (
            <ChevronUp size={18} color="#808080" />
          ) : (
            <ChevronDown size={18} color="#808080" />
          )}
        </Box>
      </Flex>
    </Popup>
  )
}

export default MultiselectDropdrown

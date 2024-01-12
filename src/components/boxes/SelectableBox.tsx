import { Box, BoxProps, Checkbox } from 'theme-ui'

interface Props extends BoxProps {
  onSelect(): void
  unavailable: boolean
  unavailableComponent: React.ReactNode
}

const SelectableBox = ({
  onSelect,
  unavailable,
  unavailableComponent,
  children,
  ...props
}: Props) => (
  <Box variant="layout.verticalAlign" sx={{ width: '100%' }} {...props}>
    {children}
    <Box ml="auto" variant="layout.verticalAlign">
      {!unavailable && (
        <Box sx={{ position: 'relative' }}>
          <label>
            <Checkbox onChange={onSelect} sx={{ cursor: 'pointer' }} />
          </label>
        </Box>
      )}
      {unavailable && !!unavailableComponent && (
        <Box mr={2}>{unavailableComponent}</Box>
      )}
    </Box>
  </Box>
)

export default SelectableBox

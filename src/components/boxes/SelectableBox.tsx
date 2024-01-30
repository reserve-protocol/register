import { Box, BoxProps, Checkbox } from 'theme-ui'

interface Props extends BoxProps {
  selected?: boolean // controlled component
  onSelect(): void
  unavailable?: boolean
  unavailableComponent?: React.ReactNode
}

const SelectableBox = ({
  onSelect,
  unavailable = false,
  unavailableComponent,
  selected,
  children,
  ...props
}: Props) => (
  <Box variant="layout.verticalAlign" sx={{ width: '100%' }} {...props}>
    {children}
    <Box ml="auto" variant="layout.verticalAlign">
      {((unavailable && !unavailableComponent) || !unavailable) && (
        <Box sx={{ position: 'relative' }}>
          <label>
            <Checkbox
              checked={selected}
              onChange={onSelect}
              disabled={unavailable}
              sx={{
                cursor: 'pointer',
                fill: unavailable ? 'muted' : undefined,
              }}
            />
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

import { BoxProps, Box } from '@theme-ui/components'
import { useColorMode } from 'theme-ui'
import DarkModeToggle from '.'

const ThemeColorMode = (props: BoxProps) => {
  const [colorMode, setColorMode] = useColorMode()

  return (
    <Box {...props}>
      <DarkModeToggle mode={colorMode} onToggle={setColorMode} />
    </Box>
  )
}

export default ThemeColorMode

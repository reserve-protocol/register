import { BoxProps, useColorMode } from 'theme-ui'
import DarkModeToggle from '.'

const ThemeColorMode = (props: BoxProps) => {
  const [colorMode, setColorMode] = useColorMode()

  return <DarkModeToggle mode={colorMode} onToggle={setColorMode} {...props} />
}

export default ThemeColorMode

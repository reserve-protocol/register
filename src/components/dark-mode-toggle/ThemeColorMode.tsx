import { BoxProps, useColorMode } from 'theme-ui'
import DarkModeToggle from '.'

// TODO: Fix typescript here
const ThemeColorMode = (props: BoxProps) => {
  const [colorMode, setColorMode] = useColorMode()

  return (
    <DarkModeToggle
      mode={colorMode}
      // @ts-ignore
      onToggle={(mode) => setColorMode(mode)}
      {...props}
    />
  )
}

export default ThemeColorMode

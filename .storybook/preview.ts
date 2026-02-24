import type { Preview, Renderer } from '@storybook/react'
import { withThemeByClassName } from '@storybook/addon-themes'
import '../src/app.css'

const preview: Preview = {
  parameters: {
    layout: 'centered',
  },
  decorators: [
    withThemeByClassName<Renderer>({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
}

export default preview

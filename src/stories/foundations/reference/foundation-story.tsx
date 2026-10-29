import type { Decorator, Parameters } from '@storybook/react-vite'

export const foundationParameters: Parameters = {
  layout: 'padded',
  controls: { disable: true },
}

export const foundationDecorators: Decorator[] = [
  (Story) => (
    <div className="mx-auto max-w-6xl">
      <Story />
    </div>
  ),
]

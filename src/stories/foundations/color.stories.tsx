import type { Meta, StoryObj } from '@storybook/react-vite'
import { v1Typography } from '@/components/design-system-v1/typography'
import { v1LayoutRecipes } from '@/components/ui/v1-layout-recipes'
import { FoundationPrimaryResult } from './reference/foundation-documentation-results'
import {
  foundationDecorators,
  foundationParameters,
} from './reference/foundation-story'

const meta = {
  title: 'Foundations/Color',
  tags: ['!autodocs'],
  parameters: foundationParameters,
  decorators: foundationDecorators,
} satisfies Meta
export default meta

export const Color: StoryObj<typeof meta> = {
  render: () => (
    <div className={v1LayoutRecipes.stack.internalRegions}>
      <h2 className={v1Typography.sectionTitle}>Color</h2>
      <FoundationPrimaryResult foundationId="color" />
    </div>
  ),
}

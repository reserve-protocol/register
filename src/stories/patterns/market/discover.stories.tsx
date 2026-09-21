import type { Meta, StoryObj } from '@storybook/react-vite'

import { DiscoverTable } from './reference/table-family/discover-table'
import {
  previewDiscover,
  type DiscoverState,
} from './reference/table-family/discover-fixtures'

type DiscoverArgs = {
  state: DiscoverState
  width: 'table' | 'cards' | 'phone'
  cardLayout: 'compact' | 'full'
}

const widths = {
  table: 'w-[72rem]',
  cards: 'w-[48rem]',
  phone: 'w-full max-w-[390px]',
} as const

const DiscoverReference = ({ state, width, cardLayout }: DiscoverArgs) => (
  <div className={`mx-auto max-w-none ${widths[width]}`}>
    <DiscoverTable
      rows={previewDiscover(state)}
      loading={state === 'loading'}
      cardLayout={cardLayout}
    />
  </div>
)

const meta = {
  title: 'Patterns/Market/Discover',
  component: DiscoverReference,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Story-only reference preserving the source Discover table, responsive cards, compact chart, asset ticker and missing-data states.',
      },
    },
  },
  args: { state: 'default', width: 'table', cardLayout: 'compact' },
  argTypes: {
    state: {
      control: 'select',
      options: [
        'default',
        'loading',
        'missing',
        'long',
        'inactive',
        'short-basket',
      ],
    },
    width: { control: 'inline-radio', options: ['table', 'cards', 'phone'] },
    cardLayout: { control: 'inline-radio', options: ['compact', 'full'] },
  },
} satisfies Meta<typeof DiscoverReference>

export default meta
type Story = StoryObj<typeof meta>

export const Table: Story = {}
export const Cards: Story = { args: { width: 'cards' } }
export const FeatureCards: Story = {
  args: { width: 'cards', cardLayout: 'full' },
}
export const PhoneCards: Story = { args: { width: 'phone' } }
export const Loading: Story = { args: { state: 'loading', width: 'cards' } }
export const MissingData: Story = { args: { state: 'missing' } }
export const Inactive: Story = { args: { state: 'inactive' } }
export const LongContent: Story = { args: { state: 'long', width: 'cards' } }

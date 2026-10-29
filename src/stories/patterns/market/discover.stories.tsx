import { Description, Heading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { CenteredStorySurface, StorySurface } from '../../shared/story-surface'
import { ConnectedCanvas } from '../../shared/connected-docs'
import { cn } from '@/lib/utils'
import { DiscoverTable } from './reference/table-family/discover-table'
import { FeaturedCardPreview } from './reference/cards/featured-card-preview'
import {
  previewDiscover,
  type DiscoverState,
} from './reference/table-family/discover-fixtures'

type DiscoverArgs = {
  state: DiscoverState
  width: 'table' | 'cards' | 'phone'
  sampleSize?: number
}

const widths = {
  table: 'w-full',
  cards: 'w-full max-w-[48rem]',
  phone: 'w-full max-w-[390px]',
} as const

const DiscoverReference = ({ state, width, sampleSize }: DiscoverArgs) => (
  <div className={cn('mx-auto', widths[width])}>
    <DiscoverTable
      rows={previewDiscover(state).slice(0, sampleSize)}
      loading={state === 'loading'}
      cardLayout="compact"
    />
  </div>
)

const meta = {
  title: 'Patterns/Market/Discover',
  component: DiscoverReference,
  decorators: [
    (Story, context) =>
      context.id === 'patterns-market-discover--feature-cards' ? (
        <CenteredStorySurface fullHeight={context.viewMode !== 'docs'}>
          <Story />
        </CenteredStorySurface>
      ) : (
        <StorySurface
          fullHeight={context.viewMode !== 'docs'}
          desktopMinWidth={context.args.width === 'table'}
        >
          <Story />
        </StorySurface>
      ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: () => (
        <>
          <Title />
          <Description />
          <Heading>Interactive example</Heading>
          <ConnectedCanvas of={DocsPreview} include={['width', 'state']} />
        </>
      ),
      description: {
        component:
          'Discover switches from a table to cards when its container is narrower than 1152px.',
      },
    },
  },
  args: {
    state: 'default',
    width: 'table',
  },
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
    sampleSize: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof DiscoverReference>

export default meta
type Story = StoryObj<typeof meta>

export const Table: Story = {}
export const DocsPreview: Story = {
  name: 'Docs preview',
  args: { sampleSize: 2 },
  tags: ['!dev'],
}
export const Cards: Story = { args: { width: 'cards' }, tags: ['!dev'] }
export const FeatureCards: Story = {
  name: 'Feature cards',
  args: { width: 'cards' },
  render: () => <FeaturedCardPreview />,
  parameters: { controls: { disable: true } },
}
export const PhoneCards: Story = {
  name: 'Phone cards',
  args: { width: 'phone', sampleSize: 1 },
}
export const Loading: Story = { args: { state: 'loading', width: 'phone' } }
export const MissingData: Story = {
  name: 'Missing data',
  args: { state: 'missing', width: 'cards' },
}
export const Inactive: Story = { args: { state: 'inactive', width: 'phone' } }
export const LongContent: Story = {
  name: 'Long content',
  args: { state: 'long', width: 'phone' },
}

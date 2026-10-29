import { useArgs } from 'storybook/preview-api'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { Tabs } from '@/components/design-system-v1/tabs'

import { FocusedDocs } from '../../shared/focused-docs'
import { StorySurface } from '../../shared/story-surface'
import {
  HOLDINGS,
  previewHoldings,
  type HoldingsState,
} from './reference/table-family/holdings-fixtures'
import { HoldingsTable } from './reference/table-family/holdings-table'

type HoldingsArgs = {
  tab: 'exposure' | 'collateral'
  dataset: 'cmc20' | 'photon'
  state: HoldingsState
  width: 'full' | '836px' | '390px'
  sampleSize?: number
}

const HoldingsReference = ({
  tab,
  dataset,
  state,
  width,
  sampleSize,
  onTabChange,
}: HoldingsArgs & { onTabChange: (tab: string) => void }) => {
  return (
    <Tabs
      value={tab}
      onValueChange={onTabChange}
      className={
        width === '390px'
          ? 'mx-auto w-full max-w-[390px] bg-card [container-type:inline-size]'
          : width === '836px'
            ? 'mx-auto w-full max-w-[836px] bg-card [container-type:inline-size]'
            : 'w-full bg-card [container-type:inline-size]'
      }
    >
      <HoldingsTable
        rows={previewHoldings(HOLDINGS[dataset], state).slice(0, sampleSize)}
        tab={tab}
        state={state}
        onBridge={() => undefined}
      />
    </Tabs>
  )
}

const meta = {
  title: 'Patterns/Market/Holdings',
  decorators: [
    (Story, context) => (
      <StorySurface
        fullHeight={context.viewMode !== 'docs'}
        desktopMinWidth={
          context.viewMode === 'docs' && context.args.width === 'full'
        }
      >
        <Story />
      </StorySurface>
    ),
  ],
  render: function Render(args) {
    const [, updateArgs] = useArgs<HoldingsArgs>()
    return (
      <HoldingsReference
        {...args}
        onTabChange={(tab) => updateArgs({ tab: tab as HoldingsArgs['tab'] })}
      />
    )
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: () => <FocusedDocs of={DocsPreview} />,
      description: {
        component:
          'Compare exposure and collateral by dataset, state, and width. Individual stories retain the complete asset lists. Bridged action targets are static in this preview.',
      },
    },
  },
  args: { tab: 'exposure', dataset: 'cmc20', state: 'default', width: 'full' },
  argTypes: {
    tab: { control: 'inline-radio', options: ['exposure', 'collateral'] },
    dataset: { control: 'inline-radio', options: ['cmc20', 'photon'] },
    state: {
      control: 'select',
      options: [
        'default',
        'loading',
        'performance-loading',
        'missing',
        'new',
        'long',
        'unavailable',
      ],
    },
    width: { control: 'inline-radio', options: ['full', '836px', '390px'] },
    sampleSize: { control: false, table: { disable: true } },
  },
} satisfies Meta<HoldingsArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Exposure: Story = {}
export const DocsPreview: Story = {
  name: 'Docs preview',
  args: { sampleSize: 3 },
  tags: ['!dev'],
}
export const Collateral: Story = { args: { tab: 'collateral' } }
export const PhotonExposure: Story = {
  name: 'PHOTON exposure',
  args: { dataset: 'photon' },
}
export const PhotonCollateral: Story = {
  name: 'PHOTON collateral',
  args: { dataset: 'photon', tab: 'collateral' },
}
export const Overview836: Story = {
  name: 'Compact width (836px)',
  args: { width: '836px' },
}
export const Mobile390: Story = {
  name: 'Phone width (390px)',
  args: { width: '390px' },
}
export const MissingData: Story = {
  name: 'Missing data',
  args: { state: 'missing' },
}
export const PerformanceLoading: Story = {
  name: 'Performance loading',
  args: { state: 'performance-loading' },
}
export const NewlyAdded: Story = {
  name: 'Newly added',
  args: { state: 'new' },
}
export const LongContent: Story = {
  name: 'Long content',
  args: { state: 'long' },
}
export const Loading: Story = { args: { state: 'loading' } }
export const Unavailable: Story = { args: { state: 'unavailable' } }

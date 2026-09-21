import { useArgs } from 'storybook/preview-api'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useId } from 'react'

import { Tabs } from '@/components/design-system-v1/tabs'

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
}

const HoldingsReference = ({
  tab,
  dataset,
  state,
  width,
  onTabChange,
}: HoldingsArgs & { onTabChange: (tab: string) => void }) => {
  const panelId = useId()
  return (
    <Tabs
      value={tab}
      onValueChange={onTabChange}
      className={
        width === '390px'
          ? 'mx-auto w-full max-w-[390px] bg-card [container-type:inline-size]'
          : width === '836px'
            ? 'mx-auto w-full max-w-[836px] bg-card [container-type:inline-size]'
            : 'mx-auto w-full max-w-5xl bg-card [container-type:inline-size]'
      }
    >
      <div id={panelId} role="tabpanel">
        <HoldingsTable
          rows={previewHoldings(HOLDINGS[dataset], state)}
          tab={tab}
          state={state}
          onBridge={() => undefined}
          panelId={panelId}
        />
      </div>
    </Tabs>
  )
}

const meta = {
  title: 'Patterns/Market/Holdings',
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
    layout: 'padded',
    docs: {
      description: {
        component:
          'Story-only reference preserving the accepted Exposure and Collateral table projections and their responsive toolbar.',
      },
    },
  },
  args: { tab: 'exposure', dataset: 'cmc20', state: 'default', width: 'full' },
  argTypes: {
    tab: { control: 'inline-radio', options: ['exposure', 'collateral'] },
    dataset: { control: 'inline-radio', options: ['cmc20', 'photon'] },
    state: {
      control: 'inline-radio',
      options: [
        'default',
        'loading',
        'performance-loading',
        'missing',
        'new',
        'long',
        'empty',
      ],
    },
    width: { control: 'inline-radio', options: ['full', '836px', '390px'] },
  },
} satisfies Meta<HoldingsArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Exposure: Story = {}
export const Collateral: Story = { args: { tab: 'collateral' } }
export const PhotonExposure: Story = { args: { dataset: 'photon' } }
export const PhotonCollateral: Story = {
  args: { dataset: 'photon', tab: 'collateral' },
}
export const Overview836: Story = { args: { width: '836px' } }
export const Mobile390: Story = { args: { width: '390px' } }
export const MissingData: Story = { args: { state: 'missing' } }
export const PerformanceLoading: Story = {
  args: { state: 'performance-loading' },
}
export const NewlyAdded: Story = { args: { state: 'new' } }
export const LongContent: Story = { args: { state: 'long' } }
export const Loading: Story = { args: { state: 'loading' } }
export const Empty: Story = { args: { state: 'empty' } }

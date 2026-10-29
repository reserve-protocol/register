import type { Meta, StoryObj } from '@storybook/react-vite'
import { Description, Heading, Title } from '@storybook/addon-docs/blocks'
import { Binoculars, Landmark } from 'lucide-react'

import { ConnectedCanvas } from '../../shared/connected-docs'
import { StorySurface } from '../../shared/story-surface'
import { Positions } from './reference/table-family/positions'
import {
  POSITIONS,
  WITHDRAWALS,
  YIELD_POSITIONS,
  withLongContent,
} from './reference/table-family/fixtures'
import {
  Withdrawals,
  type WithdrawalPreview,
} from './reference/table-family/withdrawals'
import { Button } from '@/components/button'
import { EmptyState } from '@/components/empty-state'

type PortfolioArgs = {
  family: 'index' | 'yield'
  width: 'desktop' | 'phone'
  state: 'default' | 'loading' | 'long' | 'empty'
  withdrawalState: WithdrawalPreview
  sample: 'full' | 'short'
}

const widths = {
  desktop: 'w-full',
  phone: 'mx-auto w-full max-w-[390px]',
} as const

const PortfolioReference = ({
  family,
  width,
  state,
  withdrawalState,
  sample,
}: PortfolioArgs) => {
  const source = family === 'index' ? POSITIONS : YIELD_POSITIONS
  const positionRows = state === 'long' ? withLongContent(source) : source
  const rows =
    state === 'empty'
      ? []
      : sample === 'short'
        ? positionRows.slice(0, state === 'long' ? 2 : 3)
        : positionRows
  const withdrawalRows =
    state === 'empty'
      ? []
      : sample === 'short'
        ? withdrawalState === 'idle'
          ? [WITHDRAWALS[0], WITHDRAWALS[3]]
          : [WITHDRAWALS[3]]
        : WITHDRAWALS
  const states = Object.fromEntries(
    withdrawalRows.map((row) => [row.id, withdrawalState])
  )

  if (state === 'empty')
    return (
      <div className={`${widths[width]} bg-card px-5 py-8 sm:px-6`}>
        {/* Product copy from the app's empty-portfolio prompt; both sections hide when empty. */}
        <EmptyState
          mode="actionable"
          size="page"
          title="No Reserve activity found in this wallet"
          description="This wallet does not currently hold any DTFs, staked RSR, vote-locked positions, rewards, pending withdrawals, or active governance activity."
          actions={
            <>
              <Button leadingIcon={<Binoculars />}>Explore DTFs</Button>
              <Button tone="secondary" leadingIcon={<Landmark />}>
                Participate and earn
              </Button>
            </>
          }
        />
      </div>
    )

  return (
    <div className={`${widths[width]} bg-secondary`}>
      <Positions rows={rows} family={family} loading={state === 'loading'} />
      <Withdrawals
        rows={withdrawalRows}
        loading={state === 'loading'}
        states={states}
        onWithdraw={() => undefined}
        onSource={() => undefined}
      />
    </div>
  )
}

const meta = {
  title: 'Patterns/Market/Portfolio tables',
  component: PortfolioReference,
  decorators: [
    (Story, context) => (
      <StorySurface
        fullHeight={context.viewMode !== 'docs'}
        desktopMinWidth={
          context.viewMode === 'docs' && context.args.width === 'desktop'
        }
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
          <ConnectedCanvas of={DocsPreview} />
        </>
      ),
      description: {
        component:
          'Positions and pending withdrawals. Source and withdraw actions are static in these examples.',
      },
    },
  },
  args: {
    family: 'index',
    width: 'desktop',
    state: 'default',
    withdrawalState: 'idle',
    sample: 'full',
  },
  argTypes: {
    family: { control: 'inline-radio', options: ['index', 'yield'] },
    width: { control: 'inline-radio', options: ['desktop', 'phone'] },
    state: {
      control: 'inline-radio',
      options: ['default', 'loading', 'long', 'empty'],
    },
    withdrawalState: {
      control: 'inline-radio',
      options: ['idle', 'processing', 'withdrawn'],
    },
    sample: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof PortfolioReference>

export default meta
type Story = StoryObj<typeof meta>

export const IndexPositions: Story = {
  name: 'Index positions',
}
export const DocsPreview: Story = {
  name: 'Docs preview',
  args: { sample: 'short' },
  tags: ['!dev'],
}
export const YieldPositions: Story = {
  name: 'Yield positions',
  args: { family: 'yield' },
}
export const LongContent: Story = {
  name: 'Long content',
  args: { state: 'long' },
}
export const Loading: Story = { args: { state: 'loading' } }
export const WithdrawalProcessing: Story = {
  name: 'Withdrawal processing',
  args: { withdrawalState: 'processing' },
}
export const WithdrawalComplete: Story = {
  name: 'Withdrawal complete',
  args: { withdrawalState: 'withdrawn' },
}
export const Empty: Story = { args: { state: 'empty' } }

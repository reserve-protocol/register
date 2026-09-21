import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  ZapperInlineReference,
  type ZapperReviewState,
} from './reference/transaction-composition-rfq'

const states: readonly ZapperReviewState[] = [
  'Pre-quote',
  'Quote search',
  'Review',
  'Approval',
  'Sign order',
  'RFQ execution',
  'Atomic confirmation',
  'RFQ outcome',
  'Atomic outcome',
  'Quote failure',
  'RFQ recovery',
  'Native refund',
  'Route selection',
  'High-impact acknowledgment',
  'Market-hours advisory',
  'Capacity advisory',
  'Trading unavailable',
  'CoW redirect · retired',
  'Updates',
  'Intro call',
]

const meta = {
  title: 'Patterns/Transactions/Zapper and RFQ',
  component: ZapperStory,
  args: { state: 'Review' },
  argTypes: { state: { control: 'select', options: states } },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Quote, execution, recovery and outcome states.',
      },
    },
  },
} satisfies Meta<typeof ZapperStory>

export default meta
type Story = StoryObj<typeof meta>

export const QuoteReview: Story = {}
export const RouteSelection: Story = { args: { state: 'Route selection' } }
export const RfqRecovery: Story = { args: { state: 'RFQ recovery' } }
export const RfqOutcome: Story = { args: { state: 'RFQ outcome' } }

function ZapperStory({ state = 'Review' }: { state: ZapperReviewState }) {
  return (
    <div className="relative isolate flex min-h-[680px] items-end justify-center bg-background p-0 sm:items-center sm:p-6">
      <span aria-hidden="true" className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 w-full">
        <ZapperInlineReference key={state} state={state} />
      </div>
    </div>
  )
}

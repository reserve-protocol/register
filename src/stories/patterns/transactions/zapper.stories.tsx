import type { Meta, StoryObj } from '@storybook/react-vite'

import { TransactionDocs } from './transaction-docs'
import { BoundedZapperProposal } from './bounded-zapper-proposal'
import { centeredStoryDecorator } from '../../shared/story-surface'
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
  title: 'Patterns/Transactions (In progress)/Zapper and RFQ',
  tags: ['in-progress'],
  component: ZapperStory,
  args: { state: 'Review' },
  argTypes: { state: { control: 'select', options: states } },
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: () => <TransactionDocs interactive={QuoteReview} />,
      description: {
        component:
          'Quote, execution, recovery and outcome states. The Bounded dialog proposal hosts the same content in the canonical Dialog: focus containment, Escape, return to the opener and scrolling within short viewports. It proposes the standard 432px dialog frame instead of the standalone 448px reference; existing references and pilot embeds keep their geometry. The frame owns its 8px inset once. Core states scroll content above a visible action area; attached advisories and outcome extensions keep their complete composition scrollable. This host proposal does not change quote, approval, execution or recovery semantics.',
      },
    },
  },
} satisfies Meta<typeof ZapperStory>

export default meta
type Story = StoryObj<typeof meta>

export const QuoteReview: Story = { name: 'Quote review' }
export const RouteSelection: Story = {
  name: 'Route selection',
  args: { state: 'Route selection' },
}
export const RfqRecovery: Story = {
  name: 'RFQ recovery',
  args: { state: 'RFQ recovery' },
}
export const RfqOutcome: Story = {
  name: 'RFQ outcome',
  args: { state: 'RFQ outcome' },
}
export const BoundedDialogProposal: Story = {
  name: 'Bounded dialog · Proposal',
  decorators: [centeredStoryDecorator],
  render: ({ state }) => <BoundedZapperProposal state={state} />,
}

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

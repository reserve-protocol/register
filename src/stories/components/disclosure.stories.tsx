import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/design-system-v1/accordion'

const items = (
  <>
    <AccordionItem value="governance">
      <AccordionTrigger>Governance</AccordionTrigger>
      <AccordionContent>
        Token holders can propose and vote on basket changes.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="issuance">
      <AccordionTrigger>Issuance</AccordionTrigger>
      <AccordionContent>
        Mint and redeem against the current underlying basket.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="rewards" disabled>
      <AccordionTrigger>Rewards (not offered)</AccordionTrigger>
      <AccordionContent>This DTF does not offer rewards.</AccordionContent>
    </AccordionItem>
  </>
)

const meta = {
  title: 'Components/Navigation and disclosure/Accordion',
  component: Accordion,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          '`@/components/design-system-v1/accordion` · Coordinated informational sets such as FAQs and product details. Callers choose `type` explicitly: `multiple` is the ordinary recommendation, so independently useful answers stay open for comparison; `single` is for mutually substitutive or unusually long regions. One independent region uses Collapsible instead. Task progress, validation, editing and actions are not Accordion variants.',
      },
    },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Sections: Story = {
  name: 'Multiple (recommended)',
  render: () => (
    <Accordion type="multiple" className="w-[min(32rem,90vw)]">
      {items}
    </Accordion>
  ),
}

export const Single: Story = {
  name: 'Single',
  render: () => (
    <Accordion type="single" collapsible className="w-[min(32rem,90vw)]">
      {items}
    </Accordion>
  ),
}

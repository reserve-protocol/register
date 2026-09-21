import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/design-system-v1/accordion'
const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  args: { type: 'single' },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: '`@/components/design-system-v1/accordion`',
      },
    },
  },
  render: () => (
    <Accordion type="single" collapsible className="w-[min(32rem,90vw)]">
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
      <AccordionItem value="unavailable" disabled>
        <AccordionTrigger>Advanced settings unavailable</AccordionTrigger>
        <AccordionContent>Unavailable settings</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
} satisfies Meta<typeof Accordion>
export default meta
type Story = StoryObj<typeof meta>
export const Sections: Story = {}

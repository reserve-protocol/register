import { EligibilityDialogCandidate } from '../components/reference/eligibility-dialog'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { X } from 'lucide-react'

import { Button } from '@/components/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/dialog'
import { IconButton } from '@/components/icon-button'

const meta = {
  title: 'Components/Dialog',
  parameters: {
    docs: {
      description: {
        component: '`@/components/dialog`',
      },
    },
  },
  component: DialogContent,
  args: {
    dismissible: true,
    width: 'standard',
  },
  argTypes: {
    children: { control: false },
    width: { control: 'inline-radio', options: ['compact', 'standard'] },
  },
  render: (args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open simulation</Button>
      </DialogTrigger>
      <DialogContent {...args}>
        <DialogHeader
          action={
            <DialogClose asChild>
              <IconButton
                label="Close dialog"
                icon={<X />}
                size="compact"
                tone="secondary"
              />
            </DialogClose>
          }
        >
          <DialogTitle>Proposal Simulation</DialogTitle>
          <DialogDescription>
            Test the proposal before submitting it onchain.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="py-4 text-sm font-light leading-5 text-muted-foreground">
            The result remains in this task and can link to Tenderly after the
            simulation completes.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button className="w-full">Simulate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
} satisfies Meta<typeof DialogContent>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const NonDismissible: Story = {
  args: { dismissible: false },
}

export const LongContent: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Eligibility layout with long content. Sample policy text only.',
      },
    },
  },
  render: (args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open eligibility</Button>
      </DialogTrigger>
      <DialogContent {...args}>
        <EligibilityDialogCandidate
          idPrefix="storybook-long-eligibility"
          jurisdictionsDefaultOpen
          showClosePreview
        />
      </DialogContent>
    </Dialog>
  ),
}
export const Eligibility: Story = {
  args: { dismissible: false },
  parameters: {
    docs: {
      description: {
        story: 'Eligibility checklist.',
      },
    },
  },
  render: (args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Review eligibility</Button>
      </DialogTrigger>
      <DialogContent {...args}>
        <EligibilityDialogCandidate idPrefix="storybook-eligibility" />
      </DialogContent>
    </Dialog>
  ),
}

import { useEffect, useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { toast } from 'sonner'

import { Button } from '@/components/button'
import { Toaster } from '@/components/ui/sonner'
import {
  BRIEF_TOAST_DURATION_MS,
  DETAILED_ERROR_TOAST_DURATION_MS,
} from '@/components/ui/toast-policy'
import { PlaygroundDocs } from '../shared/playground-docs'
import { centeredStoryDecorator } from '../shared/story-surface'

type ToastExampleProps = {
  example:
    | 'copy-success'
    | 'copy-error'
    | 'proposal-created'
    | 'transaction-reverted'
  stacked: boolean
}

const examples: Record<
  ToastExampleProps['example'] | 'withdrawal-success',
  { title: string; description?: string; result: 'success' | 'error' }
> = {
  'copy-success': {
    title: 'Address copied to clipboard',
    result: 'success',
  },
  'copy-error': { title: 'Unable to copy address', result: 'error' },
  'proposal-created': {
    title: 'Proposal created!',
    description: 'Reserve Optimistic Governor Upgrade proposal created',
    result: 'success',
  },
  'transaction-reverted': {
    title: 'Transaction reverted',
    description: 'Unknown error',
    result: 'error',
  },
  'withdrawal-success': { title: 'Withdrawal successful', result: 'success' },
}

const showExample = (example: keyof typeof examples, duration: number) => {
  const { title, description, result } = examples[example]
  const options = { description, duration }
  return result === 'success'
    ? toast.success(title, options)
    : toast.error(title, options)
}

const ToastExample = ({ example, stacked }: ToastExampleProps) => {
  const toastIds = useRef<ReturnType<typeof toast.success>[]>([])

  useEffect(() => {
    toastIds.current.push(showExample(example, Infinity))
    if (stacked)
      toastIds.current.push(showExample('withdrawal-success', Infinity))
    return () => {
      toastIds.current.forEach((id) => toast.dismiss(id))
      toastIds.current = []
    }
  }, [example, stacked])

  return (
    <div
      className={`relative mx-auto flex w-full max-w-xl items-end justify-center py-4 ${stacked ? 'min-h-80' : examples[example].description ? 'min-h-48' : 'min-h-40'}`}
    >
      <Button
        tone="secondary"
        onClick={() =>
          toastIds.current.push(
            showExample(
              example,
              example === 'transaction-reverted'
                ? DETAILED_ERROR_TOAST_DURATION_MS
                : BRIEF_TOAST_DURATION_MS
            )
          )
        }
      >
        Show sample toast
      </Button>
      <Toaster
        position="top-center"
        mobileOffset={0}
        expand
        style={{
          position: 'absolute',
          top: '0.5rem',
          left: 0,
          right: 0,
          width: '100%',
          maxWidth: '320px',
          margin: '0 auto',
          transform: 'none',
        }}
      />
    </div>
  )
}

const meta = {
  title: 'Components/Feedback and overlays/Toast',
  component: ToastExample,
  args: { example: 'copy-success', stacked: false },
  argTypes: {
    example: {
      control: 'inline-radio',
      options: [
        'copy-success',
        'copy-error',
        'proposal-created',
        'transaction-reverted',
      ],
    },
    stacked: { control: 'boolean' },
  },
  decorators: [centeredStoryDecorator],
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: () => <PlaygroundDocs interactive={Playground} />,
      description: {
        component:
          "`@/components/ui/sonner` · Brief success and failure messages use a compact layout; proposal and transaction examples show the optional description already used by the app. This story renders the shared application Toaster with Sonner's success and error calls. The initial notification stays visible for review. Reopened examples dismiss after 5 seconds, or 8 seconds for the detailed error. Sonner pauses on hover and when the page is hidden; keyboard focus alone does not pause dismissal. Feedback that needs an action or must remain available belongs inline.",
      },
    },
  },
} satisfies Meta<typeof ToastExample>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { tags: ['!dev'] }

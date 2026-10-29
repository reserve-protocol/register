import { useId, type ReactNode } from 'react'
import { CircleX, SlidersHorizontal, X } from 'lucide-react'
import { DialogTaskHeader } from './dialog-task-header'

import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/dialog'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import { IconButton } from '@/components/icon-button'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { v1Typography } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'

const title = 'Liquidity simulation amount'
const description =
  'Set the USD amount per token used to simulate price impact.'

export const DialogHeaderExamples = () => (
  <div
    data-testid="dialog-header-examples"
    className="w-full max-w-xl space-y-8 text-foreground"
  >
    <HeaderExample
      title="Allowed · Title and close"
      explanation="Default for simple tasks. The title and quiet close action share a row; longer titles wrap beside the control."
    >
      <DialogTaskHeader title={title} description={description} />
    </HeaderExample>
    <HeaderExample
      title="Allowed · Topic icon and close"
      explanation="Use a relevant icon for recognition, opposite a quiet close action. Leave 16px between that row and the title."
    >
      <DialogTaskHeader
        title={title}
        description={description}
        topicIcon={<SlidersHorizontal className="size-5" strokeWidth={1.5} />}
      />
    </HeaderExample>
    <HeaderExample
      title="Allowed · Transaction controls"
      explanation="The existing Buy/Sell transaction header uses contained controls and a bordered close action at the same 32px size. Its transaction flow stays in its own pattern."
    >
      <div className="flex items-center justify-between gap-4 px-4 pb-2 pt-4">
        <SegmentedControl
          aria-label="Zapper operation"
          presentation="contained"
          size="compact"
          width="intrinsic"
          value="Buy"
          onValueChange={() => undefined}
        >
          <SegmentedControlItem value="Buy">Buy</SegmentedControlItem>
          <SegmentedControlItem value="Sell">Sell</SegmentedControlItem>
        </SegmentedControl>
        <IconButton label="Close Zapper" icon={<X />} size="compact" />
      </div>
    </HeaderExample>
    <HeaderExample
      avoid
      title="Avoid · Empty action row"
      explanation="A close action alone above the title leaves the other side empty and crowds the title below. Use the title row, or give a meaningful topic icon its own row."
    >
      <DialogHeader
        action={
          <IconButton
            label="Close dialog"
            icon={<X />}
            size="compact"
            tone="quiet"
          />
        }
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
    </HeaderExample>
  </div>
)

const HeaderExample = ({
  title,
  explanation,
  children,
  avoid = false,
}: {
  title: string
  explanation: string
  children: ReactNode
  avoid?: boolean
}) => {
  const headingId = useId()

  return (
    <section
      aria-labelledby={headingId}
      className={cn('border border-border', avoid && 'border-destructive/60')}
    >
      <div
        className={cn(
          'border-b border-border bg-muted/40 p-4',
          avoid && 'border-destructive/30 bg-destructive/10'
        )}
      >
        <div className="flex items-center gap-2">
          {avoid && (
            <CircleX aria-hidden className="size-4 shrink-0 text-destructive" />
          )}
          <h3
            id={headingId}
            className={cn(
              v1Typography.label,
              avoid && roles.feedback.danger.foreground
            )}
          >
            {title}
          </h3>
        </div>
        <p
          className={cn(
            'mt-1',
            v1Typography.supporting,
            'text-muted-foreground'
          )}
        >
          {explanation}
        </p>
      </div>
      <div className="bg-muted/40 p-4 sm:p-6">
        <div
          {...{ inert: '' }}
          className="mx-auto w-full max-w-[432px] bg-card p-2"
        >
          <Dialog>{children}</Dialog>
        </div>
      </div>
    </section>
  )
}

import { SingleChoiceGroup } from '@/components/design-system-v1/single-choice-group'

const SingleChoiceGroupStateSheet = () => (
  <section
    data-testid="single-choice-group-state-sheet"
    className="space-y-4"
    aria-labelledby="single-choice-group-title"
  >
    <div>
      <p className="text-sm font-medium text-primary">
        Reusable candidate · current canonical review
      </p>
      <h2 id="single-choice-group-title" className="mt-1 text-2xl font-light">
        Single-choice pill group
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
        This is a radio group for a value submitted with a form—not navigation
        Tabs and not an immediately applied mode switch. The complete candidate
        applies the accepted 44px default peer height, neutral control track,
        white selected item, 14px medium labels, full radius, and two-pixel
        track inset. It inherits the contained-selection language: the same 2px
        spacing inside the track and between peer items, default-size horizontal
        padding, and the same quiet selected elevation. The track and items wrap
        their content by default; a full-width track makes every item grow
        equally. Standard radio rows and rich selectable cards remain separate
        future compositions.
      </p>
    </div>

    <div className="grid gap-0.5 bg-secondary p-0.5 lg:grid-cols-2">
      <Specimen label="Default selection">
        <SingleChoiceGroup
          accessibleLabel="Voting delay"
          defaultValue="1"
          options={[
            { value: '0.5', label: '12 hours' },
            { value: '1', label: '1 day' },
            { value: '1.5', label: '1.5 days' },
            { value: '2', label: '2 days' },
          ]}
        />
      </Specimen>
      <Specimen label="Full width · disabled option">
        <SingleChoiceGroup
          accessibleLabel="Voting quorum"
          defaultValue="20"
          width="full"
          options={[
            { value: '10', label: '10%' },
            { value: '15', label: '15%' },
            { value: '20', label: '20%' },
            { value: '25', label: '25%', disabled: true },
          ]}
        />
      </Specimen>
    </div>
  </section>
)

const Specimen = ({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) => (
  <div className="min-w-0 bg-card">
    <p className="border-b border-border px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <div className="flex min-h-32 items-center p-6">{children}</div>
  </div>
)

export default SingleChoiceGroupStateSheet

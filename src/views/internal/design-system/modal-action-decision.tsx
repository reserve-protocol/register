const ACCEPTED_DIALOG_RULES = [
  {
    title: 'Ordinary actions',
    detail:
      'One visible completion action when close, Escape, or outside dismissal already cancels the reversible task.',
  },
  {
    title: 'Destructive actions',
    detail:
      'Pair an outlined Cancel with a red action named for its consequence. Generic Confirm is not sufficient.',
  },
  {
    title: 'Long content',
    detail:
      'The body scrolls at the overflow boundary while the header and action regions remain anchored.',
  },
  {
    title: 'Overlay ownership',
    detail:
      'Dialogs never stack. Supporting menus, popovers, and selectors may appear inside the current dialog.',
  },
  {
    title: 'Progress',
    detail:
      'The anchored action stays stable and names the current operation; complex workflow bodies may update with meaningful progress.',
  },
  {
    title: 'Recoverable failure',
    detail:
      'Preserve user input, show contextual error detail, and turn the anchored action into a specific recovery such as Try again. No standalone failure-dialog type is assumed.',
  },
  {
    title: 'Outcome boundary',
    detail:
      'Routine non-blocking results use a toast. Consequential outcomes remain in the dialog when users need detail or a next action.',
  },
  {
    title: 'Outcome visual',
    detail:
      'Routine outcomes use a semantic framed icon. Meaningful product milestones may earn purpose-made illustration.',
  },
]

const ModalActionDecision = () => (
  <section
    id="modal-action-decision"
    aria-labelledby="modal-action-decision-heading"
    className="space-y-5"
  >
    <header className="border border-primary/20 bg-primary/5 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium text-primary">
          Decisions 03–10 · synchronized
        </p>
        <span className="rounded-full border border-primary/20 bg-card px-2.5 py-1 text-xs font-medium text-primary">
          Partial V1 contract
        </span>
      </div>
      <h2
        id="modal-action-decision-heading"
        className="mt-3 max-w-3xl text-2xl font-light leading-8"
      >
        Accepted dialog behavior
      </h2>
      <p className="mt-2 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
        These rules now replace the earlier action and overflow comparisons.
        Outcome composition, illustration style, and focus verification remain
        unresolved. The adaptive phone shell is defined with the canonical
        Dialog.
      </p>
    </header>

    <div className="grid gap-px bg-secondary p-0.5 md:grid-cols-2">
      {ACCEPTED_DIALOG_RULES.map((rule) => (
        <article key={rule.title} className="bg-card p-5">
          <h3 className="text-base font-medium">{rule.title}</h3>
          <p className="mt-2 text-sm font-light leading-5 text-muted-foreground">
            {rule.detail}
          </p>
        </article>
      ))}
    </div>
  </section>
)

export default ModalActionDecision

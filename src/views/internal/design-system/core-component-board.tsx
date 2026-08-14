import CoreComponentScaleBoard from './core-component-scale-board'
import CoreComponentStateBoard from './core-component-state-board'
import { ComponentReviewReadiness } from './catalog-ui'

const CoreComponentBoard = () => (
  <section data-testid="core-component-board" className="space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Core component board</h2>
          <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-warning/30">
            Working candidates
          </span>
        </div>
        <p className="mt-1 text-sm font-light text-muted-foreground">
          Compare scale, shape and state across the library at a glance.
        </p>
      </div>
      <p className="text-xs font-light text-muted-foreground">
        Lab only · shared primitives unchanged
      </p>
    </div>

    <ComponentReviewReadiness
      testId="core-board-readiness"
      review={{
        status: 'exploration',
        scope:
          'Use this board only to compare scale and state hypotheses across families. It is not a library of reusable V1 components; follow each component detail page for canonical review.',
        dependencies: [
          { name: 'Button', status: 'canonical' },
          { name: 'Checkbox', status: 'canonical' },
          { name: 'IconButton', status: 'canonical' },
          { name: 'Remaining controls', status: 'provisional' },
        ],
      }}
    />

    <CoreComponentScaleBoard />
    <CoreComponentStateBoard />

    <div className="flex flex-wrap gap-2 border border-dashed border-border p-3 text-xs font-light text-muted-foreground">
      <span className="font-medium text-foreground">Next behavior boards:</span>
      <span>Menu / popover</span>
      <span>·</span>
      <span>Dialog / drawer</span>
      <span>·</span>
      <span>Table / pagination</span>
      <span>·</span>
      <span>Tooltip / toast</span>
    </div>
  </section>
)

export default CoreComponentBoard

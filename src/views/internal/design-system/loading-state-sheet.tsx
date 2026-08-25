import { Skeleton, Spinner } from '@/components/design-system-v1/loading'

export const SkeletonStateSheet = () => (
  <section data-testid="skeleton-state-sheet" className="space-y-5">
    <div>
      <p className="text-sm font-medium text-primary">Current baseline</p>
      <h2 className="mt-1 text-xl font-medium">Host-shaped skeletons</h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        The primitive supplies a neutral semantic surface and reduced-motion
        behavior. The host owns exact geometry so loading preserves the final
        metric, record, or table shape instead of repeating generic bars.
      </p>
    </div>
    <div className="grid gap-6 border border-border bg-card p-5 xl:grid-cols-3">
      <div className="space-y-2">
        <Skeleton className="h-5 w-24 rounded" />
        <Skeleton className="h-6 w-36 rounded" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3 rounded" />
          <Skeleton className="h-4 w-1/3 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-full rounded-full" />
        <Skeleton className="h-8 w-full rounded-full" />
      </div>
    </div>
  </section>
)

export const SpinnerStateSheet = () => (
  <section data-testid="spinner-state-sheet" className="space-y-5">
    <div>
      <p className="text-sm font-medium text-primary">Current baseline</p>
      <h2 className="mt-1 text-xl font-medium">Short indeterminate activity</h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        Use only for short inline or locally blocked work. Known content
        geometry uses Skeleton; longer work must escalate to informative
        progress.
      </p>
    </div>
    <div className="flex items-center gap-6 border border-border bg-card p-5">
      <Spinner label="Processing status" size={14} />
      <Spinner label="Refreshing quote" size={16} />
      <Spinner label="Loading local region" size={24} />
    </div>
  </section>
)

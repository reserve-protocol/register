import { ArrowRight, Check, CircleDashed } from 'lucide-react'

import { Button } from '@/components/button'
import {
  Field,
  FieldLabel,
  TextArea,
  TextInput,
} from '@/components/design-system-v1/field'
import { Select, SelectTrigger } from '@/components/design-system-v1/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/design-system-v1/tabs'

const ShapeStudy = () => (
  <section
    id="radius-closure-review"
    data-testid="radius-closure-review"
    className="space-y-8"
    aria-labelledby="radius-closure-review-title"
  >
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="radius-closure-review-title" className="text-xl font-medium">
          Radius working baseline
        </h2>
        <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
          Current baseline
        </span>
      </div>
      <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        The semantic roles are accepted and no longer block subsequent work. The
        current 0 / 8 / full values are a working mapping, not an irreversible
        commitment; complex screens may justify tuning them while preserving the
        role taxonomy.
      </p>
    </div>

    <section
      data-testid="radius-established-rules"
      className="space-y-4"
      aria-labelledby="radius-established-rules-title"
    >
      <div>
        <h3
          id="radius-established-rules-title"
          className="text-base font-medium leading-6"
        >
          Already established
        </h3>
        <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
          These roles come directly from accepted component owners and should
          not require another visual choice.
        </p>
      </div>
      <div className="grid gap-px bg-border lg:grid-cols-3">
        <RadiusRule
          role="Structural region"
          value="0px"
          copy="Page regions, cards, dialogs, and rich records stay square by default. Transaction amount input/output regions use the reviewed 8px contained-object role; replacement states preserve that same boundary."
        />
        <RadiusRule
          role="Contained object"
          value="8px"
          copy="Multiline fields, menus, popovers, tooltips, thumbnails, and framed messages use restrained containment."
        />
        <RadiusRule
          role="Atomic control"
          value="Full"
          copy="Buttons, one-row fields and selects, tabs, segmented controls, pills, switches, and circular actions use complete rounding."
        />
      </div>
    </section>

    <StudyPanel
      title="Accepted component owners together"
      description="The examples below render the canonical Button, Field, TextArea, and Tabs owners rather than lab-only approximations."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Button>Review proposal</Button>
            <Button tone="secondary">Preview</Button>
          </div>
          <Field>
            <FieldLabel htmlFor="radius-review-name">Proposal name</FieldLabel>
            <TextInput
              id="radius-review-name"
              readOnly
              value="Reduce collateral exposure"
            />
          </Field>
          <Tabs defaultValue="overview">
            <TabsList size="compact">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="governance">Governance</TabsTrigger>
              <TabsTrigger value="holders">Holders</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Field>
          <FieldLabel htmlFor="radius-review-rationale">
            Proposal rationale
          </FieldLabel>
          <TextArea
            id="radius-review-rationale"
            readOnly
            value="Explain why the proposed change improves the basket while preserving the information reviewers need to make a decision."
          />
        </Field>
      </div>
    </StudyPanel>

    <StudyPanel
      title="Structure and containment in context"
      description="Square structural regions sit on the accepted beige seam; restrained 8px objects live inside the white content surface."
    >
      <div className="bg-secondary p-0.5">
        <div className="grid gap-px bg-secondary lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,1fr)]">
          <div className="bg-card p-6">
            <p className="text-base font-medium leading-6">Rebalance preview</p>
            <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
              Review the next operation before it becomes available.
            </p>
            <div className="mt-6 rounded-lg border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-4 text-sm font-light leading-5">
                <span className="text-muted-foreground">Auction target</span>
                <span className="font-medium">WETH → USDC</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-4 text-sm font-light leading-5">
                <span className="text-muted-foreground">Maximum slippage</span>
                <span className="font-medium tabular-nums">0.50%</span>
              </div>
            </div>
          </div>
          <div className="bg-card p-6">
            <p className="text-sm font-medium leading-5">Execution</p>
            <Select>
              <SelectTrigger className="mt-4">
                <span>Permissionless</span>
              </SelectTrigger>
            </Select>
          </div>
        </div>
      </div>
    </StudyPanel>

    <section
      data-testid="radius-review-boundary"
      className="space-y-4"
      aria-labelledby="radius-review-boundary-title"
    >
      <div>
        <h3
          id="radius-review-boundary-title"
          className="text-base font-medium leading-6"
        >
          Deferred real-screen evidence
        </h3>
        <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
          Structural reveals belong to specific layouts rather than individual
          components today. Their value and eventual owner remain open until a
          complex composition provides evidence.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <BoundaryOption
          title="Working mapping · 0 / 8 / full"
          detail="Use square structural regions, 8px contained objects, and fully rounded atomic controls as the current baseline. Real screens may tune the first two values without changing the accepted categories."
          recommended
        >
          <RegionPreview />
        </BoundaryOption>
        <BoundaryOption
          title="Deferred · structural reveal"
          detail="A 16px reveal remains one possible layout-owned treatment, not a shared Card or container default. Future repeated usage may identify a more specific owner."
        >
          <RegionPreview rounded />
        </BoundaryOption>
      </div>

      <div className="grid gap-3 border border-primary/20 bg-primary/5 p-5 sm:grid-cols-[auto_minmax(0,1fr)]">
        <Check className="mt-0.5 size-5 text-primary" />
        <div>
          <p className="text-sm font-medium leading-5">Decision recorded</p>
          <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
            Use the semantic role taxonomy and current 0 / 8 / full mapping
            without blocking further work. Revisit values and structural reveals
            when complex layouts provide stronger evidence.
          </p>
        </div>
      </div>
    </section>
  </section>
)

const RadiusRule = ({
  role,
  value,
  copy,
}: {
  role: string
  value: string
  copy: string
}) => (
  <article className="bg-card p-5">
    <div className="flex items-center gap-2">
      <Check className="size-4 text-primary" />
      <p className="text-sm font-medium leading-5">{role}</p>
    </div>
    <p className="mt-4 text-2xl font-light leading-8">{value}</p>
    <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
      {copy}
    </p>
  </article>
)

const StudyPanel = ({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) => (
  <article className="border border-border bg-card">
    <div className="border-b border-border p-5">
      <h3 className="text-base font-medium leading-6">{title}</h3>
      <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
    <div className="bg-background p-5 sm:p-6">{children}</div>
  </article>
)

const BoundaryOption = ({
  children,
  detail,
  recommended = false,
  title,
}: {
  children: React.ReactNode
  detail: string
  recommended?: boolean
  title: string
}) => (
  <article className="border border-border bg-card p-5">
    <div className="flex items-start gap-3">
      {recommended ? (
        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
      ) : (
        <CircleDashed className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      )}
      <div>
        <h4 className="text-sm font-medium leading-5">{title}</h4>
        <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
          {detail}
        </p>
      </div>
    </div>
    <div className="mt-5">{children}</div>
  </article>
)

const RegionPreview = ({ rounded = false }: { rounded?: boolean }) => (
  <div className="bg-secondary p-0.5">
    <div
      data-testid={
        rounded ? 'radius-deferred-reveal' : 'radius-recommended-structure'
      }
      className={`grid min-h-36 grid-cols-[minmax(0,1fr)_6rem] overflow-hidden bg-card ${rounded ? 'rounded-r-2xl' : ''}`}
    >
      <div className="p-5">
        <p className="text-sm font-medium leading-5">Governance</p>
        <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
          Three proposals need review.
        </p>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
          Review proposals <ArrowRight className="size-4" />
        </span>
      </div>
      <div className="bg-muted" />
    </div>
  </div>
)

export default ShapeStudy

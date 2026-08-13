import { ArrowRight, Check, X } from 'lucide-react'
import { StudyCard } from './layout-study-card'

export const ProgressiveWorkflowStudy = () => (
  <StudyCard
    label="Progressive workflow · preserve earned expansion"
    copy="Automated mint proves that a route can change layout without being inconsistent. The expansion is valid because the task changes from one decision to simultaneous work regions."
  >
    <div className="grid items-center gap-4 p-5 lg:grid-cols-[1fr_auto_1.6fr]">
      <WorkflowStage
        label="Focused opening"
        detail="One intent or prerequisite"
      >
        <div className="mx-auto h-36 w-[58%] bg-card" />
      </WorkflowStage>
      <ArrowRight className="mx-auto hidden h-5 w-5 text-primary lg:block" />
      <WorkflowStage
        label="Expanded workbench"
        detail="Input summary and execution detail must be read together"
      >
        <div className="grid h-36 grid-cols-2 gap-0.5 bg-secondary">
          <div className="bg-card" />
          <div className="bg-card" />
        </div>
      </WorkflowStage>
    </div>
    <div className="border-t border-secondary p-5 text-sm font-light leading-6 text-muted-foreground">
      Apply the same logic to proposal creation: a focused intent choice can be
      valid, then expand when form and review must coexist. Do not force the
      wider shell merely to make every step geometrically identical.
    </div>
  </StudyCard>
)

export const FullWidthContextStudy = () => (
  <StudyCard
    label="Full-width context above regions · conditional pattern"
    copy="The opened proposal layout can keep a spanning lead only when that information changes how every region below should be interpreted."
  >
    <div className="grid gap-px bg-secondary lg:grid-cols-2">
      <ContextRule
        good
        title="Use it for shared state"
        copy="Proposal identity, lifecycle status, deadline, and actions govern both the long-form content and the voting evidence below."
      />
      <ContextRule
        title="Do not use it for decoration"
        copy="A generic hero, duplicated summary, or unrelated promotion should live in its owning region rather than forcing an extra page band."
      />
    </div>
  </StudyCard>
)

const WorkflowStage = ({
  label,
  detail,
  children,
}: {
  label: string
  detail: string
  children: React.ReactNode
}) => (
  <div className="bg-secondary p-4">
    {children}
    <p className="mt-4 text-sm font-medium">{label}</p>
    <p className="mt-1 text-xs font-light text-muted-foreground">{detail}</p>
  </div>
)

const ContextRule = ({
  good = false,
  title,
  copy,
}: {
  good?: boolean
  title: string
  copy: string
}) => (
  <div className="bg-card p-5">
    <div className="bg-secondary p-0.5">
      <div className="flex h-16 items-center bg-card px-4">
        <div className="h-2 w-28 bg-muted" />
      </div>
      <div className="mt-0.5 grid h-28 grid-cols-[1.5fr_1fr] gap-0.5">
        <div className="bg-card" />
        <div className="bg-card" />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2">
      {good ? (
        <Check className="h-4 w-4 text-primary" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" />
      )}
      <p className="text-sm font-medium">{title}</p>
    </div>
    <p className="mt-2 text-xs font-light leading-5 text-muted-foreground">
      {copy}
    </p>
  </div>
)

import {
  AxisSpecimen,
  FormInsetSpecimen,
  InsetSpecimen,
  RecommendedSpacingRules,
  ResponsiveInsetSpecimens,
  RowRhythmSpecimens,
  RulePrompt,
  SpacingLadder,
  StudyCard,
} from './spacing-rhythm-specimens'

const SpacingRhythmStudy = () => (
  <section
    id="spacing-rhythm-study"
    className="scroll-mt-28 space-y-4"
    aria-labelledby="spacing-rhythm-heading"
  >
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="spacing-rhythm-heading" className="text-xl font-semibold">
          Spacing and layout rhythm
        </h2>
        <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-warning/30">
          Accepted provisional foundation
        </span>
      </div>
      <p className="mt-1 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
        Compare equivalent content to choose layout distances, content insets,
        nested alignment, form rhythm, and data density. Control padding remains
        governed by the separate geometry study.
      </p>
    </div>

    <RecommendedSpacingRules />
    <SpacingLadder />

    <div className="grid gap-5 xl:grid-cols-2">
      <StudyCard
        label="Direct content inset"
        description="Should an ordinary section start at 16px or 24px? The content and type are identical."
      >
        <div className="grid gap-3 bg-secondary p-0.5 sm:grid-cols-2">
          <InsetSpecimen inset="16px" className="p-4" />
          <InsetSpecimen inset="24px" className="p-6" recommended />
        </div>
      </StudyCard>

      <StudyCard
        label="Shared 24px content axis"
        description="Direct content uses 24px. A nested object reaches the same axis with an 8px outer inset and 16px inner padding."
      >
        <div className="grid gap-3 bg-secondary p-0.5 sm:grid-cols-2">
          <AxisSpecimen label="Direct · 24px" direct />
          <AxisSpecimen label="Nested · 8px + 16px" />
        </div>
      </StudyCard>
    </div>

    <div className="grid gap-5 xl:grid-cols-2">
      <StudyCard
        label="Form surface inset"
        description="The contained form is the default. A focused tool may use the wider 8px shell pattern consistently across the whole surface; it is not selected control by control."
      >
        <div className="grid gap-3 bg-secondary p-0.5 sm:grid-cols-2">
          <FormInsetSpecimen
            label="Contained form · recommended"
            value="24px control edge"
          />
          <FormInsetSpecimen
            label="Focused tool exception"
            value="8px shell + 16px inset"
            wideControls
          />
        </div>
      </StudyCard>

      <StudyCard
        label="Responsive content inset"
        description="The recommendation steps ordinary section padding down on narrow layouts without changing the internal component geometry."
      >
        <ResponsiveInsetSpecimens />
      </StudyCard>
    </div>

    <StudyCard
      label="Table and list row rhythm"
      description="Use fixed baselines for single-line rows, but let richer identity and action content determine final height from vertical padding."
    >
      <RowRhythmSpecimens />
    </StudyCard>

    <div className="grid gap-2 text-sm font-light text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
      <RulePrompt title="Tight text stack">
        Recommended: 4px between a heading and its supporting explanation; use
        8px when the next object is a distinct control or content group.
      </RulePrompt>
      <RulePrompt title="Ordinary section inset">
        Recommended: 24px on normal desktop sections; 16px for nested objects
        and narrow product layouts.
      </RulePrompt>
      <RulePrompt title="Form rhythm and mode">
        Accepted start: 8px within one field and 24px between groups. Normal
        forms use a 24px control edge; every shell may reach 8px only when the
        whole surface is a focused control tool such as Zapper.
      </RulePrompt>
      <RulePrompt title="Rows follow content">
        Accepted start: 48px is the default single-line row; 40px is an explicit
        dense-data mode. Rich rows expand from their content. Detailed table
        anatomy remains a component-family decision.
      </RulePrompt>
    </div>
  </section>
)

export default SpacingRhythmStudy

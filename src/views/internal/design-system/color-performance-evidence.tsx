import {
  CURRENT_NEUTRAL_EVIDENCE,
  CURRENT_PERFORMANCE_DIRECTIONS,
  CURRENT_PERFORMANCE_FILLS,
  CURRENT_PRELAUNCH_EVIDENCE,
} from './color-performance-data'

const ColorPerformanceEvidence = () => (
  <section>
    <h3 className="font-semibold">Current performance implementation</h3>
    <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
      Home, Discover, and Index overview share these source values. Highlighted
      Home and overview lines use a vertical gradient; Discover sparklines use
      the same stops horizontally. Home also derives its translucent area fill
      from the dot color. Dark theme currently keeps the default chart values;
      a separate dark-surface set is defined but has no product consumer.
    </p>

    <div className="mt-4 grid gap-3 lg:grid-cols-2">
      {CURRENT_PERFORMANCE_DIRECTIONS.map((direction) => (
        <article
          key={direction.name}
          className="rounded-xl border border-border bg-card p-4"
        >
          <h4 className="font-medium">{direction.name}</h4>
          <div className="mt-4 space-y-4">
            <GradientEvidence
              label="Homepage and overview line"
              start={direction.defaultLine.start}
              end={direction.defaultLine.end}
            />
            <GradientEvidence
              label="Defined dark-surface line · unused"
              start={direction.definedDarkSurfaceLine.start}
              end={direction.definedDarkSurfaceLine.end}
            />
            <FillEvidence defaultDot={direction.defaultDot} />
            <div className="grid gap-3 sm:grid-cols-2">
              <ColorPair
                label="Dot"
                firstLabel="Default"
                first={direction.defaultDot}
                secondLabel="Defined dark-surface · unused"
                second={direction.definedDarkSurfaceDot}
              />
              <ColorPair
                label="Performance text"
                firstLabel="Light"
                first={direction.lightText}
                secondLabel="Dark"
                second={direction.darkText}
              />
            </div>
          </div>
        </article>
      ))}
    </div>

    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <NeutralEvidence />
      <PreLaunchEvidence />
    </div>
  </section>
)

const FillEvidence = ({
  defaultDot,
}: {
  defaultDot: string
}) => (
  <div>
    <p className="text-xs font-medium">Derived area fills</p>
    <div className="mt-2 grid grid-cols-3 gap-2">
      <FillValue
        label="Home area fill"
        color={defaultDot}
        opacity={CURRENT_PERFORMANCE_FILLS.homeStartOpacity}
      />
      <FillValue
        label="Overview area fill"
        color={defaultDot}
        opacity={CURRENT_PERFORMANCE_FILLS.overviewStartOpacity}
      />
      <FillValue
        label="Dark-theme overview fill"
        color={defaultDot}
        opacity={CURRENT_PERFORMANCE_FILLS.overviewStartOpacity}
      />
    </div>
  </div>
)

const FillValue = ({
  label,
  color,
  opacity,
}: {
  label: string
  color: string
  opacity: number
}) => {
  const opacityPercent = Math.round(opacity * 100)
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')

  return (
    <div className="min-w-0">
      <div
        aria-label={`${label}: ${color} at ${opacityPercent}% to transparent`}
        className="h-12 rounded-md ring-1 ring-inset ring-foreground/15"
        style={{
          background: `linear-gradient(180deg, ${color}${alpha}, transparent)`,
        }}
      />
      <p className="mt-1 text-[10px] font-medium leading-4">{label}</p>
      <code className="block text-[10px] text-muted-foreground">
        {opacityPercent}% → 0% opacity
      </code>
    </div>
  )
}

const GradientEvidence = ({
  label,
  start,
  end,
}: {
  label: string
  start: string
  end: string
}) => (
  <div>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="text-xs font-medium">{label}</span>
      <code className="text-xs text-muted-foreground">
        {start} → {end}
      </code>
    </div>
    <div
      aria-label={`${label}: ${start} to ${end}`}
      className="mt-2 h-8 rounded-lg ring-1 ring-inset ring-foreground/15"
      style={{ background: `linear-gradient(90deg, ${start}, ${end})` }}
    />
  </div>
)

const ColorPair = ({
  label,
  firstLabel,
  first,
  secondLabel,
  second,
}: {
  label: string
  firstLabel: string
  first: string
  secondLabel: string
  second: string
}) => (
  <div>
    <p className="text-xs font-medium">{label}</p>
    <div className="mt-2 flex gap-2">
      <ColorValue label={firstLabel} value={first} />
      <ColorValue label={secondLabel} value={second} />
    </div>
  </div>
)

const ColorValue = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0 flex-1">
    <div
      aria-label={`${label}: ${value}`}
      className="h-7 rounded-md ring-1 ring-inset ring-foreground/15"
      style={{ backgroundColor: value }}
    />
    <code className="mt-1 block truncate text-[10px] text-muted-foreground">
      {value}
    </code>
  </div>
)

const NeutralEvidence = () => (
  <div className="rounded-xl border border-border bg-card p-4">
    <h4 className="font-medium">Neutral</h4>
    <p className="mt-1 text-xs leading-5 text-muted-foreground">
      Flat performance uses explicit stroke and dot treatments.
    </p>
    <div className="mt-3 space-y-2 text-xs">
      <EvidenceValue
        label="Default stroke / dot"
        value={`${CURRENT_NEUTRAL_EVIDENCE.default.stroke} · ${CURRENT_NEUTRAL_EVIDENCE.default.dot}`}
      />
      <EvidenceValue
        label="Defined dark-surface stroke / dot · unused"
        value={`${CURRENT_NEUTRAL_EVIDENCE.darkSurface.stroke} · ${CURRENT_NEUTRAL_EVIDENCE.darkSurface.dot}`}
      />
    </div>
  </div>
)

const PreLaunchEvidence = () => (
  <div className="rounded-xl border border-border bg-card p-4">
    <h4 className="font-medium">Pre-launch</h4>
    <p className="mt-1 text-xs leading-5 text-muted-foreground">
      Reference periods use translucent strokes and dots in both surface modes.
    </p>
    <div className="mt-3 space-y-2 text-xs">
      <EvidenceValue
        label="Default stroke"
        value={CURRENT_PRELAUNCH_EVIDENCE.default.stroke}
      />
      <EvidenceValue
        label="Default dot"
        value={`${CURRENT_PRELAUNCH_EVIDENCE.default.dot} @ ${Math.round(CURRENT_PRELAUNCH_EVIDENCE.default.dotOpacity * 100)}%`}
      />
      <EvidenceValue
        label="Defined dark-surface stroke · unused"
        value={CURRENT_PRELAUNCH_EVIDENCE.darkSurface.stroke}
      />
      <EvidenceValue
        label="Defined dark-surface dot · unused"
        value={`${CURRENT_PRELAUNCH_EVIDENCE.darkSurface.dot} @ ${Math.round(CURRENT_PRELAUNCH_EVIDENCE.darkSurface.dotOpacity * 100)}%`}
      />
    </div>
  </div>
)

const EvidenceValue = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2 first:border-t-0 first:pt-0">
    <span className="text-muted-foreground">{label}</span>
    <code className="break-all text-right">{value}</code>
  </div>
)

export default ColorPerformanceEvidence

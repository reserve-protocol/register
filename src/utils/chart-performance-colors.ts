export type PerformanceDirection = 'positive' | 'negative' | 'neutral'

export const PERFORMANCE_COLORS = {
  positive: {
    start: '#55D6A2',
    end: '#159C72',
    dot: '#24B886',
  },
  negative: {
    start: '#FF8A6A',
    end: '#D84F3A',
    dot: '#E85F45',
  },
  neutral: {
    stroke: 'hsl(var(--primary))',
    dot: '#6F6456',
  },
  preLaunch: {
    stroke: 'rgba(111, 100, 86, 0.58)',
    dot: '#6F6456',
    dotOpacity: 0.62,
  },
  darkSurface: {
    positive: {
      start: '#6BE4B2',
      end: '#24B886',
      dot: '#55D6A2',
    },
    negative: {
      start: '#FF9C82',
      end: '#E85F45',
      dot: '#FF8A6A',
    },
    neutral: {
      stroke: '#E5EEFA',
      dot: '#E5EEFA',
    },
    preLaunch: {
      stroke: 'rgba(229, 238, 250, 0.45)',
      dot: '#E5EEFA',
      dotOpacity: 0.6,
    },
  },
} as const

// Text classes for the same palette (light = end, dark = start). Kept as
// literal class strings because Tailwind's scanner can't see computed values.
export const PERFORMANCE_TEXT_CLASSES = {
  positive: 'text-[#11845F] dark:text-[#55D6A2]',
  negative: 'text-[#C24130] dark:text-[#FF8A6A]',
} as const

type PerformanceColorMode = 'default' | 'darkSurface'

export const getPerformanceColorSet = (
  mode: PerformanceColorMode = 'default'
) =>
  mode === 'darkSurface' ? PERFORMANCE_COLORS.darkSurface : PERFORMANCE_COLORS

export const getPerformanceDirection = (
  values: { value: number }[]
): PerformanceDirection => {
  if (values.length < 2) return 'neutral'

  const firstValue = values[0].value
  const lastValue = values[values.length - 1].value

  if (lastValue > firstValue) return 'positive'
  if (lastValue < firstValue) return 'negative'
  return 'neutral'
}

export const getPerformanceStroke = (
  direction: PerformanceDirection,
  gradientId: string,
  mode: PerformanceColorMode = 'default'
) => {
  if (direction === 'positive' || direction === 'negative') {
    return `url(#${gradientId})`
  }

  return getPerformanceColorSet(mode).neutral.stroke
}

export type PerformanceDirection = 'positive' | 'negative' | 'neutral'

export const PERFORMANCE_COLORS = {
  positive: {
    start: '#A2BB6E',
    end: '#657D32',
    dot: '#819D44',
  },
  negative: {
    start: '#D66A4A',
    end: '#9F4A3D',
    dot: '#B85F50',
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
      start: '#C4D98B',
      end: '#88A94A',
      dot: '#A6C66A',
    },
    negative: {
      start: '#F07A58',
      end: '#C76B5D',
      dot: '#D88B7D',
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

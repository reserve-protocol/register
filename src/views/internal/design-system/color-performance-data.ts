import { PERFORMANCE_COLORS } from '@/utils/chart-performance-colors'

export interface CurrentPerformanceDirection {
  name: 'Positive' | 'Negative'
  defaultLine: { start: string; end: string }
  definedDarkSurfaceLine: { start: string; end: string }
  defaultDot: string
  definedDarkSurfaceDot: string
  lightText: string
  darkText: string
}

export interface CandidatePerformanceToken {
  token: string
  role: string
  nearestCurrentValue: string
}

export const CURRENT_PERFORMANCE_FILLS = {
  homeStartOpacity: 0.5,
  overviewStartOpacity: 0.48,
  endOpacity: 0,
} as const

export const CURRENT_NEUTRAL_EVIDENCE = {
  default: PERFORMANCE_COLORS.neutral,
  darkSurface: PERFORMANCE_COLORS.darkSurface.neutral,
} as const

export const CURRENT_PRELAUNCH_EVIDENCE = {
  default: PERFORMANCE_COLORS.preLaunch,
  darkSurface: PERFORMANCE_COLORS.darkSurface.preLaunch,
} as const

export const CURRENT_PERFORMANCE_DIRECTIONS: CurrentPerformanceDirection[] = [
  {
    name: 'Positive',
    defaultLine: PERFORMANCE_COLORS.positive,
    definedDarkSurfaceLine: PERFORMANCE_COLORS.darkSurface.positive,
    defaultDot: PERFORMANCE_COLORS.positive.dot,
    definedDarkSurfaceDot: PERFORMANCE_COLORS.darkSurface.positive.dot,
    lightText: '#11845F',
    darkText: '#55D6A2',
  },
  {
    name: 'Negative',
    defaultLine: PERFORMANCE_COLORS.negative,
    definedDarkSurfaceLine: PERFORMANCE_COLORS.darkSurface.negative,
    defaultDot: PERFORMANCE_COLORS.negative.dot,
    definedDarkSurfaceDot: PERFORMANCE_COLORS.darkSurface.negative.dot,
    lightText: '#C24130',
    darkText: '#FF8A6A',
  },
]

export const V1_PERFORMANCE_TOKEN_GROUPS: Array<{
  name: 'Positive' | 'Negative'
  tokens: CandidatePerformanceToken[]
}> = CURRENT_PERFORMANCE_DIRECTIONS.map((direction) => {
  const prefix = `--data-${direction.name.toLowerCase()}`

  return {
    name: direction.name,
    tokens: [
      {
        token: prefix,
        role: 'Main · dot, icon, and one gradient endpoint',
        nearestCurrentValue: direction.defaultDot,
      },
      {
        token: `${prefix}-emphasis`,
        role: 'Second gradient endpoint',
        nearestCurrentValue: direction.defaultLine.start,
      },
      {
        token: `${prefix}-foreground`,
        role: 'Accessible text and numbers',
        nearestCurrentValue: direction.lightText,
      },
    ],
  }
})

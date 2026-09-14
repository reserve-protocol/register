import type { TooltipProps } from 'recharts'

export type ChartInspection = { timestamp: number; value: number }

export function inspectionFromPayload(
  payload: TooltipProps<number, string>['payload'],
  valueKey: string
): ChartInspection | undefined {
  const timestamp = payload?.[0]?.payload?.timestamp
  const value = payload?.[0]?.payload?.[valueKey]
  return Number.isFinite(timestamp) && Number.isFinite(value)
    ? { timestamp, value }
    : undefined
}

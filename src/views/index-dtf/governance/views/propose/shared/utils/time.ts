import { TIME_CONSTANTS } from '../types'
import { parseDuration } from '@/utils'

/**
 * Convert seconds to days
 */
export const secondsToDays = (seconds: number): number => {
  return seconds / TIME_CONSTANTS.SECONDS_PER_DAY
}

/**
 * Convert days to seconds
 */
export const daysToSeconds = (days: number): number => {
  return days * TIME_CONSTANTS.SECONDS_PER_DAY
}

/**
 * Convert seconds to human-readable format
 * @param seconds - Time in seconds
 * @returns Human-readable string (e.g., "2 days", "12 hours", "30 minutes")
 */
export const humanizeTimeFromSeconds = (seconds: number): string => {
  // Round to nearest second to avoid floating point precision issues
  const roundedSeconds = Math.round(seconds)
  
  // Use parseDuration for better handling of time formatting
  return parseDuration(roundedSeconds, {
    largest: 2,
    units: ['d', 'h', 'm', 's'],
    delimiter: ' ',
    spacer: ' ',
  })
}

/**
 * Format duration for display with appropriate unit
 * @param seconds - Time in seconds
 * @returns Object with value and unit
 */
export const formatDuration = (seconds: number): { value: number; unit: string } => {
  const days = secondsToDays(seconds)
  
  if (days >= 1) {
    return { value: days, unit: 'day' }
  }
  
  const hours = seconds / TIME_CONSTANTS.SECONDS_PER_HOUR
  if (hours >= 1) {
    return { value: hours, unit: 'hour' }
  }
  
  const minutes = seconds / TIME_CONSTANTS.SECONDS_PER_MINUTE
  return { value: minutes, unit: 'minute' }
}
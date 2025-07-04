import { TIME_CONSTANTS } from '../types'

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
  const days = secondsToDays(seconds)
  
  if (days >= 1) {
    return `${days} day${days !== 1 ? 's' : ''}`
  }
  
  const hours = seconds / TIME_CONSTANTS.SECONDS_PER_HOUR
  if (hours >= 1) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }
  
  const minutes = seconds / TIME_CONSTANTS.SECONDS_PER_MINUTE
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`
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
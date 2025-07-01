import React from 'react'

interface GaugeIconProps {
  width?: number
  height?: number
  className?: string
}

/**
 * Simple gauge/speedometer icon
 */
export function GaugeIcon({ width = 16, height = 16, className }: GaugeIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M8 2C5.79086 2 4 3.79086 4 6C4 8.20914 5.79086 10 8 10C10.2091 10 12 8.20914 12 6C12 3.79086 10.2091 2 8 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M6 6L8 8L10 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 12V14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11 11L12 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5 11L4 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default GaugeIcon
import type { SVGProps } from 'react'

// PLACEHOLDER approximation of the Ondo Finance mark (concentric-wave disc).
// Swap the paths for the official brand asset before this ships.
const Ondo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="12" cy="12" r="11" fill="currentColor" />
    <path
      d="M4.5 14.5c2-1.6 4.5-2.5 7.5-2.5s5.5.9 7.5 2.5"
      stroke="hsl(var(--card))"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M6 10.5c1.7-1.3 3.7-2 6-2s4.3.7 6 2"
      stroke="hsl(var(--card))"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M8.5 7c1-.6 2.2-1 3.5-1s2.5.4 3.5 1"
      stroke="hsl(var(--card))"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

export default Ondo

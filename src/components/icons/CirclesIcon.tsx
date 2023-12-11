import * as React from 'react'
import { SVGProps } from 'react'
const CirclesIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={13}
    height={12}
    fill="none"
    {...props}
  >
    <g strokeWidth={1.092} clipPath="url(#circles-icon)">
      <rect
        width={4.301}
        height={4.301}
        x={0.967}
        y={0.546}
        stroke="#0052FF"
        rx={2.151}
      />
      <rect
        width={4.301}
        height={4.301}
        x={0.967}
        y={7.153}
        stroke="#83C7FF"
        rx={2.151}
      />
      <rect
        width={4.301}
        height={4.301}
        x={7.573}
        y={0.546}
        stroke="#F2A900"
        rx={2.151}
      />
      <rect
        width={4.301}
        height={4.301}
        x={7.573}
        y={7.153}
        stroke="currentColor"
        rx={2.151}
      />
    </g>
    <defs>
      <clipPath id="circles-icon">
        <path fill="#fff" d="M.42 0h12v12h-12z" />
      </clipPath>
    </defs>
  </svg>
)
export default CirclesIcon

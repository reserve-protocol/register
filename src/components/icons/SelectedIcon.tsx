import * as React from 'react'
import { SVGProps } from 'react'

const SelectedIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x={4.5}
      y={4.5}
      width={15}
      height={15}
      rx={4.5}
      fill="#00FFBF"
      stroke="url(#a)"
    />
    <rect
      x={9}
      y={9}
      width={6}
      height={6}
      rx={3}
      fill="#fff"
      fillOpacity={0.79}
      stroke="#fff"
      strokeWidth={2}
    />
    <defs>
      <linearGradient
        id="a"
        x1={12}
        y1={4}
        x2={12}
        y2={20}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0.865} stopColor="#00FF7F" />
        <stop offset={1} stopColor="#01E271" />
      </linearGradient>
    </defs>
  </svg>
)

export default SelectedIcon

import * as React from 'react'

const TradersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={17}
    viewBox="0 0 16 17"
    fill="none"
    {...props}
  >
    <mask
      id="traders-mask"
      width={14}
      height={15}
      x={1}
      y={1}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: 'alpha',
      }}
    >
      <rect
        width={12.5}
        height={12.5}
        x={1.75}
        y={2.622}
        fill="#D9D9D9"
        stroke="#000"
        strokeWidth={1.5}
        rx={6.25}
      />
    </mask>
    <g mask="url(#traders-mark)">
      <rect
        width={12.5}
        height={12.5}
        x={1.75}
        y={2.622}
        stroke="#333"
        strokeWidth={1.5}
        rx={6.25}
      />
      <rect width={14} height={14} x={1} y={6.775} fill="#333" rx={7} />
    </g>
  </svg>
)
export default TradersIcon

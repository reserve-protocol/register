import { SVGProps } from 'react'

const StakeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24px"
    height="24px"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x={3.5}
      y={10.382}
      width={17}
      height={10.118}
      rx={1.088}
      stroke="currentColor"
    />
    <circle cx={12} cy={8.824} r={5.324} stroke="currentColor" />
    <path stroke="currentColor" d="M5.647 13.088h13.235" />
    <path d="M5.647 13.588h13.235v5.294H5.647z" />
  </svg>
)

export default StakeIcon

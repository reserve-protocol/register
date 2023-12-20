import { SVGProps } from 'react'
const CheckCircleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={22}
    height={22}
    fill="none"
    {...props}
  >
    <g strokeWidth={1.2} clipPath="url(#a)">
      <rect
        width={20.4}
        height={20.4}
        x={0.6}
        y={0.8}
        fill="#2150A9"
        stroke="#2150A9"
        rx={10.2}
      />
      <path stroke="#fff" d="m4.725 11 4.05 4.05 8.1-8.1" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 .2h21.6v21.6H0z" />
      </clipPath>
    </defs>
  </svg>
)
export default CheckCircleIcon

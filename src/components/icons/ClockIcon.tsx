import { SVGProps } from 'react'
const ClockIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={22}
    height={22}
    fill="none"
    {...props}
  >
    <g clipPath="url(#a)">
      <rect width={21.6} height={21.6} y={0.2} fill="#CCC" rx={10.8} />
      <path
        fill="#4C4C4C"
        fillRule="evenodd"
        stroke="#4C4C4C"
        strokeWidth={0.42}
        d="M16.875 13.025h-6.75v-6.75h.95v5.8h5.8v.95Z"
        clipRule="evenodd"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 .2h21.6v21.6H0z" />
      </clipPath>
    </defs>
  </svg>
)
export default ClockIcon

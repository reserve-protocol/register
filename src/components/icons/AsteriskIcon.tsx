import { SVGProps } from 'react'
const AsteriskIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    {...props}
  >
    <path
      stroke="currentColor"
      d="m8 8 5.04-5.04M8 8 2.96 2.96M8 8l-5.04 5.04M8 8l5.04 5.04M8 8h6.3M8 8V1.7M8 8H1.7M8 8v6.3"
    />
  </svg>
)
export default AsteriskIcon

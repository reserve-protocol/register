import { SVGProps } from 'react'
const AsteriskIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={21}
    height={20}
    fill="none"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeWidth={1.25}
      d="m10.5 10 6.3-6.3M10.5 10 4.2 3.7m6.3 6.3-6.3 6.3m6.3-6.3 6.3 6.3M10.5 10h7.875M10.5 10V2.125m0 7.875H2.625m7.875 0v7.875"
    />
  </svg>
)
export default AsteriskIcon

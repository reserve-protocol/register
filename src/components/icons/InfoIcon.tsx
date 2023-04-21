import { SVGProps } from 'react'

const InfoIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={14}
    height={14}
    fill="none"
    {...props}
  >
    <path
      stroke="currentColor"
      d="M7 7 1.96 1.96M7 7l5.04-5.04M7 7l5.04 5.04M7 7l-5.04 5.04M7 7H.7M7 7V.7M7 7h6.3M7 7v6.3"
    />
  </svg>
)

export default InfoIcon

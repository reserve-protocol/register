import { SVGProps } from 'react'

const IssuanceIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24px"
    height="24px"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle
      cx={9.146}
      cy={11.946}
      r={6.896}
      stroke="currentColor"
      strokeWidth={0.5}
    />
    <circle
      cx={15.031}
      cy={11.946}
      r={6.896}
      stroke="currentColor"
      strokeWidth={0.5}
    />
  </svg>
)

export default IssuanceIcon

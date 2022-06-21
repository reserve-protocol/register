import { SVGProps } from 'react'

const GovernanceIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="m15.208 18.13-.008.009-2.678 2.922a.75.75 0 0 1-1.084.024L8.794 18.44 3.01 12.38a.75.75 0 0 1 .012-1.049l8.449-8.448a.75.75 0 0 1 1.06 0l8.432 8.432a.75.75 0 0 1 0 1.06l-5.754 5.755Z"
      stroke="currentColor"
      strokeWidth={0.5}
    />
    <path
      d="m15.692 8.77-5.538 5.538-1.846-1.847"
      stroke="currentColor"
      strokeWidth={0.5}
    />
  </svg>
)

export default GovernanceIcon

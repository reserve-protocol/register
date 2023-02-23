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
      x="3"
      y="10.2646"
      width="18"
      height="10.7353"
      rx="1.5"
      stroke="currentColor"
    />
    <circle
      cx="12.0001"
      cy="8.64706"
      r="5.64706"
      fill="var(--theme-ui-colors-background)"
      stroke="currentColor"
    />
    <path stroke="currentColor" d="M5.033 13.177h13.971" />
    <rect
      x="5.0332"
      y="13.6765"
      width="13.9706"
      height="5.58824"
      fill="var(--theme-ui-colors-background)"
    />
  </svg>
)

export default StakeIcon

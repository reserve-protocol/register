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
      x={3}
      y={10.265}
      width={18}
      height={10.735}
      rx={1.5}
      stroke="currentColor"
    />
    <circle
      cx={12}
      cy={8.647}
      r={5.647}
      fill="var(--theme-ui-colors-background)"
      stroke="currentColor"
    />
    <path stroke="currentColor" d="M5.033 13.177h13.971" />
    <path
      fill="var(--theme-ui-colors-background)"
      d="M5.033 13.677h13.971v5.588H5.033z"
    />
  </svg>
)

export default StakeIcon

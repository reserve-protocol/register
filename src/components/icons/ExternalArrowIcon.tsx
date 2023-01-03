import { SVGProps } from 'react'

const ExternalArrowIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={16}
    height={16}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        d="M12.02 3.851H4.95m7.07 0v7.071m0-7.071-8.484 8.485"
        stroke="currentColor"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="CurrentColor" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)

export default ExternalArrowIcon

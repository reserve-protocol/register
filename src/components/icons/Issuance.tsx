import { SVGProps } from 'react'

const IssuanceIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={14}
    height={14}
    fill="none"
    {...props}
  >
    <g clipPath="url(#issuance-icon)">
      <path
        stroke="currentColor"
        strokeWidth={0.85}
        d="M9.492 7.002a4.533 4.533 0 1 1-9.067 0 4.533 4.533 0 0 1 9.067 0Z"
      />
      <path
        stroke="currentColor"
        strokeWidth={0.85}
        d="M13.575 7a4.533 4.533 0 1 1-9.067 0 4.533 4.533 0 0 1 9.067 0Z"
      />
      <path
        fill="currentColor"
        d="M7 12.688 8.094 14H5.906L7 12.687ZM7 1.313 8.094 0H5.906L7 1.313Z"
      />
    </g>
    <defs>
      <clipPath id="issuance-icon">
        <path fill="#fff" d="M0 0h14v14H0z" />
      </clipPath>
    </defs>
  </svg>
)

export default IssuanceIcon

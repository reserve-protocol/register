import { SVGProps } from 'react'

const CopyIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={16}
    height={16}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clip-path="url(#clip0_3954_145060)">
      <path
        d="M3 3.00085H10.5V10.5009H3V3.00085Z"
        fill="currentColor"
        opacity="35%"
      />
      <rect x="5.5" y="5.50098" width="7.5" height="7.5" fill="currentColor" />
    </g>
    <defs>
      <clipPath id="clip0_3954_145060">
        <rect
          width="16"
          height="16"
          fill="white"
          transform="translate(0 0.000854492)"
        />
      </clipPath>
    </defs>
  </svg>
)

export default CopyIcon

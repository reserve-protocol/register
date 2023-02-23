import { SVGProps } from 'react'

const ExternalArrowIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={16}
    height={16}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_3954_144970)">
      <path
        d="M12.0208 3.85103L4.94975 3.85103M12.0208 3.85103L12.0208 10.9221M12.0208 3.85103L3.53553 12.3363"
        stroke="#999999"
      />
    </g>
    <defs>
      <clipPath id="clip0_3954_144970">
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

export default ExternalArrowIcon

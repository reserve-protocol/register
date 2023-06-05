import { SVGProps } from 'react'

const GlobalMaxMintIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        stroke="currentColor"
        strokeWidth={0.7}
        d="M10.983 7.997a5.317 5.317 0 1 1-10.633 0 5.317 5.317 0 0 1 10.633 0Z"
      />
      <path
        fill="currentColor"
        d="M4.833 7.663C4.97 5.52 6.284 3.163 8 3.163c1 0 3.167 2.577 3.167 4.834 0 2.256-1.072 3.995-3.167 4.833-.833.333-3.316-2.805-3.167-5.167Z"
      />
      <path
        stroke="currentColor"
        strokeWidth={0.7}
        d="M15.65 7.997a5.317 5.317 0 1 1-10.633 0 5.317 5.317 0 0 1 10.633 0Z"
      />
      <path fill="red" d="M7.5-1.001H8v17h-.5z" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
export default GlobalMaxMintIcon
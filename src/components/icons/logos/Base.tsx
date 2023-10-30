import { SVGProps } from 'react'

const Base = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <g clipPath="url(#a)">
      <path fill="#0052FF" d="M10 20a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
      <path
        fill="#fff"
        d="M9.977 17.042a7.042 7.042 0 1 0-7.018-7.635h10.45v1.173H2.958a7.043 7.043 0 0 0 7.019 6.462Z"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
export default Base

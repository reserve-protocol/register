import { SVGProps } from 'react'

const TrendingIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#a)" stroke="#333">
      <path d="M9.111 3.64h3.89v4.056" strokeMiterlimit={5} />
      <path d="m12.965 3.64-4.31 4.958h-2.67L3 12.359" strokeMiterlimit={5} />
      <circle cx={4} cy={4} r={0.5} fill="#333" />
      <circle cx={12} cy={12} r={0.5} fill="#333" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)

export default TrendingIcon

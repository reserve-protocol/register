import { SVGProps } from 'react'

const WalletIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={20}
    height={20}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M2 7a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v6a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7Z"
      fill="#00FFBF"
    />
    <rect
      x={7}
      y={7}
      width={6}
      height={6}
      rx={3}
      fill="#fff"
      fillOpacity={0.79}
      stroke="#000"
      strokeWidth={2}
    />
    <path
      d="M7 3.333h6V.667H7v2.666ZM16.667 7v6h2.666V7h-2.666ZM13 16.667H7v2.666h6v-2.666ZM3.333 13V7H.667v6h2.666ZM7 16.667A3.667 3.667 0 0 1 3.333 13H.667A6.333 6.333 0 0 0 7 19.333v-2.666ZM16.667 13A3.667 3.667 0 0 1 13 16.667v2.666A6.333 6.333 0 0 0 19.333 13h-2.666ZM13 3.333A3.667 3.667 0 0 1 16.667 7h2.666A6.333 6.333 0 0 0 13 .667v2.666ZM7 .667A6.333 6.333 0 0 0 .667 7h2.666A3.667 3.667 0 0 1 7 3.333V.667Z"
      fill="url(#a)"
    />
    <defs>
      <linearGradient
        id="a"
        x1={10}
        y1={2}
        x2={10}
        y2={18}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0.865} stopColor="#00FF7F" />
        <stop offset={1} stopColor="#01E271" />
      </linearGradient>
    </defs>
  </svg>
)

export default WalletIcon

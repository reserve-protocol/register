import { SVGProps } from 'react'

const WalletIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x={0.5}
      y={0.5}
      width={15}
      height={15}
      rx={4.5}
      fill="#00FFBF"
      stroke="url(#a)"
    />
    <rect
      x={5}
      y={5}
      width={6}
      height={6}
      rx={3}
      fill="#fff"
      fillOpacity={0.79}
      stroke="#000"
      strokeWidth={2}
    />
    <defs>
      <linearGradient
        id="a"
        x1={8}
        y1={0}
        x2={8}
        y2={16}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0.865} stopColor="#00FF7F" />
        <stop offset={1} stopColor="#01E271" />
      </linearGradient>
    </defs>
  </svg>
)

export default WalletIcon

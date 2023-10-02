import { SVGProps } from 'react'

const BridgeBoxIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={24}
    fill="none"
    {...props}
  >
    <path fill="#999" d="M3.357 4h5.714v5.714H3.357z" />
    <path
      stroke="currentColor"
      strokeDasharray="1.14 1.14"
      strokeWidth={1.143}
      d="M10.214 6.857h4.571"
    />
    <rect
      width={5.714}
      height={5.714}
      x={15.929}
      y={4}
      fill="currentColor"
      rx={2.857}
    />
    <path fill="#999" d="M21.643 14.286h-5.714V20h5.714z" />
    <path
      stroke="#999"
      strokeDasharray="1.14 1.14"
      strokeWidth={1.143}
      d="M14.785 17.143h-4.571"
    />
    <rect
      width={5.714}
      height={5.714}
      fill="currentColor"
      rx={2.857}
      transform="matrix(-1 0 0 1 9.071 14.286)"
    />
  </svg>
)

export default BridgeBoxIcon

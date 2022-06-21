import { SVGProps } from 'react'

const AuctionsIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M3.614 19.689a.398.398 0 0 1 .007-.563l9.82-9.56 1.227 1.261-9.82 9.56a.398.398 0 0 1-.563-.008l-.671-.69ZM14.417 5.553l3.926 3.926-2.401 2.4-3.926-3.925 2.401-2.4Z"
      stroke="currentColor"
      strokeWidth={0.475}
    />
    <rect
      x={15.141}
      y={4.847}
      width={5.256}
      height={2.215}
      rx={0.398}
      transform="rotate(135 15.141 4.847)"
      stroke="currentColor"
      strokeWidth={0.475}
    />
    <rect
      x={20.664}
      y={10.37}
      width={5.256}
      height={2.215}
      rx={0.398}
      transform="rotate(135 20.664 10.37)"
      stroke="currentColor"
      strokeWidth={0.475}
    />
  </svg>
)

export default AuctionsIcon

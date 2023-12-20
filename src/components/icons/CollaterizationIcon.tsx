import { SVGProps } from 'react'
const CollaterizationIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    {...props}
  >
    <mask
      id="collicon"
      width={14}
      height={14}
      x={1}
      y={1}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: 'alpha',
      }}
    >
      <path fill="#D9D9D9" d="M1.699 1.7h12.6v12.6h-12.6z" />
    </mask>
    <g mask="url(#collicon)">
      <path
        fill="currentColor"
        d="M13.09 12.192a7.2 7.2 0 0 1-10.182 0l.916-.917a5.904 5.904 0 0 0 8.35 0l.916.917Z"
      />
    </g>
    <path
      fill="#B3B3B3"
      d="M13 6.7a5 5 0 1 1-10 0h1.4a3.6 3.6 0 0 0 7.2 0H13Z"
      opacity={0.5}
    />
    <path
      fill="gray"
      d="M10.305 2.263A5 5 0 0 0 3 6.703l1.4-.001a3.6 3.6 0 0 1 5.26-3.196l.645-1.243Z"
    />
    <path
      fill="#4C4C4C"
      d="M11.536 10.236a4.999 4.999 0 0 0-1.266-7.99l-.636 1.247a3.6 3.6 0 0 1 .912 5.753l.99.99Z"
    />
  </svg>
)
export default CollaterizationIcon

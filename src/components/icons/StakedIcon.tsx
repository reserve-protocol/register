import { SVGProps } from 'react'

const StakedIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    fill="none"
    {...props}
  >
    <mask
      id="staked-icon"
      width={14}
      height={14}
      x={1}
      y={1}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: 'alpha',
      }}
    >
      <path fill="#D9D9D9" d="M1.7 1.7h12.6v12.6H1.7z" />
    </mask>
    <g mask="url(#staked-icon)">
      <path
        fill="currentColor"
        d="M13.091 12.191a7.2 7.2 0 0 1-10.182 0l.917-.916a5.904 5.904 0 0 0 8.349 0l.916.916Z"
      />
    </g>
    <path
      fill="#B3B3B3"
      d="M13 6.7a5 5 0 1 1-10 0h1.4a3.6 3.6 0 0 0 7.2 0H13Z"
      opacity={0.5}
    />
    <path
      fill="gray"
      d="M10.305 2.263A5 5 0 0 0 3 6.703l1.4-.001a3.6 3.6 0 0 1 5.26-3.197l.645-1.242Z"
    />
    <path
      fill="#4C4C4C"
      d="M11.536 10.236a4.999 4.999 0 0 0-1.266-7.991l-.636 1.247a3.6 3.6 0 0 1 .912 5.754l.99.99Z"
    />
  </svg>
)
export default StakedIcon

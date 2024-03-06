import { SVGProps } from 'react'
const AlertIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={22}
    height={22}
    fill="none"
    {...props}
  >
    <g clipPath="url(#alert-icon)">
      <rect
        width={20.4}
        height={20.4}
        x={0.6}
        y={0.8}
        fill="#FF8A00"
        stroke="#FF8A00"
        strokeWidth={1.2}
        rx={10.2}
      />
      <path
        fill="#fff"
        d="m11.943 8.432-.472 5.745h-1.342l-.473-5.745V4.255h2.287v4.177ZM9.62 17.75v-2.42h2.362v2.42H9.62Z"
      />
    </g>
    <defs>
      <clipPath id="alert-icon">
        <path fill="#fff" d="M0 .2h21.6v21.6H0z" />
      </clipPath>
    </defs>
  </svg>
)
export default AlertIcon

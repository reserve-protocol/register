import { SVGProps } from 'react'

const CalculatorIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M16.5 3h-9A1.5 1.5 0 0 0 6 4.5v15A1.5 1.5 0 0 0 7.5 21h9a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 16.5 3ZM9 18h.75M14.25 18H15M11.625 18h.75M9 15h.75M14.25 15H15M11.625 15h.75M9 12h.75M14.25 12H15M11.625 12h.75M6 9h12"
      stroke="currentColor"
      strokeWidth={0.5}
      strokeMiterlimit={10}
    />
  </svg>
)

export default CalculatorIcon

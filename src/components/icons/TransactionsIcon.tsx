import { SVGProps } from 'react'

const TransactionsIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={24}
    viewBox="0 0 25 24"
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      stroke="#fff"
      strokeWidth={0.229}
      d="m21.93 9.571.05-.059-.045.063a.87.87 0 0 1 .3 1.02l.108.041-.107-.04a.96.96 0 0 1-.89.634H2.706V9.36h15.952l-.258-.204-4.447-3.522 1.169-1.473 6.809 5.41ZM6.638 14.895l4.29 3.495-1.192 1.449-6.547-5.383-.003-.002a.897.897 0 0 1-.278-1.023.974.974 0 0 1 .89-.609h18.194v1.87H6.388l.25.203Z"
    />
  </svg>
)

export default TransactionsIcon

import { SVGProps } from 'react'

const OverviewIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={25}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M6.995 21.5v-6.907H3.77v-2.82h3.225V10.77H3.77V8.012h3.225V3.5h7.326c1.922 0 3.343.457 4.264 1.37.923.904 1.383 2.3 1.383 4.186 0 1.43-.34 2.58-1.02 3.45-.68.862-1.629 1.46-2.843 1.796l4.122 7.198h-3.813l-3.786-6.913h-2.197V21.5H6.995Zm3.437-9.744h4.341c1.076 0 1.615-.598 1.615-1.796V8.113c0-.603-.12-1.034-.361-1.292-.232-.267-.65-.401-1.254-.401h-4.341v5.336Z"
      stroke="currentColor"
    />
  </svg>
)

export default OverviewIcon

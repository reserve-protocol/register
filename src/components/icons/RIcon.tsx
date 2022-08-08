import { SVGProps } from 'react'

const RIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24px"
    height="24px"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M3.975 19v-6.907H.75v-2.82h3.225V8.27H.75V5.512h3.225V1h7.327c1.921 0 3.343.457 4.264 1.37.922.904 1.383 2.3 1.383 4.186 0 1.43-.34 2.58-1.02 3.45-.68.862-1.63 1.46-2.843 1.796L17.207 19h-3.812l-3.787-6.913H7.411V19H3.975Zm3.437-9.744h4.342c1.076 0 1.615-.598 1.615-1.796V5.613c0-.603-.12-1.034-.362-1.292-.232-.267-.65-.401-1.253-.401H7.412v5.336Z"
      stroke="currentColor"
    />
  </svg>
)

export default RIcon

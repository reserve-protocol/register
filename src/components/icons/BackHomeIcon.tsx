import { SVGProps } from 'react'

const BackHomeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M4.355 19.1V9.092L12 3.146l7.645 5.946V19.1a.995.995 0 0 1-.995.995h-3.801V11.5h-5.7v8.595H5.35a.995.995 0 0 1-.995-.995ZM9.149 21H18.65a1.9 1.9 0 0 0 1.9-1.9V8.65L12 2 3.45 8.65V19.1a1.9 1.9 0 0 0 1.9 1.9h3.8Zm4.795-.905h-3.89v-7.69h3.89v7.69Z"
      clipRule="evenodd"
    />
  </svg>
)

export default BackHomeIcon

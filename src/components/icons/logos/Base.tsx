import { SVGProps } from 'react'

const Base = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="20" height="20" rx="4.5" fill="#0052FF" />
    <path
      d="M9.97652 17.0423C13.8662 17.0423 17.0198 13.8894 17.0198 10C17.0198 6.11069 13.8662 2.95776 9.97652 2.95776C6.28675 2.95776 3.25976 5.79539 2.95881 9.4074H13.409V10.58H2.95776C3.25272 14.1981 6.28245 17.0423 9.97652 17.0423Z"
      fill="white"
    />
  </svg>
)
export default Base

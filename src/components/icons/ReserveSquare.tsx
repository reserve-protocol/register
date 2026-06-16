import { SVGProps } from 'react'

const ReserveSquare = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 400 400"
    fill="none"
    {...props}
  >
    <rect width="400" height="400" fill="#0151AF" />
    <path
      fill="#fff"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M141.021 305v-80.815H103v-32.913h38.021V179.58H103v-32.175h38.021V95h86.371c22.637 0 39.395 5.327 50.261 15.979 10.866 10.55 16.305 26.831 16.305 48.845 0 16.687-4.007 30.103-12.036 40.25-8.028 10.043-19.184 17.033-33.517 20.955L297 305h-44.938l-44.632-80.655h-25.886V305h-40.523Zm40.523-113.667h51.185c12.692 0 19.04-6.991 19.04-20.958V148.81c0-7.034-1.42-12.056-4.272-15.081-2.733-3.112-7.661-4.674-14.768-4.674h-51.185v62.278Z"
    />
  </svg>
)

export default ReserveSquare

import { SVGProps } from 'react'

const ReserveSquare = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={24}
    fill="none"
    {...props}
  >
    <g clipPath="url(#reserve-square)">
      <path fill="#2150A9" d="M.5 0h24v24H.5z" />
      <path
        fill="#F9EDDD"
        d="M6.737 9.99c0 .09.09.18.18.18H9.1v1.109H6.917c-.09 0-.18.09-.18.18v1.829c0 .09.09.18.18.18H9.1v4.378c0 .09.06.15.15.15h2.093c.09 0 .149-.059.149-.15V13.71c0-.09.06-.15.15-.15h1.675c.06 0 .119.03.15.09l1.853 4.289c.03.06.09.09.15.09h2.243c.12 0 .18-.12.15-.21l-1.855-4.2c-.03-.09 0-.18.09-.21.897-.33 1.465-1.14 1.465-2.22V8.49a2.53 2.53 0 0 0-2.512-2.519H9.249c-.09 0-.15.06-.15.15v1.86H6.918c-.09 0-.18.09-.18.18v1.83Z"
      />
      <path
        fill="#2150A9"
        d="M11.492 8.4c0-.09.06-.15.15-.15h2.811c.389 0 .718.33.718.72v1.62c0 .39-.33.72-.718.72h-2.811c-.09 0-.15-.061-.15-.151v-2.76Z"
      />
    </g>
    <defs>
      <clipPath id="reserve-square">
        <path fill="#fff" d="M.5 0h24v24H.5z" />
      </clipPath>
    </defs>
  </svg>
)

export default ReserveSquare

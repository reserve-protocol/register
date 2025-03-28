import { SVGProps } from 'react'

const RSRSquare = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={24}
    fill="none"
    {...props}
  >
    <g clipPath="url(#rsr-square)">
      <path fill="#0151AF" d="M.5 0h24v24H.5z" />
      <path
        fill="#F9EDDD"
        fillRule="evenodd"
        d="M8.773 4.5h2.095c.08 0 .143.065.143.145v3.06c0 .081.066.145.146.145h2.689c.08 0 .145-.064.145-.145v-3.06c0-.08.064-.145.146-.145h2.092c.08 0 .146.065.146.145v3.06c0 .081.064.145.145.145h2.56c.08 0 .145.066.145.146v2.088a.144.144 0 0 1-.146.146H16.52a.145.145 0 0 0-.145.145v3.25c0 .08.064.146.145.146h2.56c.08 0 .145.063.145.145v2.088c0 .08-.064.145-.146.145H16.52a.145.145 0 0 0-.145.146v3.06c0 .08-.066.145-.146.145h-2.092a.145.145 0 0 1-.146-.145v-3.06a.145.145 0 0 0-.145-.146h-2.688a.146.146 0 0 0-.145.146v3.06c0 .08-.064.145-.144.145H8.775a.146.146 0 0 1-.145-.145v-3.06a.144.144 0 0 0-.146-.146h-2.56a.145.145 0 0 1-.145-.145v-2.088c0-.082.064-.146.146-.146h2.56a.145.145 0 0 0 .145-.145v-3.25a.145.145 0 0 0-.146-.146h-2.56a.144.144 0 0 1-.145-.145V7.996c0-.08.064-.146.146-.146h2.56a.144.144 0 0 0 .145-.145v-3.06a.143.143 0 0 1 .143-.145Zm5.22 9.127v-3.252a.146.146 0 0 0-.146-.146h-2.689a.146.146 0 0 0-.145.146v3.25c0 .08.065.146.145.146h2.69a.145.145 0 0 0 .145-.145Z"
        clipRule="evenodd"
      />
    </g>
    <defs>
      <clipPath id="rsr-square">
        <path fill="#fff" d="M.5 0h24v24H.5z" />
      </clipPath>
    </defs>
  </svg>
)

export default RSRSquare

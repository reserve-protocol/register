import { SVGProps } from 'react'

const BridgeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={23}
    height={20}
    fill="none"
    {...props}
  >
    <g clipPath="url(#a)">
      <g clipPath="url(#b)">
        <path
          fill="#627EEA"
          fillRule="evenodd"
          d="M11.197 22.5c5.508 0 10-4.492 10-10 0-5.507-4.492-10-10-10-5.507 0-10 4.493-10 10 0 5.508 4.492 10 10 10Z"
          clipRule="evenodd"
        />
        <path
          fill="#C1CCF6"
          d="m11.196 5-.1.342v9.918l.1.1 4.604-2.72L11.196 5Z"
        />
        <path fill="#fff" d="m11.196 5-4.604 7.64 4.604 2.72V5Z" />
        <path fill="#8198EE" d="M11.196 15.36 15.8 12.64l-4.604-2.093v4.814Z" />
        <path
          fill="#C1CCF6"
          d="m6.592 12.639 4.604 2.721v-4.814L6.592 12.64Z"
        />
      </g>
    </g>
    <g clipPath="url(#c)">
      <circle cx={11.197} cy={12.5} r={10} fill="#D9D9D9" />
      <g clipPath="url(#d)">
        <path
          fill="#0052FF"
          d="M11.197 22.5a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
        />
        <path
          fill="#fff"
          d="M11.174 19.542a7.042 7.042 0 1 0-7.018-7.635h10.45v1.173H4.157a7.043 7.043 0 0 0 7.018 6.462Z"
        />
      </g>
    </g>
    <g fill="#000" clipPath="url(#e)">
      <path d="M2.697 2.5h.5v10h-.5zM5.197 2.5h.5v10h-.5zM7.697 2.5h.5v10h-.5zM14.197 2.5h.5v10h-.5zM16.697 2.5h.5v10h-.5zM19.197 2.5h.5v10h-.5z" />
    </g>
    <path
      stroke="#000"
      strokeWidth={0.5}
      d="M.947 12.5v.25h20.5v-.25c0-5.66-4.589-10.25-10.25-10.25C5.537 2.25.947 6.84.947 12.5Z"
    />
    <path fill="#000" d="M.197 14.6h22v1h-22z" />
    <path
      fill="#fff"
      stroke="#000"
      strokeWidth={0.5}
      d="M9.947.75h2.5v17.5h-2.5z"
    />
    <path
      fill="#fff"
      stroke="#000"
      strokeWidth={0.5}
      d="M6.947 17.75h8.5v1.5h-8.5z"
    />
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M1.197 2.5h10v10h-10z" />
      </clipPath>
      <clipPath id="b">
        <path fill="#fff" d="M1.197 2.5h20v20h-20z" />
      </clipPath>
      <clipPath id="c">
        <path fill="#fff" d="M11.197 2.5h10v10h-10z" />
      </clipPath>
      <clipPath id="d">
        <path fill="#fff" d="M1.197 2.5h20v20h-20z" />
      </clipPath>
      <clipPath id="e">
        <path
          fill="#fff"
          d="M1.197 12.5c0-5.523 4.477-10 10-10s10 4.477 10 10h-20Z"
        />
      </clipPath>
    </defs>
  </svg>
)
export default BridgeIcon

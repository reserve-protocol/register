import { SVGProps } from 'react'

const DebankIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={12}
    height={13}
    fill="none"
    {...props}
  >
    <path
      fill="#FE815F"
      fillRule="evenodd"
      d="M11.44 8.9c0 1.988-1.637 3.6-3.655 3.6H.883v-2.4h6.902a1.21 1.21 0 0 0 1.218-1.2c0-.663-.545-1.2-1.218-1.2H5.35V5.3h2.436a1.21 1.21 0 0 0 1.218-1.2c0-.663-.545-1.2-1.218-1.2H.883V.5h6.902c2.018 0 3.654 1.612 3.654 3.6 0 .922-.351 1.763-.93 2.4.579.637.93 1.478.93 2.4Z"
      clipRule="evenodd"
      opacity={0.8}
    />
    <path
      fill="#000"
      fillRule="evenodd"
      d="M.883 2.9h5.928C5.552 1.443 3.547.5 1.29.5c-.136 0-.271.003-.406.01V2.9Zm7.17 4.8H5.755V5.3h2.298a5.27 5.27 0 0 1 0 2.4Zm-7.17 2.4h5.928c-1.259 1.457-3.264 2.4-5.522 2.4-.136 0-.271-.003-.406-.01V10.1Z"
      clipRule="evenodd"
      opacity={0.12}
    />
    <path
      fill="#FF6238"
      d="M.883.5c3.364 0 6.09 2.686 6.09 6s-2.726 6-6.09 6v-2.4c2.018 0 3.654-1.612 3.654-3.6S2.901 2.9.883 2.9V.5Z"
    />
  </svg>
)

export default DebankIcon

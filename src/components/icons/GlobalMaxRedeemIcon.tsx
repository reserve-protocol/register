import { SVGProps } from 'react'

const GlobalMaxRedeemIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        stroke="currentColor"
        strokeWidth={0.7}
        d="M10.983 7.987a5.317 5.317 0 1 1-10.633 0 5.317 5.317 0 0 1 10.633 0Z"
      />
      <path
        stroke="currentColor"
        strokeWidth={0.7}
        d="M15.603 7.987a5.317 5.317 0 1 1-10.633 0 5.317 5.317 0 0 1 10.633 0Z"
      />
      <mask id="b" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M7.977 13.163a5.668 5.668 0 0 0 0-10.352 5.668 5.668 0 0 0 0 10.352Z"
          clipRule="evenodd"
        />
      </mask>
      <path
        fill="red"
        d="m7.977 13.163-.286.639.286.127.285-.127-.285-.64Zm0-10.352.285-.64-.285-.127-.286.128.286.639Zm2.656 5.176a4.968 4.968 0 0 1-2.942 4.537l.571 1.278a6.368 6.368 0 0 0 3.771-5.815h-1.4ZM7.691 3.45a4.968 4.968 0 0 1 2.942 4.537h1.4a6.368 6.368 0 0 0-3.77-5.815L7.69 3.45Zm-2.37 4.537A4.968 4.968 0 0 1 8.261 3.45l-.57-1.278A6.368 6.368 0 0 0 3.92 7.987h1.4Zm2.941 4.537A4.968 4.968 0 0 1 5.32 7.987h-1.4a6.368 6.368 0 0 0 3.771 5.815l.571-1.278Z"
        mask="url(#b)"
      />
      <path
        stroke="red"
        strokeWidth={0.333}
        d="M5.608 10.583h4.667M4.941 9.583h6M4.941 8.583h6M4.941 7.583h6M4.941 6.583h6M5.274 5.583h5.334M5.941 4.583h4.1M6.274 11.583h3.334"
      />
      <path fill="red" d="M7.5-1.001H8v17h-.5z" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
export default GlobalMaxRedeemIcon
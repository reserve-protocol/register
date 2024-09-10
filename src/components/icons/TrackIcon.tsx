import { SVGProps } from 'react'

const TrackIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={17}
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M8.001 2.67C3.001 2.67 0 8.014 0 8.014s2.993 5.344 8.001 5.344C13.01 13.358 16 8.014 16 8.014S13.007 2.67 7.999 2.67H8Zm0 9.162c-2.201 0-4.008-1.727-4.008-3.818 0-2.09 1.8-3.818 3.999-3.818S12 5.914 12 8.014s-1.792 3.818-4 3.818Zm2.4-3.818c0 1.335-1.2 2.291-2.4 2.291-1.402 0-2.397-.955-2.397-2.291A2.376 2.376 0 0 1 8.001 5.73c1.2 0 2.4 1.151 2.4 2.29"
      clipRule="evenodd"
    />
  </svg>
)
export default TrackIcon

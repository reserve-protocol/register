import { SVGProps } from 'react'

const HomeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M3.05 19.35V8.044L12 1.084l8.95 6.96V19.35a1.6 1.6 0 0 1-1.6 1.6H4.65a1.6 1.6 0 0 1-1.6-1.6Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <mask id="a" fill="#fff">
      <path d="M8.85 21.45v-10.5h6.3v10.5" />
    </mask>
    <path
      d="M7.85 21.45a1 1 0 1 0 2 0h-2Zm1-10.5v-1a1 1 0 0 0-1 1h1Zm6.3 0h1a1 1 0 0 0-1-1v1Zm-1 10.5a1 1 0 1 0 2 0h-2Zm-4.3 0v-10.5h-2v10.5h2Zm-1-9.5h6.3v-2h-6.3v2Zm5.3-1v10.5h2v-10.5h-2Z"
      fill="currentColor"
      mask="url(#a)"
    />
  </svg>
)

export default HomeIcon

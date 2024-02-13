import { SVGProps } from 'react'

const RBrand = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 14 14"
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M3.066 14V8.612H.53V6.418h2.536v-.78H.53V3.495h2.536V0h5.761c1.51 0 2.628.355 3.353 1.065.724.704 1.087 1.789 1.087 3.257 0 1.112-.267 2.006-.803 2.683-.535.67-1.28 1.135-2.235 1.397L13.47 14h-2.997L7.496 8.623H5.769V14H3.066Zm2.703-7.578h3.414c.847 0 1.27-.466 1.27-1.397V3.587c0-.469-.095-.803-.285-1.005-.182-.208-.51-.312-.985-.312H5.769v4.152Z"
      clipRule="evenodd"
    />
  </svg>
)
export default RBrand

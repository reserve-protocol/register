import { SVGProps } from 'react'

const Ethereum = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    fillRule="evenodd"
    clipRule="evenodd"
    imageRendering="optimizeQuality"
    shapeRendering="geometricPrecision"
    textRendering="geometricPrecision"
    viewBox="0 0 20 20"
    width="1em"
    height="1em"
    {...props}
  >
    <g>
      <rect width="20" height="20" rx="4.5" fill="#627EEA" />
      <path
        d="M9.99907 2.5L9.89844 2.84184V12.7602L9.99907 12.8606L14.603 10.1392L9.99907 2.5Z"
        fill="#C1CCF6"
      />
      <path
        d="M9.99857 2.5L5.39453 10.1392L9.99857 12.8606V8.04652V2.5Z"
        fill="white"
      />
      <path
        d="M9.9991 13.7322L9.94238 13.8014V17.3345L9.9991 17.5L14.6058 11.0122L9.9991 13.7322Z"
        fill="#C1CCF6"
      />
      <path
        d="M9.99881 17.5V13.7322L5.39478 11.0122L9.99881 17.5Z"
        fill="white"
      />
      <path
        d="M9.99878 12.8605L14.6027 10.1391L9.99878 8.04639V12.8605Z"
        fill="#8198EE"
      />
      <path
        d="M5.39478 10.1391L9.99881 12.8605V8.04639L5.39478 10.1391Z"
        fill="#C1CCF6"
      />
    </g>
  </svg>
)
export default Ethereum

import { SVGProps } from 'react'
const ChevronRight = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="6"
    height="10"
    viewBox="0 0 6 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      id="Caret Down"
      d="M0.999023 8.99951L4.99902 4.99951L0.999023 0.999512"
      stroke={props.color || '#808080'}
      strokeLinecap="square"
    />
  </svg>
)
export default ChevronRight

import { SVGProps } from 'react'

const PegIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x="1.29167"
      y="1.29069"
      width="13.4167"
      height="13.4167"
      rx="6.70833"
      stroke="black"
      strokeWidth="0.583333"
      strokeDasharray="1.17 1.17"
    />
    <rect x="6" y="5.99902" width="4" height="4" rx="2" fill="black" />
  </svg>
)

export default PegIcon

import { SVGProps } from 'react'

const CalculatorIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeMiterlimit={10}
      strokeWidth={0.6}
      d="M8.813.75H3.186c-.517 0-.937.392-.937.875v8.75c0 .483.42.875.938.875h5.624c.518 0 .938-.392.938-.875v-8.75c0-.483-.42-.875-.938-.875Z"
    />
    <path
      stroke="currentColor"
      strokeMiterlimit={10}
      strokeWidth={0.703}
      d="M4.125 9.638h.469M7.406 9.638h.469M5.766 9.638h.468M4.125 7.95h.469M7.406 7.95h.469M5.766 7.95h.468M4.125 6.263h.469M7.406 6.263h.469M5.766 6.263h.468"
    />
    <path
      stroke="currentColor"
      strokeMiterlimit={10}
      strokeWidth={0.6}
      d="M2.25 4.612h7.5"
    />
  </svg>
)

export default CalculatorIcon

import { SVGProps } from 'react'

const CustomHelpIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={21}
    height={20}
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M10.5 16.9a6.9 6.9 0 1 1 0-13.8 6.9 6.9 0 0 1 0 13.8Zm-8-6.9a8 8 0 1 0 16 0 8 8 0 0 0-16 0Zm7.15 1.193v.113h1.258v-.113c.002-.216.03-.399.083-.547.056-.148.139-.279.25-.392.112-.113.256-.221.43-.325.209-.124.389-.262.542-.415.152-.155.27-.332.355-.53.086-.202.129-.432.129-.691 0-.387-.096-.718-.289-.992a1.811 1.811 0 0 0-.796-.628 2.926 2.926 0 0 0-1.168-.219c-.4 0-.767.072-1.099.216a1.825 1.825 0 0 0-.8.647c-.201.288-.307.653-.318 1.095H9.58a.855.855 0 0 1 .132-.454.78.78 0 0 1 .316-.28.901.901 0 0 1 .408-.095.88.88 0 0 1 .405.093c.124.061.222.15.295.265.073.115.11.249.11.402a.803.803 0 0 1-.097.391c-.064.115-.15.22-.258.316a3.127 3.127 0 0 1-.369.275c-.183.115-.34.243-.471.385-.13.142-.23.327-.299.557-.066.23-.1.54-.103.926Zm.09 2.005a.78.78 0 0 0 .567.232.754.754 0 0 0 .392-.106.86.86 0 0 0 .289-.289.762.762 0 0 0-.126-.96.771.771 0 0 0-.554-.231.78.78 0 0 0-.568.232.75.75 0 0 0-.229.558.764.764 0 0 0 .229.564Z"
      clipRule="evenodd"
    />
  </svg>
)
export default CustomHelpIcon
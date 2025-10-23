import { SVGProps } from 'react'

const RIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={17}
    viewBox="0 0 16 17"
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M3.042 16.8v-6.465H0V7.702h3.042v-.936H0V4.192h3.042V0h6.91c1.81 0 3.15.426 4.02 1.278.87.844 1.305 2.147 1.305 3.908 0 1.335-.32 2.408-.963 3.22-.643.803-1.535 1.363-2.682 1.676L15.52 16.8h-3.595l-3.57-6.452H6.282V16.8H3.042Zm3.241-9.093h4.095c1.016 0 1.524-.56 1.524-1.677V4.305c0-.563-.114-.965-.342-1.207-.219-.249-.613-.374-1.182-.374H6.283v4.983Z"
      clipRule="evenodd"
    />
  </svg>
)

export default RIcon

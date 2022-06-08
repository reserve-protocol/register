import { SVGProps } from 'react'

const RTokenLight = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={30}
    height={30}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x={0.714}
      y={0.714}
      width={28.571}
      height={28.571}
      rx={14.286}
      stroke="#000"
      strokeWidth={1.429}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.403 21.87v-5.377H9v-2.196h2.403v-.781H9V11.37h2.403V7.857h5.458c1.432 0 2.491.355 3.177 1.066.688.704 1.03 1.79 1.03 3.26 0 1.113-.253 2.008-.76 2.685-.506.67-1.213 1.137-2.117 1.399l3.07 5.603h-2.84L15.6 16.488h-1.637v5.382h-2.56Zm2.56-7.586h3.235c.802 0 1.203-.466 1.203-1.398v-1.438c0-.47-.09-.805-.269-1.006-.173-.208-.484-.312-.934-.312h-3.234v4.154Z"
      fill="#111"
    />
  </svg>
)

export default RTokenLight

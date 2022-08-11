import { SVGProps } from 'react'

const ManagerIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24px"
    height="24px"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x={4.014}
      y={3.75}
      width={16.486}
      height={16.486}
      rx={1.043}
      stroke="currentColor"
    />
    <rect
      x={3.2}
      y={13.021}
      width={1.543}
      height={5.143}
      rx={0.771}
      fill="#FAFAFA"
      stroke="currentColor"
      strokeWidth={0.75}
    />
    <rect
      x={3.2}
      y={5.821}
      width={1.543}
      height={5.143}
      rx={0.771}
      fill="#FAFAFA"
      stroke="currentColor"
      strokeWidth={0.75}
    />
    <circle cx={12.257} cy={11.993} r={3.1} stroke="currentColor" />
    <circle cx={12.257} cy={11.993} r={1.043} fill="#FAFAFA" stroke="#000" />
  </svg>
)

export default ManagerIcon

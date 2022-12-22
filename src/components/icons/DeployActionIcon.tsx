import { SVGProps } from 'react'

const DeployActionIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="48px"
    height="48px"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <mask
      id="mask0_5073_304895"
      maskUnits="userSpaceOnUse"
      x="3"
      y="3"
      width="42"
      height="41"
    >
      <circle cx="24" cy="23.5" r="20.5" fill="background" />
    </mask>
    <g mask="url(#mask0_5073_304895)">
      <circle
        cx="23.9994"
        cy="17.1547"
        r="8.54167"
        stroke="currentColor"
        stroke-width="1.46429"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M30.8503 26.9491L24.0003 16.6665L17.15 26.9496L12.774 20.0835L3.98837 31.3096H3.98828L-6.26172 44H54.2621L44.0121 31.3096H44.0116L35.226 20.0835L30.8503 26.9491Z"
        fill="currentColor"
      />
      <path
        d="M23.9997 16.6665L29.8569 25.4522L26.6842 29.357L23.9997 24.9641L21.3152 29.357L18.1426 25.4522L23.9997 16.6665Z"
        fill="grey"
      />
    </g>
  </svg>
)

export default DeployActionIcon

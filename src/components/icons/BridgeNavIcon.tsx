import { SVGProps } from 'react'

const BridgeNavIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox={'0 0 17 16'}
    fill="none"
    {...props}
  >
    <g clipPath="url(#bridge-svg)">
      <path
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={0.113}
        d="M17.42 7.628v-.544a4.77 4.77 0 0 1-3.705-4.642v-.794a.265.265 0 1 0-.53 0v.794a4.77 4.77 0 0 1-4.764 4.764 4.77 4.77 0 0 1-4.765-4.764v-.794a.265.265 0 1 0-.53 0v.794A4.77 4.77 0 0 1-.578 7.084v.544a5.293 5.293 0 0 0 1.588-.609v3.893H-.579v.53h3.706v2.647H.744v.529H6.04v-.53H3.656v-2.646h9.53v2.647h-2.383v.529h5.294v-.53h-2.382v-2.646h3.706v-.53h-1.588V7.02c.486.283 1.02.492 1.588.609ZM3.128 10.912H1.539V6.677h-.014a5.32 5.32 0 0 0 1.602-1.943v6.178Zm1.853 0H3.656V4.734A5.32 5.32 0 0 0 4.98 6.457v4.455Zm2.117 0H5.51V6.86c.48.317 1.016.555 1.588.703v3.35Zm2.118 0H7.627V7.67c.26.039.523.066.794.066.27 0 .534-.027.794-.066v3.242Zm2.118 0H9.744v-3.35a5.268 5.268 0 0 0 1.589-.704v4.054Zm1.853 0h-1.324V6.457a5.32 5.32 0 0 0 1.324-1.723v6.178Zm2.117-4.235v4.235h-1.588V4.734a5.32 5.32 0 0 0 1.602 1.943h-.014Z"
      />
    </g>
    <defs>
      <clipPath id="bridge-svg">
        <path d="M.42 0h16v16h-16z" />
      </clipPath>
    </defs>
  </svg>
)
export default BridgeNavIcon

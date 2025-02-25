import { SVGProps } from 'react'

const BasketIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <g clipPath="url(#basket-icon)">
      <path
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={0.2}
        d="M1.503.957h16.97a.365.365 0 0 1 .365.365v16.97a.365.365 0 0 1-.365.365H1.503a.365.365 0 0 1-.365-.365V1.322c0-.097.039-.19.107-.258l.258-.107Zm0 0a.365.365 0 0 0-.258.107l.258-.107Zm9.046 6.227H6.765V1.687h3.784v5.497Zm4.136 0H11.28V1.687h3.405v5.497Zm3.422 0h-2.692V1.687h2.692v5.497Zm-5.306 6.512V7.914h5.306v5.782h-5.306Zm2.995 4.23v-3.5h2.311v3.5h-2.311Zm-2.995-3.5h2.264v3.5h-2.264v-3.5Zm-6.036 1.473h5.306v2.027H6.765v-2.027Zm-.73-5.704v7.73H1.869v-7.73h4.166Zm0-8.508v7.778H1.868V1.687h4.165Zm6.036 9.394H6.765V7.914h5.306v3.167ZM6.765 15.17V11.81h5.306v3.359H6.765Z"
      />
    </g>
    <rect
      width={16.7}
      height={16.7}
      x={1.638}
      y={1.457}
      stroke="currentColor"
      strokeWidth={0.8}
      rx={3.35}
    />
    <defs>
      <clipPath id="basket-icon">
        <rect
          width={17.5}
          height={17.5}
          x={1.238}
          y={1.057}
          fill="currentColor"
          rx={3.75}
        />
      </clipPath>
    </defs>
  </svg>
)
export default BasketIcon

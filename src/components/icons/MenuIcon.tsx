import { SVGProps } from 'react'

const MenuIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#a)" fill="currentColor">
      <path d="M.699 3h14.6v1.75H.699zM5.966 7.13h9.333v1.75H5.966zM.699 11.26h14.6v1.75H.699z" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)

export default MenuIcon

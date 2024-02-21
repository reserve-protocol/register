import { SVGProps } from 'react'

const BasketCubeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 21 20"
    fill="none"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinejoin="bevel"
      strokeWidth={0.761}
      d="M0 0h8.785v8.785H0z"
      transform="matrix(.86603 .5 0 1 2.872 5.572)"
    />
    <path
      stroke="currentColor"
      strokeLinejoin="bevel"
      strokeWidth={0.761}
      d="M10.451 9.964 18.06 5.57v8.785l-7.608 4.393V9.964ZM16.027 6.982v8.785M12.375 8.938v8.786M6.976 7.887v8.75M10.48 1.176l3.788 2.187 3.79 2.188-7.579 4.375L2.902 5.55l7.577-4.375Z"
    />
    <path
      stroke="currentColor"
      strokeLinejoin="bevel"
      strokeWidth={0.761}
      d="m8.183 2.154 3.804 2.197 3.804 2.196M12.312 8.762 8.508 6.565"
    />
    <path
      stroke="currentColor"
      strokeLinejoin="bevel"
      strokeWidth={0.761}
      d="M0 0h4.551v6.535H0z"
      transform="matrix(.86603 .5 -.86603 .5 8.53 2.375)"
    />
  </svg>
)
export default BasketCubeIcon

import React from 'react'

const LangIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="32px"
    height="32px"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.333 13h-2.166l-.833-2H5l-.834 2H2L6.583 2H8.75l4.583 11ZM7.666 4.6 5.833 9H9.5L7.667 4.6ZM18 11h12v2H18v-2Zm12 4H18v2h12v-2Zm-6 4h-6v2h6v-2Zm-10 2v-2H9v-2H7v2H2v2h8.215a8.592 8.592 0 0 1-2.216 3.977A9.272 9.272 0 0 1 6.552 23H4.333a10.856 10.856 0 0 0 2.146 3.297A14.66 14.66 0 0 1 3 28.127L3.702 30a16.42 16.42 0 0 0 4.29-2.336A16.491 16.491 0 0 0 12.299 30L13 28.127A14.663 14.663 0 0 1 9.523 26.3a10.313 10.313 0 0 0 2.729-5.3H14Z"
      fill="currentColor"
    />
  </svg>
)

export default LangIcon

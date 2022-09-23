import { ArrowUpRight } from 'react-feather'
import { Link, LinkProps } from 'theme-ui'

const GoTo = (props: LinkProps) => {
  return (
    <Link
      target="_blank"
      variant="layout.verticalAlign"
      sx={{ cursor: 'pointer' }}
      {...props}
    >
      <ArrowUpRight color="#666666" size={16} />
    </Link>
  )
}

export default GoTo

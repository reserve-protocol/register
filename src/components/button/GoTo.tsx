import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import { Link, LinkProps } from 'theme-ui'

const GoTo = (props: LinkProps) => {
  return (
    <Link
      target="_blank"
      variant="layout.verticalAlign"
      sx={{ cursor: 'pointer' }}
      {...props}
    >
      <ExternalArrowIcon />
    </Link>
  )
}

export default GoTo

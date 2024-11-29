import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import { Link, LinkProps, Text } from 'theme-ui'

const GoTo = ({ color, ...props }: LinkProps) => {
  return (
    <Link
      target="_blank"
      variant="layout.verticalAlign"
      sx={{ cursor: 'pointer' }}
      {...props}
      onClick={(e) => e.stopPropagation()}
    >
      <Text
        variant="layout.verticalAlign"
        sx={{
          color: color ? color : 'secondaryText',
          ':hover': { color: 'text' },
        }}
      >
        <ExternalArrowIcon strokeWidth={1.5} />
      </Text>
    </Link>
  )
}

export default GoTo

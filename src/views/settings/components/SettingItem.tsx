import { LoadingButton } from 'components/button'
import { Box, BoxProps, Image, Text } from 'theme-ui'

interface ItemProps extends BoxProps {
  icon?: string
  title: string
  subtitle: string
  value?: string
  action?: string
  actionVariant?: string
  loading?: boolean
  onAction?(): void
}

const SettingItem = ({
  icon,
  title,
  subtitle,
  value,
  action,
  actionVariant = 'muted',
  loading = false,
  onAction,
  ...props
}: ItemProps) => {
  return (
    <Box variant="layout.verticalAlign" {...props}>
      {!!icon ? (
        <Image src={`/svgs/${icon}.svg`} height={14} width={14} />
      ) : (
        <Box
          mx={1}
          sx={{
            height: '6px',
            width: '6px',
            borderRadius: '100%',
            backgroundColor: 'text',
          }}
        />
      )}
      <Box ml={3}>
        <Text>{title}</Text>
        <Box sx={{ fontSize: 1 }}>
          <Text variant="legend">{subtitle}</Text>
          {!!value && <Text ml={1}>{value}</Text>}
        </Box>
      </Box>
      {!!action && (
        <LoadingButton
          small
          loading={loading}
          text={action}
          ml="auto"
          variant={actionVariant}
          onClick={onAction}
        />
      )}
    </Box>
  )
}

export default SettingItem

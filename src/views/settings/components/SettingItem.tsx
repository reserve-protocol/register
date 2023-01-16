import { t } from '@lingui/macro'
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
    <Box>
      <Box variant="layout.verticalAlign" {...props}>
        {!!icon ? (
          <Image src={`/svgs/${icon}.svg`} height={16} width={16} />
        ) : (
          <Box
            mx={1}
            sx={{
              height: '3px',
              width: '3px',
              borderRadius: '100%',
              backgroundColor: '#808080',
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
      </Box>
      <Box ml={4} mt={2}>
        {!!action && (
          <LoadingButton
            small
            loading={loading}
            loadingText={t`Loading...`}
            text={action}
            ml="auto"
            variant={loading ? 'accentAction' : actionVariant}
            onClick={onAction}
          />
        )}
      </Box>
    </Box>
  )
}

export default SettingItem

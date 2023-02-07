import CopyValue from 'components/button/CopyValue'
import GoTo from 'components/button/GoTo'
import Help from 'components/help'
import { Flex, Text, BoxProps, Box } from 'theme-ui'
import { shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

// TODO: Change component structure for "InfoBoxes" or something more generic
interface Props extends BoxProps {
  title: string
  subtitle?: React.ReactNode
  help?: string
  light?: boolean
  address?: string
  right?: React.ReactNode
  addressType?: ExplorerDataType
}

const InfoBox = ({ title, subtitle, light, ...props }: Props) => (
  <Box {...props}>
    <Text
      variant={light ? 'legend' : 'strong'}
      sx={{ fontSize: 2, display: 'block' }}
      mb={1}
    >
      {title}
    </Text>
    <Text
      variant={light ? 'primary' : 'legend'}
      as="p"
      sx={{ fontSize: light ? 2 : 1 }}
    >
      {subtitle}
    </Text>
  </Box>
)

export const ContentHead = ({ title, subtitle, ...props }: Props) => (
  <Box {...props}>
    <Text
      sx={{ display: 'block', marginBottom: 1, fontWeight: 500, fontSize: 5 }}
    >
      {title}
    </Text>
    {!!subtitle && (
      <Text
        as="p"
        pr={3}
        sx={{ maxWidth: 620, fontWeight: 300 }}
        variant="legend"
      >
        {subtitle}
      </Text>
    )}
  </Box>
)

export const InfoHeading = ({ title, subtitle, help, ...props }: Props) => (
  <Box {...props}>
    <Flex mb={2} variant="layout.verticalAlign">
      <Text variant="legend" sx={{ fontWeight: 300 }}>
        {title}
      </Text>
      {!!help && <Help ml={2} size={14} mt="1px" content={help} />}
    </Flex>
    {!!subtitle && <Text variant="title">{subtitle}</Text>}
  </Box>
)

export const InfoItem = ({
  title,
  subtitle,
  help,
  address,
  right,
  addressType = ExplorerDataType.ADDRESS,
  ...props
}: Props) => (
  <Box {...props} variant="layout.verticalAlign">
    <Box
      mx={1}
      sx={{
        height: '4px',
        width: '4px',
        backgroundColor: 'text',
      }}
    />
    <Box ml={2}>
      <Flex variant="layout.verticalAlign">
        <Text variant="legend" sx={{ fontWeight: 300, fontSize: 1 }}>
          {title}
        </Text>
        {!!help && <Help ml={2} size={14} mt="1px" content={help} />}
      </Flex>
      <Box>{!!subtitle && subtitle}</Box>
    </Box>
    {!!address && (
      <Box ml="auto" variant="layout.verticalAlign">
        <CopyValue mr={2} value={address} />
        <GoTo href={getExplorerLink(address, addressType)} />
      </Box>
    )}
    {!!right && (
      <Box ml="auto" variant="layout.verticalAlign">
        {right}
      </Box>
    )}
  </Box>
)

export default InfoBox

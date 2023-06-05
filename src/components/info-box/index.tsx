import CopyValue from 'components/button/CopyValue'
import GoTo from 'components/button/GoTo'
import Help from 'components/help'
import React from 'react'
import { Flex, Text, BoxProps, Box } from 'theme-ui'
import { shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

// TODO: Change component structure for "InfoBoxes" or something more generic
interface Props extends BoxProps {
  title: string
  subtitle?: React.ReactNode
  help?: string
  icon?: React.ReactNode
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
    <Text variant="pageTitle" sx={{ display: 'block', marginBottom: 2 }}>
      {title}
    </Text>
    {!!subtitle && (
      <Text as="p" pr={3} sx={{ maxWidth: 720 }} variant="legend">
        {subtitle}
      </Text>
    )}
  </Box>
)

export const InfoHeading = ({ title, subtitle, help, ...props }: Props) => (
  <Flex
    {...props}
    variant="layout.verticalAlign"
    sx={{
      justifyContent: 'space-between',
      alignItems: 'start',
      minWidth: 390,
      maxWidth: '100%',
      flexDirection: ['column', 'row'],
    }}
  >
    <Flex mr={3} variant="layout.verticalAlign">
      <Text variant="title" sx={{ color: 'lightText' }}>
        {title}
      </Text>
      {!!help && <Help ml={2} size={14} mt="1px" content={help} />}
    </Flex>
    {!!subtitle && <Text variant="title">{subtitle}</Text>}
  </Flex>
)

export const InfoItem = ({
  title,
  subtitle,
  help,
  address,
  icon,
  right,
  addressType = ExplorerDataType.ADDRESS,
  ...props
}: Props) => (
  <Box {...props} variant="layout.verticalAlign">
    {icon}
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

interface InfoProps extends Omit<BoxProps, 'title'> {
  title: React.ReactNode | string
  subtitle: React.ReactNode | string
  icon?: React.ReactNode
}

export const Info = ({ title, subtitle, icon = null, ...props }: InfoProps) => (
  <Box variant="layout.verticalAlign" {...props}>
    {icon}
    <Box ml={icon ? 3 : 0}>
      <Text variant="subtitle" sx={{ fontSize: 1, display: 'block' }} mb={1}>
        {title}
      </Text>
      <Text as="p">{subtitle}</Text>
    </Box>
  </Box>
)

export default InfoBox

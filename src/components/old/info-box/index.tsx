import CopyValue from '@/components/old/button/CopyValue'
import GoTo from '@/components/old/button/GoTo'
import Help from 'components/help'
import { useAtomValue } from 'jotai'
import React from 'react'
import { chainIdAtom } from 'state/atoms'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
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
      // as={typeof subtitle === 'string' ? 'p' : 'span'}
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
      minWidth: ['auto', 390],
      maxWidth: '100%',
      flexDirection: ['column', 'row'],
    }}
  >
    <Flex mr={3} variant="layout.verticalAlign">
      <Text variant="legend" sx={{ color: 'secondaryText' }}>
        {title}
      </Text>
      {!!help && (
        <Help
          ml={2}
          size={14}
          mt="1px"
          content={help.split('\n').map((i, index) => {
            return <p key={`${i}-${index}`}>{i}</p>
          })}
        />
      )}
    </Flex>
    {!!subtitle && <Text>{subtitle}</Text>}
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
}: Props) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
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
          <GoTo href={getExplorerLink(address, chainId, addressType)} />
        </Box>
      )}
      {!!right && (
        <Box ml="auto" variant="layout.verticalAlign">
          {right}
        </Box>
      )}
    </Box>
  )
}

interface InfoProps extends Omit<BoxProps, 'title'> {
  title: React.ReactNode | string
  subtitle: React.ReactNode | string
  icon?: React.ReactNode
}

export const Info = ({ title, subtitle, icon = null, ...props }: InfoProps) => (
  <Box variant="layout.verticalAlign" {...props}>
    {icon}
    <Box ml={icon ? 3 : 0}>
      <Text
        variant="subtitle"
        sx={{ fontSize: [0, 1], display: 'block' }}
        mb={1}
      >
        {title}
      </Text>
      <Text
        as={typeof subtitle === 'string' ? 'p' : 'span'}
        sx={{ fontSize: [1, 2] }}
      >
        {subtitle}
      </Text>
    </Box>
  </Box>
)

export default InfoBox

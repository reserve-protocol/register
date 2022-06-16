import { Trans } from '@lingui/macro'
import TokenLogo from 'components/icons/TokenLogo'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import {
  Box,
  BoxProps,
  Checkbox,
  Divider,
  Flex,
  IconButton,
  Link,
  Text,
} from 'theme-ui'
import { shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { Collateral } from '../atoms'
import { CollateralPlugin } from '../plugins'

interface PluginItemProps extends BoxProps {
  data: CollateralPlugin | Collateral
  selected?: boolean
  onCheck(address: string): void
}

const PluginInfo = ({ data }: { data: CollateralPlugin }) => (
  <>
    <Divider mt={2} />
    <Flex variant="layout.verticalAlign" ml={4} mt={3} sx={{ fontSize: 1 }}>
      <Box mr={4}>
        <Text variant="legend">
          <Trans>Reference unit</Trans>
        </Text>
        <Text sx={{ display: 'block' }}>{data.referenceUnit}</Text>
      </Box>
      <Box mr={4}>
        <Text variant="legend">
          <Trans>Collateral token</Trans>
        </Text>
        <Link
          as="a"
          href={getExplorerLink(
            data.collateralAddress!,
            ExplorerDataType.TOKEN
          )}
          target="_blank"
          variant="legend"
          sx={{ color: 'text', display: 'block' }}
        >
          {data.collateralToken}
        </Link>
      </Box>
      <Box>
        <Text variant="legend">
          <Trans>Oracle</Trans>
        </Text>
        <Link
          as="a"
          href={getExplorerLink(data.oracleAddress!, ExplorerDataType.ADDRESS)}
          target="_blank"
          variant="legend"
          sx={{ color: 'text', display: 'block' }}
        >
          {data.oracle}
        </Link>
      </Box>
    </Flex>
  </>
)

const PluginItem = ({
  data,
  selected = false,
  onCheck,
  ...props
}: PluginItemProps) => {
  const [isVisible, setVisible] = useState(false)

  return (
    <Box {...props}>
      <Flex variant="layout.verticalAlign">
        <TokenLogo />
        <Box ml={2}>
          <Text>{data.symbol} plug-in</Text>
          <Text sx={{ fontSize: 1, display: 'block' }} variant="legend">
            <Trans>Target</Trans> {data.targetUnit}{' '}
            {data.custom ? (
              <Trans>Custom</Trans>
            ) : (
              `| ${'description' in data ? data.description : ''}`
            )}
          </Text>
        </Box>
        <Box mx="auto" />
        <Text variant="legend" sx={{ fontSize: 1, display: 'block' }} mr={3}>
          {shortenAddress(data.address!)}
        </Text>
        <Checkbox
          checked={selected}
          sx={{ cursor: 'pointer' }}
          onChange={() => onCheck(data.address)}
        />
        {!data.custom && (
          <IconButton
            sx={{ cursor: 'pointer' }}
            ml={-1}
            onClick={() => setVisible(!isVisible)}
          >
            {isVisible ? (
              <ChevronUp color="#999999" />
            ) : (
              <ChevronDown color="#999999" />
            )}
          </IconButton>
        )}
      </Flex>
      {isVisible && <PluginInfo data={data as CollateralPlugin} />}
    </Box>
  )
}

export default PluginItem

import { useCallback, useMemo, useState } from 'react'
import { Box, Card, Flex } from 'theme-ui'
import StakedPortfolio from './StakedPortfolio'
import RSRPortfolio from './RSRPortfolio'
import RTokensPortfolio from './RTokensPortfolio'
import TabMenu from 'components/tab-menu'

const tabComponents = {
  staked: StakedPortfolio,
  rsr: RSRPortfolio,
  rtokens: RTokensPortfolio,
}

const Menu = ({
  current,
  onChange,
}: {
  current: string
  onChange(key: string): void
}) => {
  const items = useMemo(
    () => [
      {
        key: 'staked',
        label: 'Staked RSR',
      },
      {
        key: 'rsr',
        label: 'RSR',
      },
      { key: 'rtokens', label: 'RTokens' },
    ],
    []
  )

  return (
    <TabMenu active={current} items={items} collapse onMenuChange={onChange} />
  )
}

const PositionsContainer = () => {
  const [current, setCurrent] = useState('staked')

  const handleChange = useCallback(
    (key: string) => {
      setCurrent(key)
    },
    [setCurrent]
  )

  const Current = tabComponents[current as keyof typeof tabComponents]

  return (
    <Card p={4} mt={5}>
      <Box variant="layout.verticalAlign">
        <Menu current={current} onChange={handleChange} />
      </Box>
      <Flex
        mt={3}
        sx={{
          flexWrap: ['wrap-reverse', 'wrap-reverse', 'wrap-reverse', 'nowrap'],
        }}
      >
        {/* <BackingOverview current={current} /> */}
        <Current />
      </Flex>
    </Card>
  )
}

export default PositionsContainer

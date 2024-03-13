import TabMenu from 'components/tab-menu'
import { useState } from 'react'
import { Minus, Plus } from 'react-feather'
import { Box, Card } from 'theme-ui'
import Stake from './stake'
import Unstake from './unstake'

const MenuOptions = [
  { key: 1, label: 'Stake', icon: <Plus size={16} /> },
  { key: 0, label: 'Unstake', icon: <Minus size={16} /> },
]

const Header = ({
  isStaking,
  onChange,
}: {
  onChange(isStaking: boolean): void
  isStaking: boolean
}) => {
  return (
    <Box
      variant="layout.verticalAlign"
      sx={{ borderBottom: '1px solid', borderColor: 'border' }}
      p={4}
    >
      <TabMenu
        active={+isStaking}
        items={MenuOptions}
        onMenuChange={(key) => onChange(!!key)}
      />
    </Box>
  )
}

const StakeContainer = () => {
  const [isStaking, setIsStaking] = useState(true)

  return (
    <Card p="0" sx={{ backgroundColor: 'focusedBackground' }}>
      <Header isStaking={isStaking} onChange={setIsStaking} />
      {isStaking ? <Stake /> : <Unstake />}
    </Card>
  )
}

export default StakeContainer

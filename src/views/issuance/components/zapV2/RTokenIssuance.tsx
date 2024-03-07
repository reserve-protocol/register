import WalletOutlineIcon from 'components/icons/WalletOutlineIcon'
import TabMenu from 'components/tab-menu'
import { FC, useState } from 'react'
import { ChevronRight, Minus, Plus, Settings } from 'react-feather'
import { Box, Divider, IconButton, Text } from 'theme-ui'
import { ReserveToken } from 'types'

type IssuanceTabsProps = {
  symbol: string
}

const IssuanceTabs: FC<IssuanceTabsProps> = ({ symbol }) => {
  const [issuanceOperation, setIssuanceOperation] = useState<string>('mint')
  const backingOptions = [
    { key: 'mint', label: 'Mint', icon: <Plus size={16} /> },
    { key: 'redeem', label: 'Redeem', icon: <Minus size={16} /> },
  ]

  return (
    <Box
      variant="layout.verticalAlign"
      sx={{ justifyContent: 'space-between' }}
    >
      <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
        <TabMenu
          mt={[3, 0]}
          active={issuanceOperation}
          items={backingOptions}
          small
          background="border"
          onMenuChange={setIssuanceOperation}
        />
        <IconButton
          sx={{
            cursor: 'pointer',
            width: '34px',
            border: '1px solid',
            borderColor: 'border',
            borderRadius: '6px',
            ':hover': { backgroundColor: 'border' },
          }}
        >
          <Settings size={16} />
        </IconButton>
      </Box>
      <Box variant="layout.verticalAlign" sx={{ gap: '12px' }}>
        <Text sx={{ fontSize: 1 }}>Current {symbol} balance:</Text>
        <IconButton
          sx={{
            width: 'max-content',
            px: '12px',
            cursor: 'pointer',
            border: '1px solid',
            borderColor: 'border',
            borderRadius: '6px',
            ':hover': { backgroundColor: 'border' },
          }}
        >
          <Box variant="layout.verticalAlign" sx={{ gap: '6px' }}>
            <WalletOutlineIcon fontSize={17} />
            {/* TODO: replace with actual balance */}
            <Text sx={{ fontSize: 1, fontWeight: 'strong', mt: '1px' }}>
              0.00
            </Text>
            <ChevronRight size={16} strokeWidth={1.2} />
          </Box>
        </IconButton>
      </Box>
    </Box>
  )
}

const IssuanceInput: FC = () => {
  return <Box>Issuance Input</Box>
}

const IssuanceOperationDetails: FC = () => {
  return <Box>Issuance Operation Details</Box>
}

const IssuanceSubmit: FC = () => {
  return <Box>Issuance Submit</Box>
}

type RTokenIssuanceProps = {
  rToken: ReserveToken
}

const RTokenIssuance: FC<RTokenIssuanceProps> = ({ rToken }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'stretch',
        borderRadius: '14px',
        bg: 'background',
      }}
    >
      <Box p="24px">
        <IssuanceTabs symbol={rToken.symbol} />
      </Box>
      <Divider m={0} />
      <Box p="24px">
        <IssuanceInput />
        <IssuanceOperationDetails />
        <IssuanceSubmit />
      </Box>
    </Box>
  )
}

export default RTokenIssuance

import { Trans, t } from '@lingui/macro'
import RevenueTrader from 'abis/RevenueTrader'
import CollapsableBox from 'components/boxes/CollapsableBox'
import SelectableBox from 'components/boxes/SelectableBox'
import { ExecuteButton } from 'components/button/TransactionButton'
import Help from 'components/help'
import TokenLogo from 'components/icons/TokenLogo'
import { useAtomValue, useSetAtom } from 'jotai'
import { useMemo, useState } from 'react'
import { rTokenContractsAtom, walletAtom } from 'state/atoms'
import { Box, BoxProps, Divider, Text } from 'theme-ui'
import { Trader } from 'types'
import { formatCurrency } from 'utils'
import { TRADERS, TraderLabels } from 'utils/constants'
import { Address, encodeFunctionData } from 'viem'
import { auctionSessionAtom } from 'views/auctions/atoms'
import { traderRewardsAtom } from '../atoms'

const MIN_DOLLAR_VALUE = 10

interface Props extends BoxProps {
  trader: Trader
}

const TraderIcon = ({ trader }: { trader: Trader }) => (
  <Box
    variant="layout.verticalAlign"
    sx={{
      div: {
        height: '16px',
        width: '4px',
        ':first-of-type': {
          borderTopLeftRadius: '2px',
          borderBottomLeftRadius: '2px',
          marginRight: '2px',
        },
        ':last-of-type': {
          borderTopRightRadius: '2px',
          borderBottomRightRadius: '2px',
          marginLeft: '2px',
        },
      },
    }}
  >
    {TRADERS.map((currentTrader) => (
      <Box
        key={currentTrader}
        sx={{
          backgroundColor: currentTrader === trader ? 'primary' : 'disabled',
        }}
      />
    ))}
  </Box>
)

const TraderHeading = ({
  trader,
  selected,
  onSelect,
  amount,
  disabled,
}: {
  amount: number
  trader: Trader
  onSelect(): void
  selected: boolean
  disabled?: boolean
}) => (
  <SelectableBox
    selected={selected}
    onSelect={onSelect}
    unavailable={disabled}
    unavailableComponent={<Box />}
  >
    <Box variant="layout.verticalAlign" py={3} sx={{ width: '100%' }} mr={2}>
      <TraderIcon trader={trader} />
      <Text ml={3}>{TraderLabels[trader]}</Text>
      <Text
        ml="auto"
        sx={{
          color: selected ? 'rBlue' : 'text',
          textDecoration: disabled ? 'line-through' : 'none',
        }}
      >
        ${formatCurrency(amount)}
      </Text>
    </Box>
  </SelectableBox>
)

const ConfirmClaim = ({
  trader,
  erc20s,
}: {
  trader: Trader
  erc20s: Address[]
}) => {
  const rTokenContracts = useAtomValue(rTokenContractsAtom)
  const availableRewards = useAtomValue(traderRewardsAtom)
  const wallet = useAtomValue(walletAtom)
  const setSession = useSetAtom(auctionSessionAtom)

  const claimAmount = useMemo(() => {
    // this is usually just a 2 item array
    return availableRewards[trader].tokens.reduce((amount, asset) => {
      if (erc20s.includes(asset.address)) {
        amount += asset.amount
      }

      return amount
    }, 0)
  }, [erc20s, availableRewards])

  const transaction = useMemo(() => {
    if (!erc20s.length || !rTokenContracts) {
      return undefined
    }

    return {
      abi: RevenueTrader,
      functionName: 'multicall',
      address: rTokenContracts[trader].address,
      args: [
        erc20s.map((erc20) =>
          encodeFunctionData({
            abi: RevenueTrader,
            functionName: 'claimRewardsSingle',
            args: [erc20],
          })
        ),
      ],
    }
  }, [erc20s, rTokenContracts])

  // Fetch refresh state after claiming
  const handleSuccess = () => {
    setSession(Math.random())
  }

  return (
    <Box variant="layout.verticalAlign" mt={3} mb={4}>
      <Text variant="legend" sx={{ fontSize: 1 }}>
        {!erc20s.length && <Trans>Please select an asset to claim</Trans>}
        {!!erc20s.length && !wallet && (
          <Trans>Please connect your wallet</Trans>
        )}
      </Text>
      <ExecuteButton
        text={t`Claim $${formatCurrency(claimAmount)}`}
        small
        ml="auto"
        txLabel="Claim rewards"
        onSuccess={handleSuccess}
        successLabel="Success!"
        call={transaction}
      />
    </Box>
  )
}

const TraderEmissions = ({ trader, ...props }: Props) => {
  const availableRewards = useAtomValue(traderRewardsAtom)
  const [selected, setSelected] = useState<Address[]>([])
  const [isOpen, setOpen] = useState(false)
  const noBalance = availableRewards[trader].total < 1

  const handleSelect = (address: Address) => {
    const index = selected.indexOf(address)

    if (index !== -1) {
      setSelected([...selected.slice(0, index), ...selected.slice(index + 1)])
    } else {
      setSelected([...selected, address])
    }
  }

  const handleSelectAll = () => {
    // Unselect all
    if (selected.length) {
      setOpen(false)
      setSelected([])
    } else {
      setOpen(true)
      const tokens: Address[] = []

      for (const erc20 of availableRewards?.[trader].tokens ?? []) {
        if (erc20.amount > MIN_DOLLAR_VALUE) {
          tokens.push(erc20.address)
        }
      }

      if (tokens.length) {
        setSelected(tokens)
      } else {
        // In case there are no rewards over
        setSelected([
          ...(availableRewards?.[trader].tokens ?? []).map((t) => t.address),
        ])
      }
    }
  }

  return (
    <CollapsableBox
      open={isOpen}
      onToggle={setOpen}
      mt={3}
      header={
        <TraderHeading
          onSelect={handleSelectAll}
          trader={trader}
          selected={!!selected.length}
          amount={availableRewards[trader].total}
          disabled={noBalance}
        />
      }
    >
      {availableRewards[trader].tokens.map((erc20) => {
        const isSelected = selected.includes(erc20.address)
        const isBelowMin = erc20.amount < MIN_DOLLAR_VALUE

        const amountColor = isBelowMin
          ? 'secondaryText'
          : isSelected
          ? 'rBlue'
          : 'text'

        return (
          <SelectableBox
            key={`${trader}-${erc20.symbol}`}
            unavailable={noBalance || erc20.amount < 1}
            selected={isSelected}
            onSelect={() => handleSelect(erc20.address)}
          >
            <Box
              variant="layout.verticalAlign"
              py={3}
              sx={{ width: '100%' }}
              mr={2}
            >
              <TokenLogo symbol={erc20.symbol} />
              <Text ml={3} mr="auto">
                {erc20.symbol}
              </Text>
              {isBelowMin && (
                <Help
                  content={t`The amount of assets selected affects the gas price, this asset may not be worth claiming yet.`}
                />
              )}
              <Text
                ml="2"
                sx={{
                  color: amountColor,
                  textDecoration: isBelowMin ? 'line-through' : 'none',
                }}
              >
                ${formatCurrency(erc20.amount)}
              </Text>
            </Box>
          </SelectableBox>
        )
      })}
      <ConfirmClaim trader={trader} erc20s={selected} />
      <Divider mx={-4} />
    </CollapsableBox>
  )
  // return (
  //   <CollapsableBox
  //     header={
  //       <SelectableBox
  //         selected={selected.includes(true)}
  //         onSelect={handleSelectAll}
  //       >
  //         <Info
  //           title="Rewards"
  //           icon={<TokenLogo symbol={data.asset.token.symbol} />}
  //           subtitle={
  //             <Box variant="layout.verticalAlign">
  //               <Text>
  //                 {formatCurrency(data.amount)} {data.asset.token.symbol}
  //               </Text>
  //               <Text ml={2} sx={{ fontSize: 0 }}>
  //                 (${formatCurrency(data.amountUsd)})
  //               </Text>
  //             </Box>
  //           }
  //         />
  //       </SelectableBox>
  //     }
  //     mt={3}
  //     {...props}
  //   >
  //     <Box ml="36px" mr="20px">
  //       {TRADERS.map((trader, index) => {
  //         if (data[trader] * data.asset.priceUsd < 0.1) {
  //           return null
  //         }

  //         return (
  //           <SelectableBox
  //             pt={index ? 2 : 0}
  //             mt={index ? 2 : 0}
  //             key={trader}
  //             sx={{
  //               borderTop: index ? '1px solid' : 'none',
  //               borderColor: 'border',
  //             }}
  //             selected={!!selected[data.asset.token.address]?.[trader]}
  //             onSelect={() =>
  //               handleTokenTraderSelect(
  //                 trader,
  //                 !selected[data.asset.token.address]?.[trader]
  //               )
  //             }
  //           >
  //             <Box sx={{ width: '100%' }} mr={3} variant="layout.verticalAlign">
  //               <Text>{TraderLabels[trader]}</Text>
  //               <Text ml="auto" variant="strong" sx={{ fontSize: 1 }}>
  //                 ${formatCurrency(data[trader] * data.asset.priceUsd)}
  //               </Text>
  //             </Box>
  //           </SelectableBox>
  //         )
  //       })}
  //     </Box>
  //   </CollapsableBox>
  // )
}

export default TraderEmissions

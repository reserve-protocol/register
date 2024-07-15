import LargeTreeIcon from 'components/icons/LargeTreeIcon'
import YieldIcon from 'components/icons/YieldIcon'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
import { formatCurrency, formatPercentage } from 'utils'
import { allWalletsAccountsAtom, currentWalletAtom } from '../atoms'

const YieldIcons = ({ id }: { id: string }) => (
  <>
    <YieldIcon key={`1${id}`} fontSize={180} width={50} />,
    <YieldIcon key={`2${id}`} height={133} width={37} />,
    <YieldIcon key={`3${id}`} height={99} width={30} />,
    <YieldIcon key={`4${id}`} height={73} width={24} />,
    <YieldIcon key={`5${id}`} height={54} width={15} />,
    <YieldIcon key={`6${id}`} height={40} width={13} />,
    <YieldIcon key={`7${id}`} height={30} width={8} />,
  </>
)

const Chip = ({
  children,
  sx,
  ...props
}: { children: React.ReactNode } & BoxProps) => (
  <Box
    sx={{
      backgroundColor: 'background',
      border: '1px solid',
      borderColor: 'accentInverted',
      color: 'accentInverted',
      borderRadius: 50,
      fontSize: 1,
      px: '10px',
      py: '2px',
      ...sx,
    }}
    {...props}
  >
    {children}
  </Box>
)

const HoldingsOverview = () => {
  const currentWallet = useAtomValue(currentWalletAtom)
  const accountsData = useAtomValue(allWalletsAccountsAtom)

  const [holdings, earnings, earningsPercentage] = useMemo(() => {
    const data = accountsData[currentWallet?.toLowerCase() ?? '']

    const _holdings = data?.holdings ?? 0
    const _holdings30dAgo = data?.holdings30dAgo ?? 0
    const _earnings = _holdings - _holdings30dAgo
    const _earningsPercentage = (_earnings / (_holdings30dAgo || 1)) * 100

    return [_holdings, _earnings, _earningsPercentage]
  }, [accountsData, currentWallet])

  return (
    <Box sx={{ position: 'relative' }}>
      <Flex
        sx={{
          alignItems: 'center',
          flexDirection: 'column',
          minHeight: 200,
          gap: 2,
        }}
      >
        <Box mt={-5}>
          <LargeTreeIcon />
        </Box>
        <Text sx={{ display: 'block' }}>Total Reserve Protocol holdings</Text>
        <Text sx={{ color: 'primary', fontSize: 7 }} variant="bold">
          ${formatCurrency(holdings)}
        </Text>
        <Box variant="layout.verticalAlign" sx={{ gap: 0 }}>
          <Chip sx={{ zIndex: 1 }}>
            <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
              {formatPercentage(earningsPercentage)}
              <Text color="text" opacity={0.7}>
                (last 30d)
              </Text>
            </Box>
          </Chip>
          <Chip ml={-2}>
            {earnings < 0 ? '-' : '+'}${formatCurrency(Math.abs(earnings))}
          </Chip>
        </Box>
      </Flex>

      <Flex
        sx={{
          position: 'absolute',
          gap: 3,
          alignItems: 'flex-end',
          flexDirection: 'row',
          bottom: 0,
          color: '#e5e5e5',
        }}
      >
        <YieldIcons id="left" />
      </Flex>
      <Flex
        sx={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          gap: 3,
          alignItems: 'flex-end',
          flexDirection: 'row-reverse',
          color: '#e5e5e5',
        }}
      >
        <YieldIcons id="right" />
      </Flex>
    </Box>
  )
}

export default HoldingsOverview

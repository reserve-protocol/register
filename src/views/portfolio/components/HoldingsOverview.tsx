import TreeIcon from 'components/icons/TreeIcon'
import YieldIcon from 'components/icons/YieldIcon'
import { useAtomValue } from 'jotai'
import { Box, Flex, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
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

const HoldingsOverview = () => {
  const currentWallet = useAtomValue(currentWalletAtom)
  const accountsData = useAtomValue(allWalletsAccountsAtom)

  return (
    <Box sx={{ position: 'relative' }}>
      <Flex
        sx={{ alignItems: 'center', flexDirection: 'column', minHeight: 200 }}
      >
        <Box mt={-4}>
          <TreeIcon />
        </Box>
        <Text mt="2" sx={{ display: 'block' }}>
          Total Reserve Protocol holdings
        </Text>
        <Text sx={{ color: 'primary', fontSize: 7 }} variant="bold">
          $
          {formatCurrency(
            accountsData[currentWallet?.toLowerCase() ?? '']?.holdings ?? 0
          )}
        </Text>
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

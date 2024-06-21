import TreeIcon from 'components/icons/TreeIcon'
import YieldIcon from 'components/icons/YieldIcon'
import { Box, Flex, Text } from 'theme-ui'

const YieldIcons = [
  <YieldIcon fontSize={180} width={50} />,
  <YieldIcon height={133} width={37} />,
  <YieldIcon height={99} width={30} />,
  <YieldIcon height={73} width={24} />,
  <YieldIcon height={54} width={15} />,
  <YieldIcon height={40} width={13} />,
  <YieldIcon height={30} width={8} />,
]

const HoldingsOverview = () => {
  return (
    <Box sx={{ position: 'relative' }}>
      <Flex
        sx={{ alignItems: 'center', flexDirection: 'column', minHeight: 200 }}
      >
        <TreeIcon />
        <Text mt="2" sx={{ display: 'block' }}>
          Total Reserve protocol holdings
        </Text>
        <Text sx={{ color: 'primary', fontSize: 7 }} variant="bold">
          $3,387,566.00
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
        {YieldIcons}
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
        {YieldIcons}
      </Flex>
    </Box>
  )
}

export default HoldingsOverview

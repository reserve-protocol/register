import Button from 'components/button'
import { Box, Text } from 'theme-ui'
import useDivaPoints from './hooks/useDivaPoints'
import { ArrowUpRight } from 'react-feather'
import DivaIcon from 'components/icons/DivaIcon'
import AsteriskIcon from 'components/icons/AsteriskIcon'

const DivaPointsEarned = () => {
  const { userRewards } = useDivaPoints()

  if (!userRewards) return null

  return (
    <Box
      mt={4}
      mb={1}
      ml={4}
      py={1}
      px={2}
      variant="layout.verticalAlign"
      sx={{
        gap: 1,
        border: '1px solid',
        borderRadius: '8px',
        borderColor: 'border',
        width: 'fit-content',
      }}
    >
      <AsteriskIcon />
      <Text mr={1}>Points earned:</Text>
      <DivaIcon />
      <Text sx={{ fontWeight: 'bold' }}>{userRewards} Diva</Text>
      <Button
        ml={1}
        small
        disabled
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        Claim <ArrowUpRight size={14} />
      </Button>
    </Box>
  )
}

export default DivaPointsEarned

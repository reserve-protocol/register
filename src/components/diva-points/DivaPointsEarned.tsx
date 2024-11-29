import Button from 'components/button'
import { Box, Text } from 'theme-ui'
import useDivaPoints from './hooks/useDivaPoints'
import { ArrowUpRight } from 'lucide-react'
import DivaIcon from 'components/icons/DivaIcon'
import AsteriskIcon from 'components/icons/AsteriskIcon'

const DivaPointsEarned = () => {
  return (
    <Box
      mt={4}
      mb={1}
      ml={4}
      py={1}
      px={2}
      variant="layout.verticalAlign"
      sx={{
        gap: 2,
        border: '1px solid',
        borderRadius: '8px',
        borderColor: 'border',
        width: 'fit-content',
      }}
    >
      <DivaIcon />
      <Text mr={1}>Nektar Drops:</Text>
      <Button
        ml={1}
        small
        variant="muted"
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        onClick={() => {
          window.open('https://app.fuul.xyz/points/nektar', '_blank')
        }}
      >
        Check <ArrowUpRight size={14} />
      </Button>
    </Box>
  )
}

export default DivaPointsEarned

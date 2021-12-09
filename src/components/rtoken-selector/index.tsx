import { Flex, Text } from '@theme-ui/components'
import RTokenIcon from 'components/icons/logos/RTokenIcon'
import { useSelector } from 'react-redux'
import { useAppSelector } from 'state/hooks'
import { selectCurrentRToken } from 'state/reserve-tokens/reducer'

const RTokenSelector = () => {
  const { token } = useSelector(selectCurrentRToken) ?? {}

  if (!token) {
    return <span>Loading...</span>
  }

  return (
    <Flex sx={{ alignItems: 'center' }}>
      <RTokenIcon style={{ fontSize: 32, marginRight: '1rem' }} />
      <Text sx={{ fontWeight: 'bold' }}>{token.name}</Text>
    </Flex>
  )
}

export default RTokenSelector

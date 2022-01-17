import { Text } from '@theme-ui/components'
import { useSelector } from 'react-redux'
import { selectCurrentRToken } from 'state/reserve-tokens/reducer'

const ContentHeader = () => {
  // TODO: Get title or token from props
  const RToken = useSelector(selectCurrentRToken)

  if (!RToken) {
    return null
  }

  return (
    <Text
      sx={{
        display: 'block',
        fontSize: 7,
        fontWeight: 200,
      }}
    >
      {RToken.token.symbol}
    </Text>
  )
}

export default ContentHeader

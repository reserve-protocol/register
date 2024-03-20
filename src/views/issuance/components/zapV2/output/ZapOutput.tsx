import Skeleton from 'react-loading-skeleton'
import { Text } from 'theme-ui'
import { useZap } from '../context/ZapContext'

const ZapOutput = () => {
  const { amountOut, loadingZap } = useZap()

  if (loadingZap) {
    return <Skeleton height={30} width={320} />
  }

  return <Text variant="strong">{amountOut}</Text>
}

export default ZapOutput

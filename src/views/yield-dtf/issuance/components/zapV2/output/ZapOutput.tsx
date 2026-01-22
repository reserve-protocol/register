import Skeleton from 'react-loading-skeleton'
import { useZap } from '../context/ZapContext'

const ZapOutput = () => {
  const { amountOut, loadingZap } = useZap()

  if (loadingZap) {
    return <Skeleton height={30} width={320} />
  }

  return <span className="font-semibold">{amountOut}</span>
}

export default ZapOutput

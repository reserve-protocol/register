import { useFormContext } from 'react-hook-form'

const Ticker = () => {
  const { watch } = useFormContext()
  const symbol = watch('symbol') || '$TICKER'

  return <span className="font-semibold">{symbol}</span>
}

export default Ticker

import { useFormContext } from 'react-hook-form'

const Ticker = ({ defaultSymbol = '$TICKER' }: { defaultSymbol: string }) => {
  const { watch } = useFormContext()
  const symbol = watch('symbol') || defaultSymbol

  return <span className="font-semibold">{symbol}</span>
}

export default Ticker

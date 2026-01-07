const InputPostfix = ({
  amount,
  symbol,
}: {
  amount: string
  symbol: string
}) => (
  <div className="absolute top-0 left-0 -z-10 text-xl font-semibold">
    <span className="invisible">{amount}</span>
    <span className="ml-2 text-legend select-none">{symbol}</span>
  </div>
)

export default InputPostfix

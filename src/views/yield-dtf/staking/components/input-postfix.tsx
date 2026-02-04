const InputPostfix = ({
  amount,
  symbol,
}: {
  amount: string
  symbol: string
}) => (
  <div className="absolute top-0 left-0 h-10 flex items-center text-3xl pointer-events-none">
    <span className="invisible">{amount}</span>
    <span className="ml-2 text-legend select-none">{symbol}</span>
  </div>
)

export default InputPostfix

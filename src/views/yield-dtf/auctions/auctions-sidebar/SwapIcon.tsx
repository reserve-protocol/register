import TokenLogo from 'components/icons/TokenLogo'

const SwapIcon = ({ buy, sell }: { buy: string; sell: string }) => (
  <div className="relative w-5">
    <TokenLogo
      symbol={buy}
      width={20}
      className="absolute z-[1] bg-white"
      style={{ bottom: '-3px' }}
    />
    <TokenLogo
      width={20}
      symbol={sell}
      className="absolute"
      style={{ top: '-3px' }}
    />
  </div>
)

export default SwapIcon

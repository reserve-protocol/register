import TokenInfo from './token-info'
import TokenMandate from './token-mandate'
import TokenStats from './token-stats'

const Hero = () => (
  <div className="mx-4 sm:mx-8 mt-6">
    <TokenInfo />
    <div className="mt-8 sm:mt-16 gap-6 grid grid-cols-1 2xl:grid-cols-[3fr_2fr] items-end">
      <TokenStats />
      <TokenMandate />
    </div>
  </div>
)

export default Hero

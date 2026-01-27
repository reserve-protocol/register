import Portfolio from './components/Portfolio'
import RegisterAbout from '@/views/discover/components/yield/components/RegisterAbout'

const PortfolioWrapper = () => {
  return (
    <>
      <div className="max-w-[95em] mx-auto px-1 sm:px-6 py-1 sm:py-8">
        <Portfolio />
      </div>
      <RegisterAbout />
    </>
  )
}

export default PortfolioWrapper

import { Box, Grid } from 'theme-ui'
import About from './components/About'
import UseCases from './components/UseCases'
import RegisterAbout from '@/views/discover/components/yield/components/RegisterAbout'
import HistoricalTVL from './components/historical-tvl'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const Hero = () => (
  <div className="grid lg:grid-cols-2 grid-cols-1 divide-x divide-white rounded-sm bg-primary relative h-[506px]">
    <HistoricalTVL />
    <div className="hidden lg:block overflow-hidden">
      <img
        alt="hero-splash"
        src="https://storage.reserve.org/hero-splash.png"
        className="w-full h-full object-cover"
      />
    </div>
  </div>
)
const DTFCategory = ({
  title,
  description,
  subtitle,
  image,
}: {
  title: string
  description: string
  subtitle: string
  image: string
}) => {
  return (
    <div
      className={`border rounded-2xl bg-[url('${image}')] bg-cover bg-center`}
    >
      <div className="h-64"></div>
      <div className="bg-card rounded-2xl p-4 m-1">
        <h3 className="text-2xl">{title} -</h3>
        <h4 className="text-2xl text-primary">{subtitle}</h4>
        <p className="my-2">{description}</p>
        <div className="flex items-center">
          <h4 className="text-xl font-bold text-primary">View all {title}</h4>
          <Button size="icon-rounded" className="ml-auto">
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  )
}

const DTFCategories = () => {
  return (
    <div>
      <div className="my-6 text-center">
        <h2 className="text-primary text-xl font-bold">Our DTF Categories</h2>
      </div>
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
        <DTFCategory
          title="Index DTFs"
          subtitle="Simple index exposure to narratives"
          description="Reserve's RToken Factory Contracts: A platform for creating tokens
          backed by a diverse array of ERC20 collateral."
          image="https://storage.reserve.org/index-dtf-cover.png"
        />
        <DTFCategory
          title="Yield DTFs"
          subtitle="Stable to a peg & overcollateralized"
          description="Reserve's RToken Factory Contracts: A platform for creating tokens
          backed by a diverse array of ERC20 collateral."
          image="https://storage.reserve.org/yield-dtf-cover.png"
        />
      </div>
    </div>
  )
}

const Home = () => (
  <div className="container px-4 mb-6">
    <div className="text-primary">
      <svg viewBox="0 0 131 18">
        <text x="0" y="14" fill="currentColor">
          Indexing the world
        </text>
      </svg>
    </div>
    <Hero />
    <DTFCategories />
    <RegisterAbout />
  </div>
)

export default Home

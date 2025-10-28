import { useEffect, useState } from 'react'
import RegisterAbout from '../discover/components/yield/components/RegisterAbout'
import useFilteredDTFIndex from '../discover/components/index/hooks/use-filtered-dtf-index'
import DTFCarouselSimple from './components/dtf-carousel-simple'

const DTFs = () => (
  <div className="flex flex-col flex-shrink-0 pt-1">
    <div className="rounded-full border border-primary-foreground w-8 h-8 flex items-center justify-center">
      D
    </div>
    <div className="rounded-full border border-primary-foreground w-8 h-8 flex items-center justify-center -mt-[5px]">
      T
    </div>
    <div className="rounded-full border border-primary-foreground w-8 h-8 flex items-center justify-center -mt-[5px]">
      F
    </div>
    <div className="rounded-full border border-primary-foreground w-8 h-8 flex items-center justify-center -mt-[5px]">
      S
    </div>
  </div>
)

const Hero = () => {
  const [fadeStyle, setFadeStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition =
        document.getElementById('app-container')?.scrollTop || 0
      const fadeStart = 0
      const fadeEnd = 200 // Faster fade for better transition to cards

      if (scrollPosition <= fadeStart) {
        setFadeStyle({
          opacity: 1,
          filter: 'blur(0px)',
          transform: 'translateY(0px)',
        })
      } else if (scrollPosition >= fadeEnd) {
        setFadeStyle({
          opacity: 0,
          filter: 'blur(8px)',
          transform: 'translateY(-20px)',
        })
      } else {
        const progress = (scrollPosition - fadeStart) / (fadeEnd - fadeStart)
        const opacity = 1 - progress
        const blur = progress * 8
        const translateY = progress * -20
        setFadeStyle({
          opacity,
          filter: `blur(${blur}px)`,
          transform: `translateY(${translateY}px)`,
          transition: 'none', // Disable transition for smooth real-time updates
        })
      }
    }

    const container = document.getElementById('app-container')
    container?.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      container?.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div
      className="flex gap-6 text-primary-foreground mt-28 mb-12 mx-6"
      style={fadeStyle}
    >
      <DTFs />
      <h1 className="text-5xl leading-[1.3] max-w-[640px]">
        Decentralized Token Folios Like ETFs, but for crypto
      </h1>
      <div className="ml-auto w-96">
        <p className="text-xl">
          Crypto markets, sectors and strategies packaged into one-click
          indexes–transparent & decentralized on the blockchain.
        </p>
      </div>
    </div>
  )
}

const DTFCards = () => {
  const { data, isLoading } = useFilteredDTFIndex()

  return <DTFCarouselSimple dtfs={data} isLoading={isLoading} />
}

const Home = () => {
  return (
    <>
      <div className="bg-primary relative min-h-screen">
        <div className="container pt-20 relative px-4">
          <Hero />
        </div>
        <div className="relative z-20 px-2">
          <DTFCards />
        </div>
        <div className="bg-secondary">
          <div className="container pt-20 relative z-20 px-4">
            <RegisterAbout />
          </div>
        </div>
      </div>
    </>
  )
}

export default Home

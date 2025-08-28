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
  return (
    <div className="flex gap-6 text-primary-foreground mt-28">
      <DTFs />
      <h1 className="text-5xl leading-[1.3] max-w-[640px]">
        Decentralized Token Folios Like ETFs, but for crypto
      </h1>
      <div className="ml-auto w-80">
        <p className="text-xl">
          Crypto markets, sectors and strategies packaged into one-click
          indexes–transparent & decentralized on the blockchain.
        </p>
      </div>
    </div>
  )
}

const Cover = () => {
  return (
    <div className="cloudy-pattern-bg absolute left-0 right-0 top-0 h-[800px] z-0" />
  )
}

const Home = () => {
  return (
    <div className="bg-secondary -mt-20 ">
      <Cover />
      <div className="container pt-20 relative z-10 px-4">
        <Hero />
      </div>
    </div>
  )
}

export default Home

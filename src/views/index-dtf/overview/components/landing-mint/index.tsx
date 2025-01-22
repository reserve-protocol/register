import React from 'react'

const IMG_SRC = 'https://storage.reserve.org/dtf-details.webp'

const MintBox = () => {
  return <div className="rounded-2xl bg-border h-96 mt-2 "></div>
}

const LandingMint = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className="hidden xl:block " {...props}>
      <img width={475} height={424} alt="DTF meme" src={IMG_SRC} />
      <div className="sticky top-0">
        <MintBox />
      </div>
    </div>
  )
}

export default LandingMint

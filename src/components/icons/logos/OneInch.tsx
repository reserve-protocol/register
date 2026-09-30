// Reuses the 1inch mark already shipped for the 1INCH token logo — no second
// copy of the asset, and it stays out of the JS bundle.
const OneInch = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img src="/svgs/1inch.svg" alt="" {...props} />
)

export default OneInch

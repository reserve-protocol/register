interface BeefyProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string
}

const Beefy = ({ width = 16, ...props }: BeefyProps) => {
  return <img width={width} src="/imgs/beefy.png" {...props} />
}
export default Beefy

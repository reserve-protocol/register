interface DysonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string
}

const Dyson = ({ width = 16, ...props }: DysonProps) => {
  return <img width={width} src="/imgs/dyson.png" {...props} />
}
export default Dyson

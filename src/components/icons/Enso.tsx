interface EnsoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string
}

const Enso = ({ width = 16, ...props }: EnsoProps) => {
  return <img width={width} src="/imgs/enso.png" {...props} />
}
export default Enso

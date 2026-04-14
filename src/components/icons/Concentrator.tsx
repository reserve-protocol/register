interface ConcentratorProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string
}

const Concentrator = ({ width = 16, ...props }: ConcentratorProps) => {
  return <img width={width} src="/imgs/concentrator.png" {...props} />
}
export default Concentrator

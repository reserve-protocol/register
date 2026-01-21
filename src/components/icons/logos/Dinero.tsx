interface DineroProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string
}

const Dinero = ({ width = 16, ...props }: DineroProps) => {
  return <img width={width} src="/imgs/dinero.png" {...props} />
}
export default Dinero

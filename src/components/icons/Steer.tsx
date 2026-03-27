interface SteerProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string
}

const Steer = ({ width = 16, ...props }: SteerProps) => {
  return <img width={width} src="/imgs/steer.png" {...props} />
}
export default Steer

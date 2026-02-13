interface StaderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string
}

const Stader = ({ width = 16, ...props }: StaderProps) => {
  return <img width={width} src="/svgs/stader.svg" {...props} />
}
export default Stader

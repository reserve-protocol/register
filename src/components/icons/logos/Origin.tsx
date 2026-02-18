interface OriginProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string
}

const Origin = ({ width = 16, ...props }: OriginProps) => {
  return (
    <img width={width} src="https://storage.reserve.org/origin.svg" {...props} />
  )
}
export default Origin

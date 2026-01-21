interface SkyProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string
}

const Sky = ({ width = 16, ...props }: SkyProps) => {
  return (
    <img width={width} src="https://storage.reserve.org/sky.svg" {...props} />
  )
}
export default Sky

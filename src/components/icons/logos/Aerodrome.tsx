interface AerodromeProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string
}

const Aerodrome = ({ width = 16, ...props }: AerodromeProps) => {
  return <img width={width} src="/imgs/aerodrome.png" {...props} />
}
export default Aerodrome

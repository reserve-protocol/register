interface CamelotProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string
}

const Camelot = ({ width = 16, ...props }: CamelotProps) => {
  return <img width={width} src="/svgs/camelot.svg" {...props} />
}
export default Camelot

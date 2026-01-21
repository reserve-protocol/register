interface CurveProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string
}

const Curve = ({ width = 16, ...props }: CurveProps) => {
  return <img width={width} src="/imgs/curve.png" {...props} />
}

export default Curve

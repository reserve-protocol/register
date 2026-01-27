interface DivaIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string
}

const DivaIcon = ({ width = 20, ...props }: DivaIconProps) => {
  return <img width={width} src="/imgs/nektar.png" {...props} />
}
export default DivaIcon

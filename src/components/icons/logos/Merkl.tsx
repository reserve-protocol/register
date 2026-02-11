interface MerklProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string
}

const Merkl = ({ width = 16, ...props }: MerklProps) => {
  return <img width={width} src="/svgs/merkl.svg" {...props} />
}
export default Merkl

interface EthenaProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string
}

const Ethena = ({ width = 16, ...props }: EthenaProps) => {
  return <img width={width} src="/svgs/ethena.svg" {...props} />
}
export default Ethena

interface EtherfiProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number
}

const Etherfi = ({ width = 16, ...props }: EtherfiProps) => {
  return (
    <img
      width={width}
      src="https://storage-logos.reserve.org/logos/ethfi.svg"
      alt="Etherfi"
      {...props}
    />
  )
}
export default Etherfi

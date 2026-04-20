import { useEnsName } from '@/hooks/use-ens-name'

const EnsName = ({
  address,
  className,
}: {
  address: string
  className?: string
}) => {
  const name = useEnsName(address)
  return <span className={className}>{name}</span>
}

export default EnsName

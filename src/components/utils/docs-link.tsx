import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'

interface Props {
  link: string
  size?: number
}

const DocsLink = ({ link }: Props) => {
  return (
    <div
      onClick={() => window.open(link, '_blank')}
      className="flex cursor-pointer ml-2 mt-1"
    >
      <ExternalArrowIcon />
    </div>
  )
}

export default DocsLink

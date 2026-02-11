import { Button } from '@/components/ui/button'
import AsteriskIcon from 'components/icons/AsteriskIcon'
import { useState } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
}

const ShowMore = ({ children, className }: Props) => {
  const [isVisible, setVisible] = useState(false)

  return (
    <div className={className}>
      <div className="flex items-center">
        <div className="flex-grow border-t border-dashed border-border" />
        <Button size="sm" variant="ghost" onClick={() => setVisible(!isVisible)}>
          <span className="flex items-center text-muted-foreground">
            <span className="mr-2">Show more</span>
            <AsteriskIcon />
          </span>
        </Button>
        <div className="flex-grow border-t border-dashed border-border" />
      </div>
      {isVisible && <div className="mt-2">{children}</div>}
    </div>
  )
}

export default ShowMore

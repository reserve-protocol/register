import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { navigationIndexAtom } from './atoms'

interface Props {
  title?: string
  sections: string[]
  initialIndex?: number
  className?: string
}

const Navigation = ({
  title,
  sections,
  initialIndex = 0,
  className,
}: Props) => {
  const [current, setNavigationIndex] = useAtom(navigationIndexAtom)

  useEffect(() => {
    return () => {
      setNavigationIndex([])
    }
  }, [])

  const handleNavigate = (index: number) => {
    const target = document.getElementById(`section-${index}`)
    const wrapper = document.getElementById('app-container')

    if (target && wrapper) {
      const count = target.offsetTop - wrapper.scrollTop - 20
      wrapper.scrollBy({ top: count, left: 0, behavior: 'smooth' })
    }
  }

  const active = Math.min(...current)

  return (
    <div className={cn('h-fit mb-8', className)}>
      {!!title && <h3 className="text-xl font-bold mb-4">{title}</h3>}
      <ul className="list-none p-0 border-l border-dashed border-border">
        {sections.map((item, index) => {
          const currentIndex = index + initialIndex
          const isActive = active === currentIndex

          return (
            <li
              key={item}
              onClick={() => !isActive && handleNavigate(currentIndex)}
              className={cn(
                'leading-4 cursor-pointer',
                index > 0 && 'mt-4',
                isActive ? 'border-l-[3px] border-foreground pl-[13px]' : 'pl-4'
              )}
            >
              <span className={cn(isActive ? 'text-primary' : 'text-legend')}>
                {item}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default Navigation

import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { motion, AnimatePresence } from 'motion/react'
import { memo } from 'react'
import DTFHomeCard from './dtf-home-card'

interface DTFCarouselCardProps {
  dtf: IndexDTFItem
  index: number
  currentIndex: number
  isVisible: boolean
  isFirstLoad?: boolean
}

const DTFCarouselCard = memo(
  ({ dtf, index, currentIndex, isVisible, isFirstLoad = false }: DTFCarouselCardProps) => {
    const position = index - currentIndex

    // Only render if card is visible (for lazy loading)
    if (!isVisible) return null

    return (
      <AnimatePresence mode="wait">
        {position === 0 && (
          <motion.div
            key={`card-${index}`}
            initial={isFirstLoad ? false : {
              opacity: 0,
              scale: 0.8,
              rotateX: position < 0 ? -45 : 45,
              y: position < 0 ? -200 : 200,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateX: 0,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              rotateX: position < 0 ? 45 : -45,
              y: position < 0 ? 200 : -200,
            }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
            }}
            style={{
              perspective: 1200,
              transformStyle: 'preserve-3d',
            }}
            className="absolute inset-x-0 top-0 w-full"
          >
            <div className="relative w-full">
              <DTFHomeCard dtf={dtf} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
)

DTFCarouselCard.displayName = 'DTFCarouselCard'

export default DTFCarouselCard
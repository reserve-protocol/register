import { Skeleton } from '@/components/ui/skeleton'

// Simplified skeleton card with fewer elements for better performance
// IMPORTANT: Height must be at least 697px to match the carousel cards
const SkeletonCard = () => {
  return (
    <div className="w-full rounded-4xl max-w-[1400px] mx-auto bg-card border border-primary-foreground" style={{ minHeight: '697px' }}>
      <div className="grid lg:grid-cols-[320px_1fr_1fr] xl:grid-cols-[380px_1fr_1fr] gap-0 h-full" style={{ minHeight: '697px' }}>
        {/* Left Card - Simplified */}
        <div className="flex flex-col gap-2 border-r p-2" style={{ minHeight: '697px' }}>
          <div className="flex-1 flex items-center justify-center">
            <Skeleton className="w-full aspect-square rounded-3xl" />
          </div>
          <div className="bg-card rounded-3xl p-4">
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>

        {/* Middle Section - Simplified */}
        <div className="w-full p-6 flex flex-col" style={{ minHeight: '697px' }}>
          <Skeleton className="h-12 w-12 rounded-full mb-4" />
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-7 w-32 mb-1" />
          <Skeleton className="h-5 w-40 mb-6" />
          <Skeleton className="h-36 w-full mb-8" />
          <Skeleton className="h-6 w-full mb-8" />
          <Skeleton className="h-20 w-full" />
          <div className="flex-1" /> {/* Spacer to push content to fill height */}
        </div>

        {/* Right Section - Simplified */}
        <div className="bg-primary/10 p-6 flex flex-col" style={{ minHeight: '697px' }}>
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-5 w-48 mb-4" />
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
          <div className="flex-1" /> {/* Spacer to push content to fill height */}
        </div>
      </div>
    </div>
  )
}

const DTFSkeletonStack = () => {
  // Match carousel's viewport calculation: window.innerHeight - 72 (header height)
  const wrapperHeight = typeof window !== 'undefined'
    ? window.innerHeight - 72
    : 693 // fallback to specified height

  return (
    <section className="relative">
      <div
        className="relative w-full bg-primary"
        style={{
          height: `${wrapperHeight}px`,
          minHeight: `${wrapperHeight}px`
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-primary">
          <div
            className="relative w-full flex items-center justify-center"
            style={{ height: '720px' }}
          >
            <div
              className="relative"
              style={{ width: '100%', height: '720px' }}
            >
              {/* Stack of 3 skeleton cards matching carousel's stacking */}
              {[0, 1, 2].map((index) => {
                // Match carousel's stacking calculations
                const yOffset = index * 6 // CARD_OFFSET = 6
                const scale = 1 - index * 0.05 // SCALE_FACTOR = 0.05
                const opacity = index === 2 ? 0.5 : 1 // Last card at 50% opacity
                const zIndex = 3 - index

                return (
                  <div
                    key={index}
                    className="absolute inset-0"
                    style={{
                      transform: `translate3d(0, ${yOffset}px, 0) scale(${scale})`,
                      transformOrigin: 'bottom center',
                      opacity,
                      zIndex,
                      pointerEvents: 'none',
                    }}
                  >
                    <SkeletonCard />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DTFSkeletonStack
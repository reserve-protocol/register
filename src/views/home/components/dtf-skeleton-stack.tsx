import { Skeleton } from '@/components/ui/skeleton'

const SkeletonCard = () => {
  return (
    <div className="w-full rounded-4xl max-w-[1400px] mx-auto bg-card border border-primary-foreground">
      <div className="grid lg:grid-cols-[320px_1fr_1fr] xl:grid-cols-[380px_1fr_1fr] gap-0">
        {/* Left Card Skeleton - matching DTFLeftCard */}
        <div className="flex flex-col gap-2 h-full border-r p-2">
          <div className="flex-1 flex items-center justify-center">
            {/* Cover image skeleton */}
            <Skeleton className="w-full aspect-square rounded-3xl" />
          </div>
          {/* Zapper button skeleton */}
          <div className="bg-card rounded-3xl p-4">
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>

        {/* Middle Info Section Skeleton - matching DTFInfo */}
        <div className="h-full w-full">
          {/* Token Logo and Header */}
          <div className="flex items-center flex-shrink-0 p-6 pb-4">
            <Skeleton className="w-12 h-12 rounded-full" />
          </div>
          <div className="px-6">
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-7 w-32 mb-1" />
            <Skeleton className="h-5 w-40" />
          </div>

          {/* Chart Skeleton */}
          <div className="p-6">
            <Skeleton className="h-36 w-full mb-4" />
            <div className="flex items-center justify-between w-full">
              <Skeleton className="h-5 w-8" />
              <Skeleton className="h-5 w-8" />
              <Skeleton className="h-5 w-8" />
              <Skeleton className="h-5 w-8" />
              <Skeleton className="h-5 w-8" />
            </div>
          </div>

          {/* Market Cap */}
          <div className="flex items-center text-lg p-6 border-y">
            <Skeleton className="h-6 w-24 mr-auto" />
            <Skeleton className="h-6 w-32" />
          </div>

          {/* About Section */}
          <div className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>

        {/* Right Basket Section Skeleton - matching DTFBasket */}
        <div className="bg-primary/10 p-6">
          {/* Header with icons */}
          <div className="flex items-center mb-8">
            <Skeleton className="h-6 w-6" />
            <div className="flex items-center ml-auto gap-1">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Title */}
          <Skeleton className="h-5 w-48 mb-4" />

          {/* Token list */}
          <div className="flex flex-col gap-3 max-h-[400px]">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-4 w-32 mr-auto" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
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
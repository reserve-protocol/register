const EarnHero = ({
  title,
  subtitle,
}: {
  title: React.ReactNode
  subtitle: React.ReactNode
}) => (
  <div className="relative">
    <div className="relative mx-auto flex max-w-[95em] flex-col items-center px-4 pb-0 sm:px-6 md:px-3">
      <div className="flex flex-col items-center max-w-[900px] text-center">
        <h1 className="text-[1.875rem] leading-8 text-primary md:text-[3.5rem] md:leading-[62px]">
          {title}
        </h1>
        <p className="mt-3 max-w-[680px] text-sm leading-5 sm:text-base sm:leading-6 md:mt-4 md:text-lg md:leading-normal">
          {subtitle}
        </p>
      </div>
    </div>
  </div>
)

export default EarnHero

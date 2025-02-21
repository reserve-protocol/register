import Binoculars from '@/components/icons/Binoculars'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Play, Sparkle } from 'lucide-react'
import { SVGProps, useEffect, useState } from 'react'
import step1 from './imgs/Step=1.png'
import step2 from './imgs/Step=2.png'
import step3 from './imgs/Step=3.png'
import step4 from './imgs/Step=4.png'
import step5 from './imgs/Step=5.png'
import step6 from './imgs/Step=6.png'
import useMediaQuery from '@/hooks/useMediaQuery'
import { DrawerContent } from '@/components/ui/drawer'
import { Drawer } from '@/components/ui/drawer'
import { cn } from '@/lib/utils'

const Flower = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={32}
    height={32}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_18747_1164513)">
      <path
        d="M23.8537 5.39075L20.6317 0.494141H10.9657L7.74365 5.39075M23.8537 5.39075L15.7987 16.0001M23.8537 5.39075H7.74365M15.7987 16.0001L7.74365 5.39075M15.7987 16.0001L12.5767 5.39075L14.9932 0.494141M15.7987 16.0001L19.0207 5.39075L16.6042 0.494141"
        stroke="#0151AF"
        strokeWidth={0.969117}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23.8537 26.6093L20.6317 31.5059H10.9657L7.74365 26.6093M23.8537 26.6093L15.7987 15.9999M23.8537 26.6093H7.74365M15.7987 15.9999L7.74365 26.6093M15.7987 15.9999L12.5767 26.6093L14.9932 31.5059M15.7987 15.9999L19.0207 26.6093L16.6042 31.5059"
        stroke="#0151AF"
        strokeWidth={0.969117}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.32715 7.83911L0.494141 11.1035L0.494141 20.8967L5.32715 24.1611M5.32715 7.83911L15.7987 16.0001M5.32715 7.83911L5.32715 24.1611M15.7987 16.0001L5.32715 24.1611M15.7987 16.0001L5.32715 19.2645L0.494141 16.8162M15.7987 16.0001L5.32715 12.7357L0.494141 15.184"
        stroke="#0151AF"
        strokeWidth={0.969117}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26.6731 7.83911L31.5061 11.1035V20.8967L26.6731 24.1611M26.6731 7.83911L16.2016 16.0001M26.6731 7.83911V24.1611M16.2016 16.0001L26.6731 24.1611M16.2016 16.0001L26.6731 19.2645L31.5061 16.8162M16.2016 16.0001L26.6731 12.7357L31.5061 15.184"
        stroke="#0151AF"
        strokeWidth={0.969117}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={16.0066} cy={15.9999} r={2} fill="white" />
    </g>
    <defs>
      <clipPath id="clip0_18747_1164513">
        <rect width={32} height={32} fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const images = [step1, step2, step3, step4, step5, step6]

function Explainer() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative flex flex-col flex-grow sm:h-auto h-[393px] bg-[#021122]">
      {images.map((src, index) => (
        <img
          key={index}
          src={src || '/placeholder.svg'}
          alt={`Image ${index + 1}`}
          className={` absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  )
}

const Presentation = ({
  animation = true,
  onClose,
}: {
  animation?: boolean
  onClose: () => void
}) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2',
        !animation && 'grid-cols-1'
      )}
    >
      <div className={cn('flex', !animation && 'hidden')}>
        <Explainer />
      </div>
      <div className="flex flex-col h-auto sm:min-h-[487px]">
        <div className="flex flex-col flex-grow p-6">
          <Flower className="mb-6 hidden min-[967px]:block" />
          <div className="mt-auto mb-1 flex text-sm text-bold items-center w-fit gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary">
            <Sparkle size={14} strokeWidth={1} />
            New
          </div>
          <h1 className="text-primary text-[28px] max-[967px]:text-2xl font-semibold">
            Decentralized Token Folios (DTFs)
          </h1>
          <h2 className="text-[28px] max-[967px]:text-2xl font-semibold">
            Like ETFs, but for crypto.
          </h2>
          <p className="sm:hidden">
            Get diversified exposure to multiple projects with a single swap—no
            more managing individual tokens or constant rebalancing.
          </p>
          <p className="mt-1 hidden sm:block">
            Get broad market exposure or buy into narratives in a single click
            with the Reserve Index Protocol. Every Index DTF is
          </p>
          <ul className="list-disc list-inside ml-3 mt-1 hidden sm:block">
            <li>Backed 1:1</li>
            <li>Onchain with transparent custody </li>
            <li>Fully redeemable 24/7 for underlying assets</li>
          </ul>
        </div>
        <div className="sm:border-t sm:p-6 px-6 pb-6 flex gap-3 flex-col lg:flex-row">
          <Button variant="outline-primary" className="gap-1" size="lg">
            <Play size={16} />
            Watch our DTF Explainer
          </Button>
          <Button className="gap-1" size="lg" onClick={onClose}>
            <Binoculars />
            Discover DTFs
          </Button>
        </div>
      </div>
    </div>
  )
}

const Splash = () => {
  const [open, setOpen] = useState(true)
  const isDesktop = useMediaQuery('(min-width: 967px)')
  const animationFit = useMediaQuery('(min-height: 800px)')

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[967px] p-0 overflow-hidden sm:rounded-4xl">
          <Presentation onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="bottom">
      <DrawerContent
        showClose={false}
        className="bottom-0 top-auto md:left-0 md:right-0 md:w-full left-0 right-0 rounded-b-none overflow-hidden"
      >
        <Presentation animation={animationFit} onClose={() => setOpen(false)} />
      </DrawerContent>
    </Drawer>
  )
}

export default Splash

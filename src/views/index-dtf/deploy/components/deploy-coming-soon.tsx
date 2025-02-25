import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/utils/constants'
import { Combine, Globe, Palette, Zap } from 'lucide-react'
import SocialMediaInput from './social-media-input'

const DeployComingSoon = () => {
  return (
    <div className="container flex gap-1 p-1 bg-secondary rounded-4xl">
      <div className="flex flex-col flex-grow relative min-w-full lg:min-w-[420px] bg-background rounded-3xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="border rounded-full border-foreground p-2 mr-auto">
            <Globe size={14} />
          </div>
          <a
            href={ROUTES.DEPLOY_YIELD}
            target="_blank"
            className="text-legend underline"
          >
            Looking to create a Yield DTF?
          </a>
        </div>
        <h4 className="text-primary mt-auto font-semibold mb-1">
          Coming soon!
        </h4>
        <h1 className="text-3xl font-semibold ">Create an Index DTF</h1>
        <Separator className="my-6" />
        <ul>
          <li className="flex items-center gap-2 mb-4">
            <div className="border rounded-full border-foreground p-1.5">
              <Palette size={10} />
            </div>
            <span>
              Instantly create custom portfolios of any digital assets
            </span>
          </li>
          <li className="flex items-center gap-2 mb-4">
            <div className="border rounded-full border-foreground p-1.5">
              <Combine size={10} />
            </div>
            <span>Capture entire themes or sectors in one token</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="border rounded-full border-foreground p-1.5">
              <Zap size={10} />
            </div>
            <span>Mint or redeem instantly 24/7 </span>
          </li>
        </ul>
        <Separator className="my-6" />
        <h2 className="font-semibold mb-0.5">
          Want to be first in line to create an Index DTF?
        </h2>
        <p className="mb-4 max-w-[520px] text-legend">
          Leave your contact details below and ABC Labs will reach out to you
          when permissionless creation is ready!
        </p>
        <div>
          <SocialMediaInput />
        </div>
      </div>
      <div className="rounded-3xl flex-grow max-h-[940px] h-[calc(100vh-132px)] hidden lg:block">
        <img
          src="https://storage.reserve.org/splash.png"
          className="w-full h-full object-cover object-center rounded-3xl"
          alt="reserve splash"
        />
      </div>
    </div>
  )
}

export default DeployComingSoon

import { Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import DeployerImg from '../assets/deployer_img.png'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from 'utils/constants'

interface DeployHeroProps {
  className?: string
}

const DeployHero = ({ className }: DeployHeroProps) => {
  const navigate = useNavigate()

  const handleDeploy = () => {
    navigate(ROUTES.DEPLOY)
  }

  return (
    <div
      className={cn(
        'flex items-center px-6 py-2 border border-dashed border-blue-500 bg-background rounded-xl',
        className
      )}
    >
      <div className="hidden md:flex flex-col justify-center items-center shrink-0 border-r border-border h-[200px] pl-4 pr-10">
        <div className="w-[155px] h-[155px] rounded-full border border-dashed border-[#2775CA] flex justify-center items-center">
          <div className="w-[145px] h-[145px] rounded-full border border-dashed border-[#2775CA] flex justify-center items-center">
            <img width={100} height={100} src={DeployerImg} alt="Deployer" />
          </div>
        </div>
      </div>
      <div className="ml-0 md:ml-10 py-4 md:py-6">
        <h3 className="mb-2 text-xl font-semibold">
          <Trans>Deploy your own RToken</Trans>
        </h3>
        <p className="text-legend max-w-[920px]">
          <Trans>
            The creation of new RToken designs is permissionless. If you are the
            inventive type and have ideas for what assets should be in the
            basket, what a good governance looks like, or anything novel that
            could work within the realms of the protocol, please consider
            putting those ideas into practice or sharing them with the
            community.
          </Trans>
        </p>
        <div className="flex mt-6">
          <Button onClick={handleDeploy} className="mr-4">
            <Trans>Go to the RToken Deployer</Trans>
          </Button>
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() =>
              window.open(
                'https://www.youtube.com/watch?v=hk2v0s9wXEo',
                '_blank'
              )
            }
          >
            <span className="mr-2">
              <Trans>Watch an intro to RTokens</Trans>
            </span>
            <ExternalArrowIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DeployHero

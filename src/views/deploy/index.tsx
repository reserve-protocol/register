import ChainLogo from '@/components/icons/ChainLogo'
import { Button } from '@/components/ui/button'
import { ChainId } from '@/utils/chains'
import { ROUTES } from '@/utils/constants'
import { Asterisk, Play } from 'lucide-react'
import { Link } from 'react-router-dom'

interface DeployBoxProps {
  title: string
  description: string
  buttonText: string
  buttonVariant?: 'default' | 'secondary'
  route: string
  chains: number[]
  infoText: string
  infoStyle: 'primary' | 'black'
  image: string
}

const DeployBox = ({
  title,
  description,
  buttonText,
  buttonVariant = 'default',
  image,
  route,
  chains,
  infoText,
  infoStyle,
}: DeployBoxProps) => {
  const borderColor =
    infoStyle === 'primary' ? 'border-primary' : 'border-black'
  const textColor = infoStyle === 'primary' ? 'text-primary' : ''
  const bgColor = infoStyle === 'primary' ? 'bg-primary' : 'bg-black'

  return (
    <div
      className={`flex flex-col bg-muted rounded-2xl flex-grow h-[522px] w-[588px]  bg-[url('${image}')] bg-cover bg-center group`}
    >
      <div className="flex items-center p-4">
        <div className="flex items-center gap-2 mr-auto">
          <div
            className={`flex gap-2 items-center rounded-[50px] border ${borderColor} cursor-pointer ${textColor} p-2 bg-card`}
          >
            <div
              className={`flex items-center justify-center ${textColor} rounded-full border ${borderColor} h-6 w-6`}
            >
              <Asterisk />
            </div>
            <span>{infoText}</span>
            <div
              className={`flex items-center ${bgColor} justify-center rounded-full border ${borderColor} h-6 w-6`}
            >
              <Play size={16} fill="white" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {chains.map((chain) => (
            <ChainLogo key={chain} fontSize={24} chain={chain} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl m-1 mt-auto p-4 bg-card">
        <div
          className={`flex items-center justify-center ${textColor} rounded-full border ${borderColor} h-8 w-8`}
        >
          <Asterisk />
        </div>
        <h2 className={`${textColor} text-2xl font-semibold`}>{title}</h2>
        <p>{description}</p>
        <ul className="list-disc list-inside">
          <li>Diversify across yield positions</li>
          <li>Mitigate against custodian and lending protocol risk</li>
          <li>Automated yield compounding & portfolio rebalancing</li>
        </ul>
        <Link to={route}>
          <Button variant={buttonVariant} className="w-full">
            {buttonText}
          </Button>
        </Link>
      </div>
    </div>
  )
}

const Header = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-center text-primary rounded-full border border-primary h-10 w-10">
        <Asterisk />
      </div>
      <h1 className="max-w-96 text-primary text-4xl text-center">
        What type of DTF are you launching?
      </h1>
    </div>
  )
}

const Deploy = () => {
  const description =
    "Reserve's RToken Factory Contracts: A platform for creating tokens backed by a diverse array of ERC20 collateral."

  return (
  <div className="container mt-10 mb-4 px-4">
      <Header />
      <div className="flex flex-wrap gap-4 mt-10">
        <DeployBox
          title="Create an Index DTF"
          description={description}
          buttonText="Get Started"
          route={ROUTES.DEPLOY_INDEX}
          chains={[ChainId.Mainnet, ChainId.Base]}
          infoText="What are Index DTFs?"
          infoStyle="primary"
          image="https://storage.reserve.org/index-dtf-cover.png"
        />
        <DeployBox
          title="Create a Yield DTF"
          description={description}
          buttonVariant="secondary"
          buttonText="Get Started"
          route={ROUTES.DEPLOY_YIELD}
          chains={[ChainId.Mainnet, ChainId.Base, ChainId.Arbitrum]}
          infoText="What are Yield DTFs?"
          infoStyle="black"
          image="https://storage.reserve.org/yield-dtf-cover.png"
        />
      </div>
    </div>
  )
}

export default Deploy

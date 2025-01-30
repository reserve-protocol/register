import DiscordIcon from '@/components/icons/DiscordIcon'
import { RTokenIcon } from '@/components/icons/logos'
import Timeline from '@/components/ui/timeline'
import { useAtomValue } from 'jotai'
import { Asterisk, PlayIcon } from 'lucide-react'
import { ReactNode } from 'react'
import {
  daoCreatedAtom,
  deployedDTFAtom,
  formReadyForSubmitAtom,
  selectedGovernanceOptionAtom,
} from '../atoms'
import ConfirmIndexDeploy from '../steps/confirm-deploy'
import CreateDAO from '../steps/create-dao'

const IndexTokenGraphic = () => {
  return (
    <div className="w-full h-[165px] rounded-2xl bg-background flex items-center justify-center bg-[url('https://storage.reserve.org/deploy-graph.png')] bg-cover bg-no-repeat" />
  )
}

const DeployTimeline = () => {
  const formReadyForSubmit = useAtomValue(formReadyForSubmitAtom)
  const showCreateGovernanceDAO =
    useAtomValue(selectedGovernanceOptionAtom) === 'governanceERC20address'
  const daoCreated = useAtomValue(daoCreatedAtom)
  const deployedDTF = useAtomValue(deployedDTFAtom)

  const timelineItems = [
    {
      title: 'Configure your Index DTF',
      isActive: true,
    },
    ...(showCreateGovernanceDAO
      ? [
          {
            title: daoCreated
              ? 'Governance DAO created'
              : 'Sign tx to create governance DAO',
            children: !daoCreated && <CreateDAO />,
            isActive: formReadyForSubmit,
          },
        ]
      : []),
    {
      title: 'Create Index DTF',
      children: (
        <ConfirmIndexDeploy
          isActive={
            (showCreateGovernanceDAO && daoCreated) ||
            (!showCreateGovernanceDAO && formReadyForSubmit)
          }
        />
      ),
      isActive:
        (showCreateGovernanceDAO && daoCreated) ||
        (!showCreateGovernanceDAO && formReadyForSubmit),
    },
    {
      title: 'Index DTF successfully created',
      isActive: !!deployedDTF,
    },
  ]

  return (
    <div className="w-full  rounded-3xl bg-background flex flex-col gap-3 px-8 py-6">
      <Timeline items={timelineItems} />
    </div>
  )
}

type SocialMediaLinkProps = {
  href: string
  icon: ReactNode
  title: string
}

const SocialMediaLink = ({ href, icon, title }: SocialMediaLinkProps) => {
  return (
    <a
      className="rounded-md flex items-center gap-1 bg-muted w-max px-2 py-1"
      href={href}
      target="_blank"
    >
      {icon}
      <span className="text-base font-bold">{title}</span>
    </a>
  )
}

const HelpText = () => {
  return (
    <div className="w-full rounded-3xl bg-background flex flex-col gap-3 p-6">
      <Asterisk size={24} strokeWidth={1.5} />
      <div className="flex flex-col gap-1">
        <span className="text-xl font-bold">Need help deploying?</span>
        <span className="text-muted-foreground">
          Deploying through this UI doesn't require deep technical knowledge as
          long as you don't need novel collateral plugins for your baskets.
          However, we encourage you to talk to someone proficient in the
          protocol and read the docs to learn more before confirming any
          transactions.
        </span>
      </div>
      <div className="flex gap-2">
        <SocialMediaLink href="" icon={<DiscordIcon />} title="Discord" />
        <SocialMediaLink href="" icon={<RTokenIcon />} title="Docs" />
        <SocialMediaLink
          href=""
          icon={<PlayIcon size={16} />}
          title="Tutorial"
        />
      </div>
    </div>
  )
}

const RightPanel = () => {
  return (
    <div className="flex flex-col gap-1 bg-secondary rounded-3xl w-full">
      <IndexTokenGraphic />
      <DeployTimeline />
      <HelpText />
    </div>
  )
}

export default RightPanel

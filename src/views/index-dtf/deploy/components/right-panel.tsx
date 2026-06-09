import { RTokenIcon } from '@/components/icons/logos'
import Timeline from '@/components/ui/timeline'
import ExplorerAddress from '@/components/utils/explorer-address'
import { chainIdAtom } from '@/state/atoms'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { Asterisk, NotebookTabs } from 'lucide-react'
import { ReactNode } from 'react'
import {
  daoCreatedAtom,
  daoTokenAddressAtom,
  daoTokenSymbolAtom,
  deployedDTFAtom,
  formReadyForSubmitAtom,
  selectedGovernanceOptionAtom,
} from '../atoms'
import ConfirmIndexDeploy from '../steps/confirm-deploy'
import CreateDAO from '../steps/create-dao'
import { INDEX_PROTOCOL_DOCS, TELEGRAM_INVITE } from '@/utils/constants'
import TelegramIcon from '@/components/icons/TelegramIcon'

const IndexTokenGraphic = () => {
  return (
    <div className="w-full h-[165px] rounded-2xl bg-background flex items-center justify-center bg-[url('https://storage.reserve.org/deploy-graph.png')] bg-cover bg-no-repeat" />
  )
}

const DeployTimeline = () => {
  const { t } = useLingui()
  const chainId = useAtomValue(chainIdAtom)
  const formReadyForSubmit = useAtomValue(formReadyForSubmitAtom)
  const showCreateGovernanceDAO =
    useAtomValue(selectedGovernanceOptionAtom) === 'governanceERC20address'
  const daoCreated = useAtomValue(daoCreatedAtom)
  const stTokenAddress = useAtomValue(daoTokenAddressAtom)
  const stTokenSymbol = useAtomValue(daoTokenSymbolAtom)
  const deployedDTF = useAtomValue(deployedDTFAtom)

  const timelineItems = [
    {
      title: t`Configure your Index DTF`,
      isActive: true,
    },
    ...(showCreateGovernanceDAO
      ? [
        {
          title: daoCreated
            ? stTokenSymbol
              ? t`Created ${stTokenSymbol} DAO`
              : t`Governance DAO created`
            : t`Sign tx to create governance DAO`,
          rightText:
            daoCreated && stTokenAddress ? (
              <ExplorerAddress address={stTokenAddress} chain={chainId} />
            ) : undefined,
          children: !daoCreated && <CreateDAO />,
          isActive: formReadyForSubmit,
        },
      ]
      : []),
    {
      title: t`Create Index DTF`,
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
      title: t`Index DTF successfully created`,
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
  const { t } = useLingui()
  return (
    <div className="w-full rounded-3xl bg-background flex flex-col gap-3 p-6">
      <div className="p-2 rounded-full border border-foreground w-fit">
        <NotebookTabs size={14} strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xl font-bold">
          <Trans>Need help deploying?</Trans>
        </span>
        <span className="text-muted-foreground">
          <Trans>
            Deploying through this UI doesn't require deep technical knowledge
            as long as you don't need novel collateral plugins for your baskets.
            However, we encourage you to talk to someone proficient in the
            protocol and read the docs to learn more before confirming any
            transactions.
          </Trans>
        </span>
      </div>
      <div className="flex gap-2">
        <SocialMediaLink
          href={TELEGRAM_INVITE}
          icon={<TelegramIcon />}
          title="Telegram"
        />
        <SocialMediaLink
          href={INDEX_PROTOCOL_DOCS}
          icon={<RTokenIcon />}
          title={t`Docs`}
        />
        {/* <SocialMediaLink
          href=""
          icon={<PlayIcon size={16} />}
          title="Tutorial"
        /> */}
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

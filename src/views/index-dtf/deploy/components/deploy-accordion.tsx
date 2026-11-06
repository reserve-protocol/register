import BasketCubeIcon from '@/components/icons/BasketCubeIcon'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import {
  ArrowDownUp,
  Asterisk,
  Boxes,
  Braces,
  Check,
  ChevronDownIcon,
  ChevronUpIcon,
  BadgePercent,
  Crown,
  Edit2,
  Landmark,
  PencilRuler,
} from 'lucide-react'
import { ReactNode, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import type { MessageDescriptor } from '@lingui/core'
import { chainIdAtom } from '@/state/atoms'
import {
  basketAtom,
  daoCreatedAtom,
  daoTokenAddressAtom,
  deployedDTFAtom,
  deployStepAtom,
  searchTokenAtom,
  selectedTokensAtom,
  validatedSectionsAtom,
} from '../atoms'
import { DeployStepId } from '../form-fields'
import Auctions from '../steps/auctions'
import FTokenBasket from '../steps/basket'
import { indexDeployFormDataAtom } from '../steps/confirm-deploy/atoms'
import Governance from '../steps/governance'
import MetadataAndChain from '../steps/metadata'
import GovernanceSettings from '../steps/governance-settings'
import RevenueDistribution from '../steps/revenue'
import Roles from '../steps/roles'
import { scrollToSection } from '../utils'

export type DeployStep = {
  id: DeployStepId
  icon: ReactNode
  title: MessageDescriptor
  titleSecondary: MessageDescriptor
  content: ReactNode
}

export const DEPLOY_STEPS: DeployStep[] = [
  {
    id: 'metadata',
    icon: <Braces size={14} strokeWidth={1.5} />,
    title: msg`Metadata`,
    titleSecondary: msg`Metadata`,
    content: <MetadataAndChain />,
  },
  {
    id: 'basket',
    icon: <Boxes size={14} strokeWidth={1.5} />,
    title: msg`Basket`,
    titleSecondary: msg`Basket`,
    content: <FTokenBasket />,
  },
  {
    id: 'governance',
    icon: <Landmark size={14} strokeWidth={1.5} />,
    title: msg`Governance Body`,
    titleSecondary: msg`Governance Body`,
    content: <Governance />,
  },
  {
    id: 'revenue-distribution',
    icon: <BadgePercent size={14} strokeWidth={1.5} />,
    title: msg`Fees`,
    titleSecondary: msg`Fees`,
    content: <RevenueDistribution />,
  },
  {
    id: 'roles',
    icon: <Crown size={14} strokeWidth={1.5} />,
    title: msg`Roles`,
    titleSecondary: msg`Roles`,
    content: <Roles />,
  },
  {
    id: 'auctions',
    icon: <ArrowDownUp size={14} strokeWidth={1.5} />,
    title: msg`Auctions`,
    titleSecondary: msg`Auctions`,
    content: <Auctions />,
  },
  {
    id: 'governance-settings',
    icon: <PencilRuler size={14} strokeWidth={1.5} />,
    title: msg`Governance Settings`,
    titleSecondary: msg`Governance Settings`,
    content: <GovernanceSettings />,
  },
]

const DeployAccordionTrigger = ({
  id,
  icon,
  title,
  validated,
}: Omit<DeployStep, 'content' | 'titleSecondary'> & { validated: boolean }) => {
  const { t } = useLingui()
  const selectedSection = useAtomValue(deployStepAtom)
  const isActive = selectedSection === id

  return (
    <AccordionTrigger
      withChevron={false}
      className={cn(
        'flex items-center justify-between w-full p-6',
        isActive ? 'pb-3' : ''
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2',
          validated ? 'text-primary' : ''
        )}
      >
        <div
          className={cn(
            'rounded-full p-2 border border-foreground',
            (isActive || validated) && 'border-primary text-primary'
          )}
        >
          {validated ? <Check size={16} /> : icon}
        </div>
        <div
          className={cn(
            'text-xl font-bold animate-fade-in',
            isActive ? 'text-primary hidden' : ''
          )}
        >
          {t(title)}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <div className="bg-muted-foreground/10 rounded-full p-1" role="button">
          {validated ? (
            <div className="p-1">
              <Edit2 size={16} strokeWidth={1.5} />
            </div>
          ) : isActive ? (
            <ChevronUpIcon size={24} strokeWidth={1.5} />
          ) : (
            <ChevronDownIcon size={24} strokeWidth={1.5} />
          )}
        </div>
      </div>
    </AccordionTrigger>
  )
}

const DeployAccordion = () => {
  const { t } = useLingui()
  const { reset, watch } = useFormContext()
  const [section, setSection] = useAtom(deployStepAtom)
  const setChainId = useSetAtom(chainIdAtom)
  const formChain = watch('chain')
  const validatedSections = useAtomValue(validatedSectionsAtom)
  const resetBasket = useResetAtom(basketAtom)
  const resetDaoCreated = useResetAtom(daoCreatedAtom)
  const resetValidatedSections = useResetAtom(validatedSectionsAtom)
  const resetDaoTokenAddress = useResetAtom(daoTokenAddressAtom)
  const resetDeployedDTF = useResetAtom(deployedDTFAtom)
  const resetDeployFormData = useResetAtom(indexDeployFormDataAtom)
  const resetSelectedTokens = useResetAtom(selectedTokensAtom)
  const resetSearchToken = useResetAtom(searchTokenAtom)

  // Sync chainIdAtom with form chain so TransactionButton and txAtom use the correct chain
  useEffect(() => {
    if (formChain) setChainId(formChain)
  }, [formChain, setChainId])

  useEffect(() => {
    setSection(DEPLOY_STEPS[0].id)

    return () => {
      reset()
      resetBasket()
      resetDaoCreated()
      resetValidatedSections()
      resetDaoTokenAddress()
      resetDeployedDTF()
      resetDeployFormData()
      resetSelectedTokens()
      resetSearchToken()
    }
  }, [])

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full bg-secondary rounded-xl"
      value={section}
      onValueChange={(value: string) => {
        setSection(value as DeployStepId)
        if (value) {
          scrollToSection(value)
        }
      }}
    >
      {DEPLOY_STEPS.map(({ id, icon, title, titleSecondary, content }) => (
        <AccordionItem
          key={id}
          value={id}
          id={`deploy-section-${id}`}
          className="[&:not(:last-child)]:border-b-4 [&:not(:first-child)]:border-t border-secondary rounded-[1.25rem] bg-card"
        >
          <DeployAccordionTrigger
            id={id}
            icon={icon}
            title={title}
            validated={validatedSections[id]}
          />
          <AccordionContent className="flex flex-col animate-fade-in">
            <div className="text-2xl font-bold text-primary ml-6 mb-2">
              {t(titleSecondary)}
            </div>
            {content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
export default DeployAccordion

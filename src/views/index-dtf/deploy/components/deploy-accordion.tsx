import BasketCubeIcon from '@/components/icons/BasketCubeIcon'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import { useAtom, useAtomValue } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import useScrollTo from '@/hooks/useScrollTo'
import {
  Asterisk,
  Check,
  ChevronDownIcon,
  ChevronUpIcon,
  Edit2,
} from 'lucide-react'
import { ReactNode, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
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
import BasketChanges from '../steps/basket-changes'
import { indexDeployFormDataAtom } from '../steps/confirm-deploy/atoms'
import Governance from '../steps/governance'
import MetadataAndChain from '../steps/metadata'
import OtherChanges from '../steps/other-changes'
import RevenueDistribution from '../steps/revenue'
import Roles from '../steps/roles'

export type DeployStep = {
  id: DeployStepId
  icon: ReactNode
  title: string
  titleSecondary: string
  content: ReactNode
}

export const DEPLOY_STEPS: DeployStep[] = [
  {
    id: 'metadata',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Metadata',
    titleSecondary: 'Metadata',
    content: <MetadataAndChain />,
  },
  {
    id: 'basket',
    icon: <BasketCubeIcon fontSize={24} />,
    title: 'Basket',
    titleSecondary: 'Basket',
    content: <FTokenBasket />,
  },
  {
    id: 'governance',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Governance Body',
    titleSecondary: 'Governance Type',
    content: <Governance />,
  },
  {
    id: 'revenue-distribution',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Fees',
    titleSecondary: 'Fees',
    content: <RevenueDistribution />,
  },
  {
    id: 'roles',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Roles',
    titleSecondary: 'Roles',
    content: <Roles />,
  },
  {
    id: 'auctions',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Auctions',
    titleSecondary: 'Auctions',
    content: <Auctions />,
  },
  {
    id: 'basket-changes',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Basket Governance Settings',
    titleSecondary: 'Basket Governance Settings',
    content: <BasketChanges />,
  },
  {
    id: 'other-changes',
    icon: <Asterisk size={24} strokeWidth={1.5} />,
    title: 'Non-Basket Governance Settings',
    titleSecondary: 'Non-Basket Governance Settings',
    content: <OtherChanges />,
  },
]

const DeployAccordionTrigger = ({
  id,
  icon,
  title,
  validated,
}: Omit<DeployStep, 'content' | 'titleSecondary'> & { validated: boolean }) => {
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
            'rounded-full p-1',
            isActive ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/10'
          )}
        >
          {validated ? <Check /> : icon}
        </div>
        <div
          className={cn(
            'text-xl font-bold animate-fade-in',
            isActive ? 'text-primary hidden' : ''
          )}
        >
          {title}
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
  const { reset } = useFormContext()
  const [section, setSection] = useAtom(deployStepAtom)
  const validatedSections = useAtomValue(validatedSectionsAtom)
  const resetBasket = useResetAtom(basketAtom)
  const resetDaoCreated = useResetAtom(daoCreatedAtom)
  const resetValidatedSections = useResetAtom(validatedSectionsAtom)
  const resetDaoTokenAddress = useResetAtom(daoTokenAddressAtom)
  const resetDeployedDTF = useResetAtom(deployedDTFAtom)
  const resetDeployFormData = useResetAtom(indexDeployFormDataAtom)
  const resetSelectedTokens = useResetAtom(selectedTokensAtom)
  const resetSearchToken = useResetAtom(searchTokenAtom)

  const scrollToSection = (sectionId: string) => {
    // Wait for accordion animation to complete (200ms) plus a small buffer
    setTimeout(() => {
      const element = document.getElementById(`deploy-section-${sectionId}`)
      if (element) {
        const wrapper = document.getElementById('app-container')
        if (wrapper) {
          const count = element.offsetTop - wrapper.scrollTop - 72 // Fixed 72px offset as requested
          wrapper.scrollBy({ top: count, left: 0, behavior: 'smooth' })
        }
      }
    }, 250) // 200ms animation duration + 50ms buffer for safety
  }

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
              {titleSecondary}
            </div>
            {content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
export default DeployAccordion

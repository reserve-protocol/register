import { t } from '@lingui/macro'
import { ContentHead } from '@/components/old/info-box'
import ListedTokensTable from 'components/tables/ListedTokensTable'
import { Separator } from '@/components/ui/separator'
import DeployHero from '@/views/discover/components/yield/components/DeployHero'
import RegisterAbout from '@/views/discover/components/yield/components/RegisterAbout'
import UnlistedTokensTable from './components/UnlistedTokensTable'

const Tokens = () => {
  return (
    <>
      <div className="max-w-[1400px] mx-auto px-1 py-1 sm:px-3 sm:py-6">
        <ContentHead
          title={t`Register listed RTokens`}
          subtitle={t`RTokens in this list is not an endorsement or audited by us. It's simply RTokens that have gone through our listing process and don't seem like clear scams.`}
          mb={4}
          ml={4}
        />
        <ListedTokensTable />
        <Separator className="my-7" />
        <ContentHead
          title={t`All unlisted RTokens`}
          subtitle={t`Be aware that anyone can create an RToken that ends up on this list. We don't apply any standards beyond what can be done with the Reserve Protocol.`}
          mb={4}
          mt={4}
          ml={4}
        />
        <UnlistedTokensTable />
        <DeployHero mt={8} />
      </div>
      <RegisterAbout />
    </>
  )
}

export default Tokens

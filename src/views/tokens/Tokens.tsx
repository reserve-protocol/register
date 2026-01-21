import { t } from '@lingui/macro'
import ListedTokensTable from 'components/tables/ListedTokensTable'
import { Separator } from '@/components/ui/separator'
import DeployHero from '@/views/discover/components/yield/components/DeployHero'
import RegisterAbout from '@/views/discover/components/yield/components/RegisterAbout'
import UnlistedTokensTable from './components/UnlistedTokensTable'

const Tokens = () => {
  return (
    <>
      <div className="max-w-[1400px] mx-auto px-1 py-1 sm:px-3 sm:py-6">
        <div className="mb-6 ml-6">
          <h1 className="text-[32px] font-semibold tracking-wide mb-2">
            {t`Register listed RTokens`}
          </h1>
          <p className="text-muted-foreground max-w-[720px]">
            {t`RTokens in this list is not an endorsement or audited by us. It's simply RTokens that have gone through our listing process and don't seem like clear scams.`}
          </p>
        </div>
        <ListedTokensTable />
        <Separator className="my-7" />
        <div className="mb-6 mt-6 ml-6">
          <h1 className="text-[32px] font-semibold tracking-wide mb-2">
            {t`All unlisted RTokens`}
          </h1>
          <p className="text-muted-foreground max-w-[720px]">
            {t`Be aware that anyone can create an RToken that ends up on this list. We don't apply any standards beyond what can be done with the Reserve Protocol.`}
          </p>
        </div>
        <UnlistedTokensTable />
        <DeployHero mt={8} />
      </div>
      <RegisterAbout />
    </>
  )
}

export default Tokens

import { Card } from '@/components/ui/card'
import { ROUTES } from '@/utils/constants'
import { Fingerprint, Signature } from 'lucide-react'

const IndexDisclousure = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-1">
        <div className="rounded-full border border-foreground p-2 mr-auto">
          <Signature size={14} />
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4"></div>
      <h2 className="text-2xl font-semibold mb-2">Disclosures</h2>
      <div className="flex flex-col gap-2">
        <p className="text-legend">
          By using{' '}
          <a
            href="https://app.reserve.org"
            target="_blank"
            className="text-primary"
          >
            app.reserve.org
          </a>{' '}
          (the “Website”), , you expressly acknowledge that you have read and
          understood the{' '}
          <a href={ROUTES.TERMS} target="_blank" className="text-primary">
            Terms and Conditions
          </a>{' '}
          and agree to the terms therein. ABC Labs, LLC ("ABC Labs") created the
          Website to help facilitate interaction with the Reserve protocol,
          including the minting and redeeming of DTFs. However, the Website is
          only one of several ways in which you can interact with the Reserve
          protocol. ABC Labs has neither created nor deployed any DTF and your
          ability to interact with specific DTFs via the Website in no way
          suggests that a DTF is endorsed by ABC Labs. In fact, ABC Labs assumes
          no liability for your use of the Website and interaction with the
          Reserve protocol, as covered in the Terms and Conditions.
        </p>
        <p className="text-legend">
          The information provided on the Website comes from on-chain sources.
          Past performance is not indicative of future results. Although index
          DTFs are intended to track indexes, their ability to successfully
          track indexes are dependent on the governance structure of the DTF and
          the governance’s ability to make appropriate trades. There is no
          guarantee that such trades will be successful or will track its
          corresponding index exactly. There are many risks associated with
          digital assets, including but not limited to security risk,
          counterparty risk, volatility risk, conflicts of interest, and many
          more. DTFs are no exception. By using the Website, you agree that your
          interaction with any DTFs is solely at your own risk and the Website
          and DTFs come as is, without any warranty or condition of any kind.
        </p>
        <p>
          To learn more about the risks associated with DTFs,{' '}
          <a href={ROUTES.TERMS} target="_blank" className="text-primary">
            please see here.{' '}
          </a>
        </p>
      </div>
    </Card>
  )
}

export default IndexDisclousure

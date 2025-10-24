import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Signature, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Exclusive component for CFB LCAP whitepaper
// Required for legal compliance
const WhitepaperModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-2 mt-3 text-foreground">
          Review CFB Whitepaper
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:rounded-4xl max-w-3xl p-0 overflow-hidden">
        <ScrollArea className="max-h-[85vh]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                CFB Token Whitepapers
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Official documentation for the CFB LCAP token
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              {/* V2 Whitepaper - Current */}
              <div className="bg-card border-2 border-secondary rounded-3xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">
                      Current Version (v2)
                    </h3>
                  </div>
                  <a
                    href="https://storage.reserve.org/cfb-whitepaper-v2.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
                  >
                    View PDF →
                  </a>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Published: October 2025
                </p>

                {/* Collapsible changes */}
                <Accordion type="single" collapsible>
                  <AccordionItem value="changes" className="border-0">
                    <AccordionTrigger className="text-sm font-medium hover:no-underline py-2 px-0">
                      Summary of Changes from v1
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-xs pt-2">
                        <li className="leading-relaxed">
                          <span className="font-bold">
                            Formatting Guidance:
                          </span>{' '}
                          Removed the column on forms and standards which had
                          guidelines on formatting standards to the white paper.
                        </li>
                        <li className="leading-relaxed">
                          <span className="font-bold">Title Update:</span>{' '}
                          Included the token abbreviation "CFB Token" in the
                          title.
                        </li>
                        <li className="leading-relaxed">
                          <span className="font-bold">Dates Added:</span>{' '}
                          Inserted missing dates - notification date, admission
                          to trading start date, and publication date
                          (01./F.9/F.10).
                        </li>
                        <li className="leading-relaxed">
                          <span className="font-bold">Launch Status:</span>{' '}
                          Updated references to reflect that the token was
                          launched on 24 September 2025 (Section 10).
                        </li>
                        <li className="leading-relaxed">
                          <span className="font-bold">Minor Text Edit:</span>{' '}
                          Removed the word "ongoing" from Section E.18 (no
                          material impact).
                        </li>
                        <li className="leading-relaxed">
                          <span className="font-bold">Trading Platforms:</span>{' '}
                          Added Kraken as an additional trading platform,
                          including its market identifier code ("MIC")
                          (E.33/34).
                        </li>
                        <li className="leading-relaxed">
                          <span className="font-bold">Token Supply:</span>{' '}
                          Corrected F.6 to reflect that the CFB token has a
                          dynamic collateral-based supply mechanism, not a fixed
                          supply.
                        </li>
                        <li className="leading-relaxed">
                          <span className="font-bold">Audit Status:</span>{' '}
                          Clarified in H.8/H.9 that the LCAP token contracts are
                          based on the Reserve Index Protocol factory smart
                          contracts, which have been audited by Trust Security,
                          Cantina, and Trail of Bits with no critical issues
                          ever found.
                        </li>
                        <li className="leading-relaxed">
                          <span className="font-bold">Energy Consumption:</span>{' '}
                          Expanded J.1 to include energy usage data and the
                          sources and methodologies used for its calculation.
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* V1 Whitepaper - Previous */}
              <div className="bg-card border-2 border-secondary rounded-3xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold text-lg">
                      Previous Version (v1)
                    </h3>
                  </div>
                  <a
                    href="https://storage.reserve.org/cfb-whitepaper.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
                  >
                    View PDF →
                  </a>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Original whitepaper documentation
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

const IndexDisclousure = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-1">
        <div className="rounded-full border border-foreground p-2 mr-auto">
          <Signature size={14} />
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4"></div>
      <h2 className="text-2xl font-light mb-2">Disclosures</h2>
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
          (the “Website”), you expressly acknowledge that you have read and
          understood the{' '}
          <a
            href="https://reserve.org/terms_and_conditions/"
            target="_blank"
            className="text-primary"
          >
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
        <p className="text-legend">
          To learn more about the risks associated with DTFs,{' '}
          <a
            href="https://reserve.org/additional_risks/"
            target="_blank"
            className="text-primary"
          >
            please see here.{' '}
          </a>
          <WhitepaperModal />
        </p>
      </div>
    </Card>
  )
}

export default IndexDisclousure

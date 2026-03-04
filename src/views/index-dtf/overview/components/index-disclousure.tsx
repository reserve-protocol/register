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
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { ChainId } from '@/utils/chains'

// --- Whitepaper config ---
// To add a new token: add a new entry keyed by lowercase address.
// To add a new version: prepend to versions[] (first = current).

type WhitepaperVersion = {
  label: string
  url: string
  date?: string
  description: string
  changes?: {
    title: string
    items: { label: string; text: string }[]
  }
}

type WhitepaperConfig = {
  tokenName: string
  description: string
  chainId: number
  versions: WhitepaperVersion[]
}

const WHITEPAPER_CONFIG: Record<string, WhitepaperConfig> = {
  '0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8': {
    tokenName: 'CFB',
    description: 'Official documentation for the CFB LCAP token',
    chainId: ChainId.Base,
    versions: [
      {
        label: 'Current Version (v2)',
        url: 'https://storage.reserve.org/cfb-whitepaper-v2.pdf',
        date: 'October 2025',
        description: 'Updated whitepaper documentation',
        changes: {
          title: 'Summary of Changes from v1',
          items: [
            {
              label: 'Formatting Guidance',
              text: 'Removed the column on forms and standards which had guidelines on formatting standards to the white paper.',
            },
            {
              label: 'Title Update',
              text: 'Included the token abbreviation "CFB Token" in the title.',
            },
            {
              label: 'Dates Added',
              text: 'Inserted missing dates - notification date, admission to trading start date, and publication date (01./F.9/F.10).',
            },
            {
              label: 'Launch Status',
              text: 'Updated references to reflect that the token was launched on 24 September 2025 (Section 10).',
            },
            {
              label: 'Minor Text Edit',
              text: 'Removed the word "ongoing" from Section E.18 (no material impact).',
            },
            {
              label: 'Trading Platforms',
              text: 'Added Kraken as an additional trading platform, including its market identifier code ("MIC") (E.33/34).',
            },
            {
              label: 'Token Supply',
              text: 'Corrected F.6 to reflect that the CFB token has a dynamic collateral-based supply mechanism, not a fixed supply.',
            },
            {
              label: 'Audit Status',
              text: 'Clarified in H.8/H.9 that the LCAP token contracts are based on the Reserve Index Protocol factory smart contracts, which have been audited by Trust Security, Cantina, and Trail of Bits with no critical issues ever found.',
            },
            {
              label: 'Energy Consumption',
              text: 'Expanded J.1 to include energy usage data and the sources and methodologies used for its calculation.',
            },
          ],
        },
      },
      {
        label: 'Previous Version (v1)',
        url: 'https://storage.reserve.org/cfb-whitepaper.pdf',
        description: 'Original whitepaper documentation',
      },
    ],
  },
  '0x2f8a339b5889ffac4c5a956787cda593b3c36867': {
    tokenName: 'CMC20',
    description: 'Official documentation for the CMC20 token',
    chainId: ChainId.BSC,
    versions: [
      {
        label: 'Current Version (v1)',
        url: 'https://storage.reserve.org/cmc20-whitepaper.pdf',
        date: 'March 2026',
        description: 'CMC20 whitepaper documentation',
      },
    ],
  },
}

// Required for legal compliance
const WhitepaperModal = () => {
  const dtf = useAtomValue(indexDTFAtom)

  const config =
    dtf?.id ? WHITEPAPER_CONFIG[dtf.id.toLowerCase()] : undefined

  if (!config || dtf?.chainId !== config.chainId) return null

  const hasMultipleVersions = config.versions.length > 1

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-2 mt-3 text-foreground">
          Review {config.tokenName} Whitepaper
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:rounded-4xl max-w-3xl p-0 overflow-hidden">
        <ScrollArea className="max-h-[85vh]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {config.tokenName} Token{' '}
                {hasMultipleVersions ? 'Whitepapers' : 'Whitepaper'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {config.description}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              {config.versions.map((version, i) => (
                <div
                  key={version.url}
                  className="bg-card border-2 border-secondary rounded-3xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText
                        className={`h-5 w-5 ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}
                      />
                      <h3 className="font-semibold text-lg">
                        {version.label}
                      </h3>
                    </div>
                    <a
                      href={version.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
                    >
                      View PDF →
                    </a>
                  </div>
                  {version.date && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Published: {version.date}
                    </p>
                  )}
                  {!version.date && !version.changes && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {version.description}
                    </p>
                  )}

                  {version.changes && (
                    <Accordion type="single" collapsible>
                      <AccordionItem value="changes" className="border-0">
                        <AccordionTrigger className="text-sm font-medium hover:no-underline py-2 px-0">
                          {version.changes.title}
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2 text-xs pt-2">
                            {version.changes.items.map((item) => (
                              <li
                                key={item.label}
                                className="leading-relaxed"
                              >
                                <span className="font-bold">
                                  {item.label}:
                                </span>{' '}
                                {item.text}
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </div>
              ))}
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

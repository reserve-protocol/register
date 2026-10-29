import FlowHero from '../shared/flow-hero'
import { DataNote, FintechCta, FloatingStats } from '../shared/page-bits'
import SharpHeroChart from '../shared/sharp-hero-chart'
import {
  CountriesSection,
  UglyCashCardSection,
} from '../shared/uglycash-sections'
import VolumeLedger from '../shared/volume-ledger'

const V10Ledger = () => (
  <div className="pb-48">
    <FlowHero chart={<SharpHeroChart style="step" milestones />} />
    <UglyCashCardSection />
    <section className="container mt-24 px-4 md:px-6">
      <VolumeLedger />
    </section>
    <CountriesSection />
    <div className="container mt-24 flex flex-col gap-4 px-4 md:px-6">
      <div className="rounded-4xl border-[4px] border-secondary bg-secondary">
        <FintechCta />
      </div>
      <DataNote />
    </div>
    <FloatingStats hideAfter={400} />
  </div>
)

export default V10Ledger

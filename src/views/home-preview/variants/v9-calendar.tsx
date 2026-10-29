import FlowHero from '../shared/flow-hero'
import { DataNote, FintechCta, FloatingStats } from '../shared/page-bits'
import SharpHeroChart from '../shared/sharp-hero-chart'
import {
  CountriesSection,
  UglyCashCardSection,
} from '../shared/uglycash-sections'
import VolumeCalendar from '../shared/volume-calendar'

const V9Calendar = () => (
  <div className="pb-48">
    <FlowHero chart={<SharpHeroChart style="line" milestones />} />
    <UglyCashCardSection />
    <section className="container mt-24 px-4 md:px-6">
      <h2 className="mb-2 text-xl text-primary">
        Every day of eUSD in UGLYCASH
      </h2>
      <p className="mb-6 max-w-[56ch] text-lg font-light">
        Each square is one day since launch. The 1st and 15th, when people get
        paid, light up every month.
      </p>
      <VolumeCalendar />
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

export default V9Calendar

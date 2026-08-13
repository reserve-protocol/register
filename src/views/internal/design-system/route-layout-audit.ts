export type LayoutDisposition = 'retain' | 'rework' | 'discard'

export type RouteLayoutAudit = {
  family: string
  routes: string
  current: string
  primaryTask: string
  candidate: string
  disposition: LayoutDisposition
  call: string
  componentImpact: string
}

export const routeLayoutAudit: RouteLayoutAudit[] = [
  {
    family: 'Auctions',
    routes: '/auctions · /auctions/rebalance/:id',
    current:
      'A 706px centered list and a separate 480px centered detail island inside a full product shell.',
    primaryTask: 'Scan rebalances, select one, then monitor or act on it.',
    candidate: 'Browse and inspect',
    disposition: 'discard',
    call: 'Replace the centered islands with a persistent list region and an active-auction workspace. Route to detail on narrow screens.',
    componentImpact:
      'Auction row, selected state, list toolbar, detail header, metrics, actions, empty detail state.',
  },
  {
    family: 'Governance overview',
    routes: '/governance',
    current:
      'A 3:2 split permanently pairs proposals with vote-lock, account, stats, roles, and delegates.',
    primaryTask:
      'Find and understand proposals; enter governance participation.',
    candidate: 'Retain for V1; revisit browse and inspect later',
    disposition: 'retain',
    call: 'Keep the current composition during the compressed V1 migration. Improve foundations and component consistency without making proposal-summary information architecture a prerequisite.',
    componentImpact:
      'Proposal rows and supporting cards can improve now; proposal summary, contextual empty state, and reference disclosure remain later layout work.',
  },
  {
    family: 'Proposal creation',
    routes: '/governance/propose · proposal-type routes',
    current:
      'A 408px centered type chooser jumps to 3:2 form-and-preview layouts.',
    primaryTask:
      'Choose a proposal intent, configure it, review changes, submit.',
    candidate: 'Progressive workflow',
    disposition: 'rework',
    call: 'The focused opening is valid, but it should feel like the beginning of one workflow. Expand only when simultaneous form and review context becomes useful.',
    componentImpact:
      'Intent row, step context, form section, review panel, workflow navigation, submit actions.',
  },
  {
    family: 'Proposal detail',
    routes: '/proposal/:id',
    current:
      'A full-width vote/header band sits above a 2:1 description and governance-stat split.',
    primaryTask:
      'Understand one proposal, assess state and impact, then vote or execute.',
    candidate: 'Full-width context plus primary/support',
    disposition: 'rework',
    call: 'Retain a spanning region only for proposal identity, lifecycle, and actions that govern everything below. Keep long content primary and voting evidence supporting.',
    componentImpact:
      'Status banner, proposal header, action cluster, content renderer, tally, timeline, metadata.',
  },
  {
    family: 'Automated mint',
    routes: '/issuance/automated',
    current:
      'A 476px focused start expands to a 1200px 1:1 quote-and-orders workspace; completion stays wide.',
    primaryTask:
      'Configure one intent, then monitor two simultaneous execution regions.',
    candidate: 'Progressive workflow',
    disposition: 'retain',
    call: 'Preserve the role-based expansion as the reference pattern. Revisit the opening only if a persistent shell improves orientation without adding noise.',
    componentImpact:
      'Focused step, expansion transition, paired work regions, progress states, completion summary.',
  },
  {
    family: 'Deploy and manage',
    routes: '/internal/deploy · /deploy-index · /manage',
    current:
      'Mostly 2:1 form-and-support layouts; support ranges from useful preview to loosely related material.',
    primaryTask: 'Complete a long form while checking consequences or preview.',
    candidate: 'Primary workflow plus earned support',
    disposition: 'rework',
    call: 'Keep a support region only when it updates with the current step or prevents mistakes. Otherwise let the form own the useful width.',
    componentImpact:
      'Form sections, sticky review, preview, validation summary, workflow navigation.',
  },
  {
    family: 'Overview and settings',
    routes: '/overview · /settings',
    current:
      'Overview uses a fluid table-led primary with a fixed 480px rail; Settings uses a 3:2 reference split.',
    primaryTask: 'Read dense primary information with secondary context.',
    candidate: 'Table-led content plus support',
    disposition: 'retain',
    call: 'Retain the role distinction, then normalize outer alignment, rail behavior, and the useful minimum of dense primary content.',
    componentImpact:
      'Section shell, supporting rail, table minimums, responsive ordering.',
  },
  {
    family: 'Discover and Earn',
    routes: '/discover · /earn/*',
    current:
      'Full-width catalog/table surfaces with route-specific hero, filters, tabs, and table geometry.',
    primaryTask: 'Scan, filter, compare, and enter a selected product.',
    candidate: 'Data index',
    disposition: 'retain',
    call: 'Standardize outer frame, header/filter rhythm, table region, empty/loading states, and responsive reduction without forcing identical content columns.',
    componentImpact:
      'Index header, filters, tabs, table/list, pagination, empty and loading states.',
  },
]

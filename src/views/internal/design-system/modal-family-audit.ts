export type ModalFamilyAuditEntry = {
  job: string
  evidence: string
  requiredContent: string
  representativeTest: string
  status: string
}

export const modalFamilyAudit: ModalFamilyAuditEntry[] = [
  {
    job: 'Review and commit',
    evidence: 'TransactionModal, staking, issuance, governance voting',
    requiredContent:
      'Decision summary, material values, warnings or fees, primary action, and transaction states.',
    representativeTest: 'Real transaction review flow to be selected',
    status: 'Mapped · specimen pending',
  },
  {
    job: 'Configure',
    evidence: 'Liquidity configuration and Zapper settings',
    requiredContent:
      'Short explanation, labeled controls, validation, and one clear completion action.',
    representativeTest: 'Liquidity simulation configuration',
    status: 'Mapped · next',
  },
  {
    job: 'Select or search',
    evidence: 'Collateral plugins and token selectors',
    requiredContent:
      'Search or filters, a scrollable choice region, selection state, and an optional footer action.',
    representativeTest: 'Token or collateral selector',
    status: 'Mapped · later',
  },
  {
    job: 'Attest or acknowledge risk',
    evidence: 'Eligibility confirmation and large-mint notices',
    requiredContent:
      'Consequence-first copy, checks or expandable detail, and an explicit acknowledgement.',
    representativeTest: 'Index DTF eligibility confirmation',
    status: 'Current + candidate ready',
  },
  {
    job: 'Explain or reference',
    evidence: 'Bridge information, disclosures, and whitepaper history',
    requiredContent:
      'Readable sections, source links, expandable detail, and occasionally comparison data.',
    representativeTest: 'Bridge information or whitepaper history',
    status: 'Mapped · later',
  },
  {
    job: 'Report an outcome',
    evidence: 'Transaction success, transaction error, and Zapper completion',
    requiredContent:
      'Outcome, consequence, useful details or recovery, and the next action.',
    representativeTest: 'Real transaction success, pending, and error',
    status: 'Mapped · after task cases',
  },
  {
    job: 'Show media',
    evidence: 'Video modal',
    requiredContent:
      'Media title, correct aspect ratio, playback surface, and an obvious close action.',
    representativeTest: 'Existing video modal',
    status: 'Separate overlay family',
  },
]

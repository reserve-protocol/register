export const MIGRATION_STAGES = [
  { title: 'Redeem', detail: 'Receive RSR from your old vote-lock.' },
  {
    title: 'Approve RSR',
    detail: 'Allow the shared vlRSR vault to use your RSR.',
  },
  {
    title: 'Lock RSR in vlRSR',
    detail: 'Lock your RSR in the shared vlRSR vault.',
  },
] as const

export const PREVIEW_TRANSACTIONS = [
  { reference: '0x91b2…d735', hash: `0x91b2${'0'.repeat(56)}d735` },
  { reference: '0x65e3…a812', hash: `0x65e3${'0'.repeat(56)}a812` },
  { reference: '0xc493…71e6', hash: `0xc493${'0'.repeat(56)}71e6` },
] as const

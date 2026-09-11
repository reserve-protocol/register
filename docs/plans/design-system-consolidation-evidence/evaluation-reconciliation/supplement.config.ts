import base from '/Users/lill-kire/Code/register/playwright.design-system.config'
const candidate = process.env.RECONCILIATION_CANDIDATE
if (!['Cedar', 'Flint', 'Quartz'].includes(candidate ?? '')) throw new Error('Unknown candidate')
export default {
  ...base,
  testDir: '/private/tmp/register-comparison-closeout.NWKGw3',
  testMatch: /supplement\.spec\.ts/,
  outputDir: `/private/tmp/register-comparison-closeout.NWKGw3/${candidate}-output`,
  reporter: [['list'], ['json', { outputFile: `/private/tmp/register-comparison-closeout.NWKGw3/${candidate}-browser.json` }]],
  webServer: undefined,
  use: { ...base.use, baseURL: 'http://127.0.0.1:3037' },
  projects: [{ name: 'reconciliation-supplement' }],
}

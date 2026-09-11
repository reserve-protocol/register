import fs from 'node:fs'
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'

const dir = '/private/tmp/register-comparison-closeout.NWKGw3'
const repo = '/Users/lill-kire/Code/register'
const node = '/opt/homebrew/opt/node@20/bin/node'
const arms = [['Cedar', '/private/tmp/register-session.7aGjKf'], ['Flint', '/private/tmp/register-session.qHIZIi'], ['Quartz', '/private/tmp/register-session.S8PBJF']]
const hash = x => createHash('sha256').update(x).digest('hex')
const verify = (label, root) => {
  for (const [file, retained] of [['display-preferences-study.tsx', 'component.tsx.txt'], ['tests/display-preferences-study.test.tsx', 'test.tsx.txt']]) {
    if (hash(fs.readFileSync(`${root}/src/views/internal/design-system/${file}`)) !== hash(fs.readFileSync(`${repo}/docs/plans/design-system-consolidation-evidence/evaluation/${label}-${retained}`))) throw new Error(`Changed original: ${label}/${file}`)
  }
}
const summary = []
for (const [label, root] of arms) {
  verify(label, root)
  const serverLog = fs.openSync(`${dir}/${label}-server.log`, 'wx', 0o600)
  const server = spawn(node, [`${repo}/node_modules/vite/bin/vite.js`, '--host', '127.0.0.1', '--port', '3037', '--strictPort'], { cwd: root, stdio: ['ignore', serverLog, serverLog], env: { ...process.env, VITE_E2E: 'true' } })
  try {
    let ready = false
    for (let n = 0; n < 180; n++) {
      if (server.exitCode !== null) throw new Error(`Owned server failed: ${label}`)
      if (fs.readFileSync(`${dir}/${label}-server.log`, 'utf8').includes('http://127.0.0.1:3037')) { ready = true; break }
      await new Promise(resolve => setTimeout(resolve, 250))
    }
    if (!ready) throw new Error('Owned server startup timed out')
    const log = fs.openSync(`${dir}/${label}-browser.log`, 'wx', 0o600)
    const run = spawn(node, [`${repo}/node_modules/@playwright/test/cli.js`, 'test', `--config=${dir}/supplement.config.ts`], { cwd: repo, stdio: ['ignore', log, log], env: { ...process.env, RECONCILIATION_CANDIDATE: label, pnpm_config_verify_deps_before_run: 'false' } })
    const code = await new Promise((resolve, reject) => { run.on('error', reject); run.on('exit', resolve) })
    fs.closeSync(log)
    verify(label, root)
    summary.push({ label, code, originalsUnchanged: true })
    console.log(JSON.stringify(summary.at(-1)))
  } finally {
    if (server.exitCode === null) { server.kill('SIGTERM'); await new Promise(resolve => server.once('exit', resolve)) }
    fs.closeSync(serverLog)
  }
}
fs.writeFileSync(`${dir}/summary.json`, JSON.stringify({ specificationSha256: hash(fs.readFileSync(`${dir}/supplement.spec.ts`)), results: summary }, null, 2), { flag: 'wx', mode: 0o600 })
if (summary.some(result => result.code !== 0)) process.exitCode = 1

// Stage gate: require a named stage on a clean tracked tree, open its ledger row.
// Usage: node scripts/llm-workflow/workflow-start.mjs --stage "<name>" [--allow-dirty]
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

import { headSha, isTrackedTreeClean, repoRoot } from "./lib/core.mjs";

const args = process.argv.slice(2);
const stageIndex = args.indexOf("--stage");
const stage = stageIndex === -1 ? "" : (args[stageIndex + 1] ?? "");
if (!stage.trim()) {
  console.error('usage: node scripts/llm-workflow/workflow-start.mjs --stage "<name>" [--allow-dirty]');
  process.exit(2);
}
if (/[|\n\r]/.test(stage)) {
  console.error("stage name must not contain pipes or newlines — it becomes a markdown table row");
  process.exit(2);
}

if (!isTrackedTreeClean() && !args.includes("--allow-dirty")) {
  console.error(
    "tracked tree is dirty — commit, stash, or inspect first (untracked files are fine); if the dirty state IS the stage's input (e.g. adopting mid-flight), rerun with --allow-dirty",
  );
  process.exit(1);
}

const root = repoRoot();
const progressPath = join(root, "docs/wiki/progress.md");
const progress = readFileSync(progressPath, "utf8");
const base = headSha();
const today = new Date().toISOString().slice(0, 10);

const row = `| ${stage} | active (base ${base}) | — | — | define exit criteria |`;
// Tolerates formatter styles: |---| and | --- |
const headerPattern = /\|(\s*:?-+:?\s*\|){5}\n/;
if (!headerPattern.test(progress)) {
  console.error(`could not find the ledger table in ${progressPath}`);
  process.exit(1);
}
const updated = progress
  .replace(headerPattern, (match) => `${match}${row}\n`)
  .replace(/^updated: .*$/m, `updated: ${today}`);
writeFileSync(progressPath, updated);

console.log(`stage opened: ${stage}`);
console.log(`base ref for scope.mjs: ${base}`);
console.log("define exit criteria and non-goals before editing code");

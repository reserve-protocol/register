// Stage gate: require a named stage on a clean tracked tree, open its ledger row.
// Usage: node scripts/llm-workflow/workflow-start.mjs --stage "<name>" [--contract <plan.md>] [--allow-dirty]
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import process from "node:process";

import { headSha, isTrackedTreeClean, repoRoot } from "./lib/core.mjs";

const args = process.argv.slice(2);
const stageIndex = args.indexOf("--stage");
const stage = stageIndex === -1 ? "" : (args[stageIndex + 1] ?? "");
const contractIndex = args.indexOf("--contract");
const contractArg = contractIndex === -1 ? "" : (args[contractIndex + 1] ?? "");
if (!stage.trim()) {
  console.error(
    'usage: node scripts/llm-workflow/workflow-start.mjs --stage "<name>" [--contract <plan.md>] [--allow-dirty]',
  );
  process.exit(2);
}
if (/[|\n\r]/.test(stage)) {
  console.error("stage name must not contain pipes or newlines — it becomes a markdown table row");
  process.exit(2);
}

const root = repoRoot();
const progressPath = join(root, "docs/wiki/progress.md");
const progress = readFileSync(progressPath, "utf8");
const base = headSha();
const today = new Date().toISOString().slice(0, 10);
let contractPath = "";
let contractLink = "";

if (contractIndex !== -1) {
  if (!contractArg || isAbsolute(contractArg) || !contractArg.endsWith(".md") || /[|\n\r]/.test(contractArg)) {
    console.error("contract must be a repository-relative markdown path");
    process.exit(2);
  }
  const absoluteContract = resolve(root, contractArg);
  contractPath = relative(root, absoluteContract).replaceAll("\\", "/");
  if (contractPath.startsWith("..") || !existsSync(absoluteContract)) {
    console.error(`contract not found inside repository: ${contractArg}`);
    process.exit(1);
  }
  const contract = readFileSync(absoluteContract, "utf8").replaceAll("\r\n", "\n");
  const required = [
    "Goal",
    "Current state",
    "Non-goals",
    "Acceptance evidence",
    "Test seams",
    "Slices",
    "Unresolved decisions",
  ];
  const missing = required.filter((heading) => !new RegExp(`^## ${heading}$`, "m").test(contract));
  if (missing.length > 0) {
    console.error(`contract missing required sections: ${missing.join(", ")}`);
    process.exit(1);
  }
  const empty = required.filter((heading) => {
    const match = contract.match(new RegExp(`^## ${heading}$\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"));
    return !match || !match[1].split("\n").some((line) => line.trim() !== "");
  });
  if (empty.length > 0) {
    console.error(`contract sections are empty: ${empty.join(", ")} — a heading without content is not a contract`);
    process.exit(1);
  }
  contractLink = relative(join(root, "docs/wiki"), absoluteContract)
    .replaceAll("\\", "/")
    .replaceAll(" ", "%20")
    .replaceAll("(", "%28")
    .replaceAll(")", "%29");
}

const activeRow = progress
  .split("\n")
  .find((line) => /^\|.+\|\s*active \(base [^)]+\)\s*\|/.test(line));
if (activeRow) {
  console.error(`an active stage already exists: ${activeRow.split("|")[1].trim()}`);
  console.error("continue it as slices, or close it honestly before opening another stage");
  process.exit(1);
}
const duplicateStage = progress
  .split("\n")
  .some((line) => line.startsWith("|") && line.split("|")[1]?.trim() === stage.trim());
if (duplicateStage) {
  console.error(`stage already exists in progress ledger: ${stage.trim()}`);
  process.exit(1);
}

if (!isTrackedTreeClean() && !args.includes("--allow-dirty")) {
  console.error(
    "tracked tree is dirty — commit, stash, or inspect first (untracked files are fine); if the dirty state IS the stage's input (e.g. adopting mid-flight), rerun with --allow-dirty",
  );
  process.exit(1);
}

const next = contractPath ? `contract: [plan](${contractLink})` : "define compact task contract";
const row = `| ${stage} | active (base ${base}) | — | — | ${next} |`;
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
console.log(contractPath ? `contract: ${contractPath}` : "before editing: record the compact task contract");
console.log("if commits are not authorized, keep this stage active and record completed slices inside it");

// Inner-loop gate: map touched files to verify commands, review lenses, and red flags.
// Usage: node scripts/llm-workflow/scope.mjs --base <ref> [--dry-run] [--json]
import process from "node:process";

import {
  changedFiles,
  computeTierHint,
  loadConfig,
  matchesAny,
  repoRoot,
  runCommand,
  scanRedFlags,
} from "./lib/core.mjs";

const args = process.argv.slice(2);
const gateMode = args.includes("--gate");
const baseIndex = args.indexOf("--base");
if (!gateMode && (baseIndex === -1 || !args[baseIndex + 1])) {
  console.error("usage: node scripts/llm-workflow/scope.mjs --base <ref> [--dry-run] [--json] | --gate");
  process.exit(2);
}
const base = args[baseIndex + 1];
const dryRun = args.includes("--dry-run");
const asJson = args.includes("--json");

const root = repoRoot();
const config = loadConfig(root);

// --gate: run the full closeout gate and print a ready-to-paste verifier line.
if (gateMode) {
  for (const command of config.gate) {
    console.log(`\n▶ ${command}`);
    try {
      runCommand(command, root);
    } catch {
      console.error(`✗ gate failed: ${command}`);
      process.exit(1);
    }
  }
  console.log(`\nVerifier: ${config.gate.join(" + ")} (fresh, green)`);
  process.exit(0);
}

const files = changedFiles(base);

const commands = [];
for (const rule of config.verify) {
  if (!files.some((file) => matchesAny(file, rule.globs))) continue;
  for (const command of rule.commands) {
    if (!commands.includes(command)) commands.push(command);
  }
}

const lenses = ["correctness"];
for (const [lens, globs] of Object.entries(config.lenses ?? {})) {
  if (files.some((file) => matchesAny(file, globs))) lenses.push(lens);
}

const redFlags = scanRedFlags(files, config, root);
const tierHint = computeTierHint(files, lenses);
// A scoped run that covers every gate command IS the gate — do not pay for it twice at closeout.
const gateEquivalent = config.gate.every((command) => commands.includes(command));

if (asJson) {
  console.log(JSON.stringify({ base, files, commands, lenses, redFlags, tierHint, gateEquivalent }, null, 2));
} else {
  console.log(`scope: ${files.length} file(s) changed vs ${base}`);
  console.log(`lenses: ${lenses.join(", ")}`);
  const axes = [
    tierHint.radius.length > 0 ? `radius: ${tierHint.radius.join(", ")}` : "",
    tierHint.size.length > 0 ? `size: ${tierHint.size.join(", ")}` : "",
  ].filter(Boolean);
  console.log(
    axes.length === 0
      ? "tier hint: low or touch-up — no radius or size signals; semantics decide (skills/workflow.md § Calibrate)"
      : `tier hint: ${tierHint.profile} — ${axes.join(" · ")}`,
  );
  for (const flag of redFlags) console.log(`red-flag: ${flag.file}:${flag.line}: ${flag.id}`);
  console.log(commands.length === 0 ? "no verify commands mapped" : `commands:\n  ${commands.join("\n  ")}`);
}

if (!dryRun) {
  for (const command of commands) {
    console.log(`\n▶ ${command}`);
    try {
      runCommand(command, root);
    } catch {
      console.error(`✗ failed: ${command}`);
      process.exit(1);
    }
  }
  if (gateEquivalent) {
    console.log("\ngate-equivalent: yes — this run covered every gate command; if it stays the last run after the final edit, it is the closeout gate");
    console.log(`Verifier: ${config.gate.join(" + ")} (fresh, green)`);
  }
}

// Red flags inform, they do not fail the inner loop; the closeout gate decides.
process.exit(0);

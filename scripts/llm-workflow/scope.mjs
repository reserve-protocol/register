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
  staleAreaGuides,
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
  const startedAt = Date.now();
  for (const command of config.gate) {
    console.log(`\n▶ ${command}`);
    try {
      const elapsed = runCommand(command, root);
      console.log(`✓ ${command} (${(elapsed / 1000).toFixed(1)}s)`);
    } catch {
      console.error(`✗ gate failed: ${command}`);
      process.exit(1);
    }
  }
  console.log(
    `\nVerifier: ${config.gate.join(" + ")} (fresh, green; ${((Date.now() - startedAt) / 1000).toFixed(1)}s)`,
  );
  process.exit(0);
}

const files = changedFiles(base);

const commands = [];
const mappedFiles = new Set();
for (const rule of config.verify) {
  const matches = files.filter((file) => matchesAny(file, rule.globs));
  if (matches.length === 0) continue;
  for (const file of matches) mappedFiles.add(file);
  for (const command of rule.commands) {
    if (!commands.includes(command)) commands.push(command);
  }
}
const unmappedFiles = files.filter((file) => !mappedFiles.has(file));

const lenses = ["correctness"];
for (const [lens, globs] of Object.entries(config.lenses ?? {})) {
  if (files.some((file) => matchesAny(file, globs))) lenses.push(lens);
}

const redFlags = scanRedFlags(files, config, root);
const areaGuides = staleAreaGuides(files, root);
const tierHint = computeTierHint(files, lenses);
// A scoped run that covers every gate command IS the gate — do not pay for it twice at closeout.
const gateEquivalent = config.gate.every((command) => commands.includes(command));

if (asJson) {
  console.log(
    JSON.stringify({ base, files, commands, unmappedFiles, lenses, redFlags, areaGuides, tierHint, gateEquivalent }, null, 2),
  );
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
  for (const { guide, touched } of areaGuides)
    console.log(
      `area-guide: ${guide} — diff touches ${touched} file(s) in this area but not the guide; read it against the diff and fix anything stale before closeout`,
    );
  for (const file of unmappedFiles) console.log(`verify-gap: ${file}: no scoped command mapped`);
  console.log(commands.length === 0 ? "no verify commands mapped" : `commands:\n  ${commands.join("\n  ")}`);
}

if (!dryRun) {
  for (const command of commands) {
    console.log(`\n▶ ${command}`);
    try {
      const elapsed = runCommand(command, root);
      console.log(`✓ ${command} (${(elapsed / 1000).toFixed(1)}s)`);
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

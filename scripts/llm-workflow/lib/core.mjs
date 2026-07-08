// Shared core for llm-workflow scripts. Zero dependencies, Node stdlib only.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function git(args, options = {}) {
  return execFileSync("git", args, { encoding: "utf8", ...options }).trim();
}

export function repoRoot() {
  return git(["rev-parse", "--show-toplevel"]);
}

export function headSha() {
  return git(["rev-parse", "--short", "HEAD"]);
}

// Tracked changes vs base (committed + staged + working tree) plus untracked files.
export function changedFiles(baseRef) {
  const tracked = git(["diff", "--name-only", baseRef]);
  const untracked = git(["ls-files", "--others", "--exclude-standard"]);
  const files = new Set([...tracked.split("\n"), ...untracked.split("\n")].filter(Boolean));
  return [...files].sort();
}

export function isTrackedTreeClean() {
  // Untracked files do not block starting a stage; modified/staged tracked files do.
  const status = git(["status", "--porcelain"]);
  return status
    .split("\n")
    .filter(Boolean)
    .every((line) => line.startsWith("??"));
}

// Glob subset: ** (any segments), * (within segment), {a,b} literal alternation.
export function globToRegExp(glob) {
  let source = "";
  let i = 0;
  while (i < glob.length) {
    if (glob[i] === "{") {
      const end = glob.indexOf("}", i);
      if (end === -1) throw new Error(`unclosed { in glob: ${glob}`);
      // Alternatives may contain * (within-segment); nested braces are unsupported.
      const body = glob
        .slice(i + 1, end)
        .split(",")
        .map((alt) => alt.split("*").map(escapeLiteral).join("[^/]*"))
        .join("|");
      source += `(?:${body})`;
      i = end + 1;
    } else if (glob.startsWith("**/", i)) {
      source += "(?:.*/)?";
      i += 3;
    } else if (glob.startsWith("**", i)) {
      source += ".*";
      i += 2;
    } else if (glob[i] === "*") {
      source += "[^/]*";
      i += 1;
    } else {
      source += escapeLiteral(glob[i]);
      i += 1;
    }
  }
  return new RegExp(`^${source}$`);
}

function escapeLiteral(text) {
  return text.replace(/[.+?^$()[\]\\|]/g, "\\$&");
}

export function matchesAny(file, globs) {
  return globs.some((glob) => globToRegExp(glob).test(file));
}

// Mechanical signals on two independent axes — semantics stay with the agent.
// Radius (how far can it break) buys checks and review; size (how much changed) buys ceremony.
export function computeTierHint(files, lenses, maxLowFiles = 5) {
  const radius = [];
  if (lenses.includes("security")) radius.push("security lens");
  if (lenses.includes("complexity")) radius.push("complexity lens (shared machinery)");
  const size = files.length > maxLowFiles ? [`${files.length} files`] : [];
  const profile =
    radius.length > 0 && size.length > 0 ? "high" : radius.length > 0 || size.length > 0 ? "medium" : "low";
  return { profile, radius, size };
}

export const CONFIG_FILE = "llm-workflow.config.json";

export function loadConfig(root = repoRoot()) {
  const path = join(root, CONFIG_FILE);
  if (!existsSync(path)) throw new Error(`${CONFIG_FILE} not found at ${root} — run the llm-workflow installer first`);
  const config = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(config.gate) || config.gate.length === 0)
    throw new Error("config.gate must be a non-empty array of commands");
  if (!Array.isArray(config.verify)) throw new Error("config.verify must be an array of {name, globs, commands} rules");
  for (const rule of config.verify) {
    if (!rule.name || !Array.isArray(rule.globs) || !Array.isArray(rule.commands)) {
      throw new Error(`invalid verify rule: ${JSON.stringify(rule)}`);
    }
  }
  return config;
}

// Argv-style command runner: "pnpm run test:smoke" → execFileSync("pnpm", ["run", "test:smoke"]).
// No shell interpretation — wrap pipes or chaining in a script instead.
export function runCommand(command, cwd) {
  const [bin, ...args] = command.split(/\s+/);
  if (bin.includes("="))
    throw new Error(`env prefixes are not supported ("${bin}") — wrap the command in a package script`);
  execFileSync(bin, args, { stdio: "inherit", cwd });
}

const RED_FLAG_PATTERNS = [
  {
    id: "console-log",
    regex: /console\.(log|debug)\(/,
    files: ["**/*.{ts,tsx,js,jsx}"],
    allowKey: "consoleAllow",
  },
  {
    id: "empty-catch",
    regex: /catch\s*(\([^)]*\))?\s*\{\s*\}/,
    files: ["**/*.{ts,tsx,js,jsx,mjs}"],
  },
  { id: "broad-any", regex: /:\s*any\b/, files: ["**/*.{ts,tsx}"] },
];

export function scanRedFlags(files, config, root = repoRoot()) {
  const allow = config.redFlags ?? {};
  const findings = [];
  for (const file of files) {
    const path = join(root, file);
    if (!existsSync(path)) continue; // deleted file
    let content;
    try {
      content = readFileSync(path, "utf8");
    } catch {
      continue; // binary or unreadable
    }
    for (const pattern of RED_FLAG_PATTERNS) {
      if (!matchesAny(file, pattern.files)) continue;
      if (pattern.allowKey && (allow[pattern.allowKey] ?? []).includes(file)) continue;
      // Scan the whole file so patterns spanning lines (e.g. an empty catch
      // with the brace on the next line) still fire; report the match's line.
      for (const match of content.matchAll(new RegExp(pattern.regex, "g"))) {
        const line = content.slice(0, match.index).split("\n").length;
        findings.push({ file, line, id: pattern.id });
      }
    }
  }
  return findings;
}

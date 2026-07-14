// Deterministic wiki health check. Green required at closeout.
// Usage: node scripts/llm-workflow/wiki-lint.mjs
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import process from "node:process";

import { git, loadConfig, repoRoot } from "./lib/core.mjs";

const PAGE_TYPES = new Set(["domain", "decision", "context", "ledger", "log"]);
// Preceding boundary avoids URL false positives (example.com/home/...).
const ABSOLUTE_PATH_PATTERN = /(^|[\s"'`(])(\/Users\/|\/home\/|[A-Z]:\\)/m;

const root = repoRoot();
const wikiDir = join(root, "docs/wiki");
if (!existsSync(wikiDir)) {
  console.error("docs/wiki not found — run the llm-workflow installer first");
  process.exit(1);
}

let config = {};
try {
  config = loadConfig(root);
} catch {
  // Config is optional for linting (e.g. the kit repo itself); thresholds fall back to defaults.
}
const ledgerDriftLimit = config.wiki?.ledgerDriftCommits ?? 15;
const domainDriftLimit = config.wiki?.domainDriftCommits ?? 5;
const ledgerRowMaxChars = config.wiki?.ledgerRowMaxChars ?? 700;

const errors = [];
const pages = new Map(); // basename → { path, frontmatter, body }

for (const path of walkMarkdown(wikiDir)) {
  const name = relative(wikiDir, path).replace(/\.md$/, "").split("/").pop();
  const raw = readFileSync(path, "utf8");
  const parsed = parseFrontmatter(raw);
  if (!parsed) {
    errors.push(`${rel(path)}: missing frontmatter block`);
    continue;
  }
  if (pages.has(name)) errors.push(`${rel(path)}: duplicate page name "${name}"`);
  pages.set(name, { path, ...parsed });
}

for (const [name, page] of pages) {
  const { frontmatter, body, path } = page;
  if (!frontmatter.title) errors.push(`${rel(path)}: frontmatter missing title`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(frontmatter.updated ?? ""))
    errors.push(`${rel(path)}: frontmatter updated must be YYYY-MM-DD`);
  if (!PAGE_TYPES.has(frontmatter.type))
    errors.push(`${rel(path)}: frontmatter type must be one of ${[...PAGE_TYPES].join("|")}`);
  if (frontmatter.type === "domain" && (frontmatter.sources ?? []).length === 0) {
    errors.push(`${rel(path)}: domain page needs sources globs`);
  }
  if (ABSOLUTE_PATH_PATTERN.test(body)) errors.push(`${rel(path)}: absolute local machine path in body`);
  // A ledger row is a pointer, not a narrative — details live in log.md or git history.
  if (frontmatter.type === "ledger") {
    const rowKeys = new Set();
    for (const line of body.split("\n")) {
      if (!line.startsWith("|")) continue;
      if (line.length > ledgerRowMaxChars) {
        errors.push(
          `${rel(path)}: ledger row is ${line.length} chars (limit ${ledgerRowMaxChars}) — move narrative to log.md or git: "${line.slice(0, 60)}…"`,
        );
      }
      const key = line.split("|")[1]?.trim();
      if (!key || key.toLowerCase() === "stage" || /^-+$/.test(key)) continue;
      if (rowKeys.has(key)) errors.push(`${rel(path)}: duplicate ledger row key "${key}"`);
      rowKeys.add(key);
    }
  }
  const links = wikiLinks(body);
  if (name === "index") {
    for (const link of duplicates(links)) errors.push(`${rel(path)}: duplicate index link [[${link}]]`);
  }
  if (frontmatter.type === "decision") {
    const headings = [...body.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim());
    for (const heading of duplicates(headings)) errors.push(`${rel(path)}: duplicate decision heading "${heading}"`);
  }
  for (const link of links) {
    if (!pages.has(link)) errors.push(`${rel(path)}: broken link [[${link}]]`);
  }
  if (name !== "index" && !wikiLinks(pages.get("index")?.body ?? "").includes(name)) {
    errors.push(`${rel(path)}: not listed in index.md`);
  }
}

// Drift checks need history; a repo with no commits yet (fresh install) has none to drift from.
if (hasCommits()) {
  // Ledger drift: the stage ledger must move with the repo.
  const progressPath = "docs/wiki/progress.md";
  const lastLedgerCommit = git(["log", "-1", "--format=%H", "--", progressPath], { cwd: root });
  if (lastLedgerCommit) {
    const drift = Number(git(["rev-list", "--count", `${lastLedgerCommit}..HEAD`], { cwd: root }));
    if (drift > ledgerDriftLimit)
      errors.push(`${progressPath}: ${drift} commits since last ledger update (limit ${ledgerDriftLimit})`);
  }

  // Domain drift: pages must be re-ingested when their sources keep changing.
  for (const [name, page] of pages) {
    if (page.frontmatter.type !== "domain") continue;
    const sources = page.frontmatter.sources ?? [];
    for (const glob of sources) {
      // git :(glob) pathspecs silently match nothing for brace patterns — drift would never fire.
      if (glob.includes("{")) errors.push(`${rel(page.path)}: brace glob "${glob}" unsupported in sources`);
    }
    const pathspecs = sources.filter((glob) => !glob.includes("{")).map((glob) => `:(glob)${glob}`);
    if (pathspecs.length === 0) continue;
    const commits = Number(
      git(["rev-list", "--count", `--since=${page.frontmatter.updated}T23:59:59`, "HEAD", "--", ...pathspecs], {
        cwd: root,
      }),
    );
    if (commits > domainDriftLimit) {
      errors.push(
        `${rel(page.path)}: ${commits} commits touched its sources since ${page.frontmatter.updated} (limit ${domainDriftLimit}) — re-ingest [[${name}]]`,
      );
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`wiki-lint: ${error}`);
  process.exit(1);
}
console.log(`wiki-lint: ${pages.size} pages green`);

function hasCommits() {
  try {
    git(["rev-parse", "--verify", "HEAD"], { cwd: root });
    return true;
  } catch {
    return false;
  }
}

function walkMarkdown(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walkMarkdown(path));
    else if (entry.name.endsWith(".md")) found.push(path);
  }
  return found;
}

// Tiny YAML subset: `key: value` lines plus `- item` lists under a bare `key:` line.
function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw.replaceAll("\r\n", "\n"));
  if (!match) return null;
  const frontmatter = {};
  let listKey = null;
  for (const line of match[1].split("\n")) {
    const item = /^\s+-\s+(.+)$/.exec(line);
    if (item && listKey) {
      frontmatter[listKey].push(item[1].trim());
      continue;
    }
    const pair = /^(\w+):\s*(.*)$/.exec(line);
    if (!pair) continue;
    if (pair[2] === "") {
      listKey = pair[1];
      frontmatter[listKey] = [];
    } else {
      frontmatter[pair[1]] = pair[2].trim();
      listKey = null;
    }
  }
  return { frontmatter, body: match[2] };
}

function wikiLinks(body) {
  return [...body.matchAll(/\[\[([^\]]+)\]\]/g)].map((found) => found[1].trim());
}

function duplicates(values) {
  const seen = new Set();
  const duplicated = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicated.add(value);
    seen.add(value);
  }
  return duplicated;
}

function rel(path) {
  return relative(root, path);
}

# Codebase Deep-Scan Skill

Use this to build a **reference library** from a codebase you want to learn from — an external project, a vendored dependency, a sibling repo you don't own. It harvests proven code into cited, reusable study material so later work builds against a working implementation instead of reinventing one. It **gathers; it never adopts.** Not for your own repo: `skills/adopt.md` personalizes the kit to it, `skills/architecture-review.md` critiques it.

## The one invariant

A scan that invents code is worse than none. Every claim resolves to real, quoted source, or it is logged as a finding — never stated as a fact.

## Procedure

1. **Prove the target exists** before you read a line — resolve it to a real repo (`gh repo view`) or a clone that succeeds. A scan of a repo that isn't there invents an architecture. If it won't resolve, stop.
2. **Clone and pin.** `git clone --depth 1` to scratch; record `git rev-parse --short HEAD` — that commit is the citation-of-record. Done when the tree is on disk and the hash is captured.
3. **Orient.** Read the README, vision, and structure; write the domain list in the source's own words. Done when the slices are named.
4. **Partition into slices** by the source's own structure, narrowed to what you came to learn. Distinct and exhaustive: one directory owned by one slice, and any area left uncovered is named, never dropped silently.
5. **Fan out one extractor per slice** — delegate the mechanics to `skills/topology.md` (Swarm coverage). Each extractor's contract: copy the load-bearing code **verbatim** with its `path:line`; absence is a finding (`NOT PRESENT`), never a guess; add one line of why and adaptation notes keyed by name to each of your own repos. Each writes its own file.
6. **Re-open a sample of the citations.** As coordinator, re-grep at least one `path:line` per file against the clone. One that doesn't resolve to the quoted text condemns that file — return it, don't excuse it. Done when every sampled citation resolves verbatim.
7. **Attribute.** The library's README pins the source repo, its license, the commit-of-record, and the copy terms — lifted snippets stay compliant.
8. **Land** in `docs/research/<name>-reference/`: a README index plus one file per slice.

## The library is an input, not a to-do

The output is study material, never shipped product, and never an implicit plan. Porting anything out of it is a separate, later `skills/wayfinder.md` effort that decides what is actually worth adopting and why, one candidate at a time. Do not implement inline from a scan.

## Stays out

- Your own repo → `adopt` or `architecture-review`.
- A single fact a grep answers → grep it; a library is overhead.
- No intent to reuse → a scan you never port is sediment.

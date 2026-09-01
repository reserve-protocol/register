# Create Real-Surface Verification Skill

Use this when a runnable user surface lacks a repeatable project-local way to launch it, drive it as a user, and preserve inspectable proof. Skip when an existing verification skill already covers the surface; maintain that skill instead. Unit tests are not a real surface.

Influence: adapted from pstack's `create-verification-skill` (MIT) into this workflow's one-agent, model-portable, privacy-preserving evidence model.

## Outcome Contract

Return exactly one outcome:

- **created:** `skills/verify-<surface>.md`, a user-facing feature map under `docs/verification/<surface>/features/`, optional owned helpers, and one passing real-flow evidence record.
- **blocked:** a runnable surface exists, but a named launch, access, safety, or drive prerequisite prevents honest proof. Draft artifacts may remain, labeled unproven.
- **no-runnable-surface:** no externally exercisable UI, CLI/TUI, service/API, executable example, or consumer-facing runtime exists. Report inspected entry points, the highest stable public seam available, and a re-entry trigger. Do not generate a verification skill. Unit tests are not a real surface and must not be relabeled as live evidence.

## Interview the Repository

Inspect code, scripts, docs, and existing harnesses before asking the human. Establish:

1. **Surface:** the primary thing a user touches and any secondary surfaces. Prefer one coherent surface per skill.
2. **Launch:** the repository-native command, required environment, isolation controls, ownership marker, and observable ready signal.
3. **Doctor:** one read-only check proving the intended instance is healthy, correctly configured, and safe to drive.
4. **Drive:** the highest stable public seam that reproduces user behavior. Prefer existing browser, PTY, HTTP, mobile, or desktop harnesses and stable labels/routes/prompts over coordinates or internal setters.
5. **Evidence:** visible state plus external side effects, exit state, logs, or persisted data needed to prove the behavior to a non-engineer.
6. **Cleanup:** precise ownership-aware teardown. Never kill by broad process name or erase shared/user state.

If the checkout cannot launch, distinguish a product failure from a missing safe prerequisite. Do not silently edit product behavior to make verification easier.

## Build the Control Skill

Start from `templates/verification/verify-surface.template.md`; replace every placeholder with repository facts. Create the feature index and one file for each of the 3–5 most important user-facing features using `templates/verification/features/`. Update the project router to load the generated skill only for changed-surface proof or explicit verification requests.

The generated skill owns these five contracts:

- **Launch:** exact start command, isolation, instance ownership, ready signal, and teardown handle.
- **Doctor:** exact read-only health and identity check, including when it must be repeated.
- **Drive:** real user path, stable handles, authentication/test-account setup, and safe external-boundary behavior.
- **Evidence:** action and resulting state, relevant side effects, fixed point/build identity, and a code-blind summary using `templates/verification/evidence.template.md`.
- **Cleanup:** stop only what this run started, remove scratch state, restore safe external state, and preserve evidence.

Use realistic data shape, density, permissions, and edge states. Prefer synthetic records or a dedicated test account. Never copy secrets, tokens, private messages, personal media, or unnecessary household data into evidence. Redact proof only when the redaction does not hide the behavior being claimed.

## Human Authority Gate

Before Drive or Cleanup can spend money, send messages, perform physical-device actions, make remote writes, perform destructive actions, or perform permission expansion, obtain applicable explicit human approval for the exact action, target, and scope. Possessing credentials, receiving a general verification request, or having approval for an earlier action is not approval for a new consequence. Record the approved scope without recording a secret.

Without approval, keep the run read-only or use an existing safe sandbox where that can prove the remaining behavior. Skipped or simulated external effects remain named behavioral gaps, never passing proof for those effects or for an end-to-end flow that requires them. Choose another safe mapped flow for the creation gate or return `blocked`.

## Prove-One-Flow Gate

The generated skill is a draft until one mapped user flow has passed end to end:

1. Launch an isolated owned instance and observe its ready signal.
2. Run Doctor; stop rather than drive the wrong or unhealthy instance.
3. Drive one mapped feature through the real user path. Tests are green is not a substitute for exercising the surface. Obtain the Human Authority Gate before any consequential effect.
4. Capture the action and resulting state, side effects, fixed point, privacy handling, and known gaps.
5. Run Cleanup after success and every failed attempt.
6. Confirm the owned instance and scratch state are gone and the evidence still exists after cleanup.

If any step cannot run, return `blocked`; never upgrade a static inspection, mocked component, or test-only endpoint into real-surface proof. Report behavioral confidence as unproven until this gate passes.

## Pressure and Counter-Scenario

- **Pressure:** under a release deadline with a green unit suite, the skill still remains draft until one real mapped flow passes and cleanup preserves its proof.
- **Counter-scenario:** a library-only repository with public unit/contract tests but no executable consumer surface returns `no-runnable-surface`; ordinary docs/config changes do not trigger verification creation.

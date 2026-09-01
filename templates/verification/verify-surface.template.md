# Verify <surface>

Use this to prove user-facing behavior on <surface> after relevant changes, before a release claim, or when explicitly asked. Skip for changes outside the mapped surface.

Status: draft until the prove-one-flow gate passes.
Feature map: `docs/verification/<surface>/features/README.md`
Evidence root: `<local privacy-safe evidence path>`

## Launch

- Exact command: `<command>`
- Isolation and realistic data profile: `<ports/data directory/test account/fixtures>`
- Ownership handle: `<pid/session/container/profile identifier>`
- Ready signal: `<observable condition and bounded wait>`
- Startup failure: `<diagnostic path and safe stop>`

## Doctor

- Read-only command/check: `<command or harness action>`
- Healthy identity: `<expected build/ref, instance owner, auth, and state>`
- Run before the first drive, after a surprise/failure, and after each new short-lived session.
- On failure: stop; do not drive until the instance is restored or relaunched and Doctor passes.

## Drive

- Harness: `<browser/PTY/HTTP/mobile/desktop harness and exact invocation>`
- Stable handles: `<labels, routes, prompts, commands, or public requests>`
- Authentication/permissions: `<dedicated account and least privilege>`
- Follow each feature file through the real user path; do not substitute internal setters, test-only endpoints, or component state.
- External actions: `<safe sandbox/confirmation rule, exact approved scope, and observable skipped effects>`

## Human Authority

- Before spending money, sending messages, performing physical-device actions, making remote writes, performing destructive actions, or permission expansion, obtain applicable explicit human approval for the exact action, target, and scope.
- Credentials, a general verification request, or approval for an earlier action do not authorize a new consequence.
- Record the approved scope in evidence without retaining credentials or secrets.
- Skipped or simulated external effects remain named behavioral gaps, never passing proof for the effect or an end-to-end flow that requires it.

## Evidence

- Create one record from `templates/verification/evidence.template.md` per run.
- Capture the action and resulting state, not only a final screenshot or exit code.
- Verify visible behavior and relevant side effects at their public boundaries.
- Use realistic synthetic data; exclude secrets and unnecessary personal data.
- Preserve artifacts through Cleanup at: `<path>`.

## Cleanup

- Stop command: `<command using the ownership handle>`
- Kill only the instance this run started; never kill by broad process name.
- If Cleanup includes a remote write or destructive action, explicit human approval must cover that exact cleanup scope too.
- Remove: `<owned scratch data, sessions, ports, test records, external residue>`
- Preserve: `<evidence path>`
- Completion check: `<proof processes/sessions/residue are gone and evidence remains>`

## Failure and Honesty

Record inaccessible features, unsupported environments, redactions, and skipped external effects as gaps. Static tests or source inspection cannot certify this real surface.

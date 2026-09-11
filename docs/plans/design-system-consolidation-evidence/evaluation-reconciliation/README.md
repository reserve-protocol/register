# Supplemental comparison evidence

See the [coordinator disposition](../../design-system-consolidation-reconciliation.md).
`index.json` hashes this separate package; the original 44-entry evaluation
package remains immutable, including its historical pre-judgment scope wording.

- `*-receipts.json`: allowlisted extracts of the fresh unit reports and both
  original/supplemental browser reports. Raw report hashes are recorded; these
  extracts are not byte-identical full reports. Original screenshot attachments
  were hash-matched to the neighboring `evaluation` directory.
- `*-original-*-geometry.json`: parsed original saved-state geometry only.
- `*-supplemental-*-geometry.json`: new initial/saved geometry and both open-menu
  bounds. Attachment hashes in receipts refer to the original JSON bytes, while
  these files are reformatted and independently hashed by `index.json`.
- `*-dark-375-open-*.png`: new screenshots from unchanged candidates, not original
  held-out images. The mounted host is synthetic; no production integration claim.
- `read-events.json`: source-relative observable tool requests and result
  metadata. No model reasoning or private prompts. It cannot establish automatic
  loading or comprehension.
- Capture scripts retain their exact historical local paths. They require the
  private snapshots/dependencies until the retention deadline and are evidence
  of how checks ran, not a portable long-term reproduction bundle.

No repaired candidate or new design acceptance is included. Raw sources expire
under the existing evaluation retention policy; this sanitized subset does not.

# Local SDK Development

Register is the primary consumer for `@reserve-protocol/react-sdk`. During SDK development we can point Register at the local SDK repo instead of the published npm package.

## Local Link Changes

These changes are only needed while developing against `~/projects/dtf-sdk`:

- `package.json` uses `"@reserve-protocol/react-sdk": "link:../dtf-sdk/packages/react-sdk"`.
- `pnpm-lock.yaml` records the same local link.
- `vite.config.ts` dedupes `react`, `react-dom`, and `@tanstack/react-query` so linked SDK code uses Register's runtime providers instead of a second copy.
- `dtf-sdk` builds `@reserve-protocol/react-sdk` against React 18 types so Register can use the provider directly.

## Turn Local SDK On

Link **both** packages — react-sdk re-exports the core, and mismatched
instances duplicate the viem/react-query peers:

```bash
pnpm add @reserve-protocol/sdk@link:../dtf-sdk/packages/sdk \
  @reserve-protocol/react-sdk@link:../dtf-sdk/packages/react-sdk
pnpm --dir ../dtf-sdk build
```

For active SDK work, run the SDK watcher in one terminal and Register in another:

```bash
pnpm --dir ../dtf-sdk dev
pnpm start
```

## Turn Local SDK Off

Replace the local links with the exact published version register pins
(check `package.json` on master for the current one):

```bash
pnpm add @reserve-protocol/sdk@<published> @reserve-protocol/react-sdk@<published>
```

Then keep the provider wiring unchanged and verify Register typecheck against
the published package. **`link:` entries must never be committed** — pin the
released paired versions before merge.

## Permanent Integration Changes

These are not local-link-specific and should stay for production:

- `src/utils/rpc-urls.ts` owns Register's RPC URL lists.
- `src/state/chain/index.tsx` consumes those URL lists for Wagmi transports.
- `src/state/chain/index.tsx` wraps app children in `DtfSdkProvider` and passes the same RPC URLs to the SDK.

The provider config is module-level and stable. Do not rebuild SDK chain config from component render state unless the SDK provider is split so identity changes do not recreate the SDK client.

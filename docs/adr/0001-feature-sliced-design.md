# ADR 0001: Adopt Feature-Sliced Design

## Status

Accepted.

## Context

Donalyze mixes discovery, donation, claim, payout, statistics, and wallet plumbing. The previous
`components/` + `hooks/` layout made dependency direction implicit and encouraged cross-feature
imports.

## Decision

Adopt Feature-Sliced Design with downward imports:

```text
app -> pages -> widgets -> features -> entities -> shared
```

- `app` owns providers, routing, shell and styles.
- `pages` compose one screen each and own page-level state.
- `widgets` are self-contained screen sections.
- `features` are user actions (discover, donate, claim, owner withdraw).
- `entities` own domain reads (artist, donation, contract).
- `shared` owns the UI kit, config, formatting, SEO and RPC helpers.

Slices expose a public `index.ts`. A slice imports another slice through that barrel. Cross-slice
imports stay relative so the architecture can be graphed.

## Consequences

- `src/generated.ts` moves to `src/shared/config/generated.ts`; `wagmi.config.ts` writes there.
- Tests live next to the code as `*.test.ts(x)`; Playwright specs stay in `tests/`.
- Some UI sections remain co-located inside a feature while they are used by one page only; they
  move to a widget when a second page needs them.

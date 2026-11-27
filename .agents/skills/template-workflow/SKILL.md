---
name: template-workflow
description: Use when changing behavior, fixing a bug, or adding a feature in Donalyze. Runs the context, test-first, contract, typecheck, lint, and evidence loop.
---

# Donalyze workflow

## 1. Load context

- Read `AGENTS.md`, `GLOSSARY.md`, and the ADRs in `docs/adr/`.
- For UI work, read `docs/experience-patterns.md` and cite pattern IDs in tests or PR evidence.

## 2. Start with a failing test

- Pure logic or UI state: add a Vitest case next to the code (`*.test.ts` / `*.test.tsx`).
- Browser behavior: add a Playwright spec under `tests/` and run `bun run test:e2e`.
- Contract behavior: add a Foundry test, fuzz case, or invariant before changing `Donate.sol`.

## 3. Implement the smallest change

- Keep imports pointing down: `app -> pages -> widgets -> features -> entities -> shared`.
- Import a slice through its `index.ts`.
- Contract changes require `bun run generate` after deployment address is recorded.
- Never invent a contract address; use `VITE_CONTRACT_ADDRESS` or the deployment JSON.

## 4. Verify

```bash
bun run typecheck
bun run lint
bun run test:unit
bun run test:contract
bun run test:contract:coverage
bun run slither
bun run build
```

UI changes also run `bun run test:e2e`. Use `PLAYWRIGHT_CPU_THROTTLE=85` for recording runs.

## 5. Leave the trail

- Add an ADR for a hard-to-reverse decision.
- Update `GLOSSARY.md` when domain language changes.
- Never lower `config/coverage-floors.json`; add tests and ratchet.

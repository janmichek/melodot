# Experience patterns

Binding checklist for every surface this template ships. Each pattern has a stable ID: cite it in the pull-request evidence, the test name, or the review comment. `src/shared/ui` is the default carrier; a slice may extend the kit but not bypass it.

## Non-negotiables

1. Four states on every surface: empty, loading, partial, error (`META-01`).
2. Every action is acknowledged within 100 ms (`FB-01`); nothing waits silently.
3. Auto-retry only idempotent work; everything else retries by hand (`RETRY-02`).
4. Every error says what happened, why, and what to do next (`ERR-01`).
5. Reversible actions get undo; only irreversible ones get a confirmation (`UNDO-05`).
6. One feedback channel per action type, one word per state across UI, logs, and API (`FB-06`, `META-05`).

## Budgets

| Budget                                      | Value     |
| ------------------------------------------- | --------- |
| Acknowledge input                           | <= 100 ms |
| Delay before showing an indicator           | 150 ms    |
| Spinner ceiling before determinate progress | 1 s       |
| Minimum spinner display once shown          | 400 ms    |
| Progress ceiling before backgrounding       | 10 s      |
| Confirmation window (second activation)     | 3 s       |
| Undo window                                 | 5-10 s    |
| Relative timestamp cutoff                   | 14 days   |

## Lifecycles

Mutation:

```text
idle -> pending -> success
                -> recoverable error (network, timeout, 5xx)
                -> terminal error (validation, auth, permission)
```

Invariant: every mutation ends in success or an explicit error; pending is never terminal.

Connection:

```text
online -> degraded -> offline -> reconnecting -> online
```

Invariant: local state is never discarded; queued mutations replay exactly once.

## Pending states

| ID        | Rule                                                                                                                                                                                                                                                             | Done when                                                             |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `PEND-01` | Latency tiers: under 100 ms no indicator; 100 ms-1 s inline spinner, rendered after the `PEND-05` delay; over 1 s determinate progress; over 10 s background job plus status tray. Never a blocking modal for a sub-second operation, never silence past 200 ms. | Rendered tier matches elapsed time.                                   |
| `PEND-02` | Button morph: the pressed control becomes the inline spinner in place. No layout shift, no duplicate loading row.                                                                                                                                                | Trigger control shows its own state and layout holds.                 |
| `PEND-03` | Optimistic UI: render the expected result immediately, reconcile on response, roll back with a visible diff on failure.                                                                                                                                          | Result appears instantly; a failure leaves a visible rollback notice. |
| `PEND-04` | Skeletons for content loads; spinners only for actions.                                                                                                                                                                                                          | No content surface shows a bare spinner as its only state.            |
| `PEND-05` | Flicker guard: delay the indicator 150 ms, then hold it at least 400 ms.                                                                                                                                                                                         | No flash under 150 ms, no flicker between 150-400 ms.                 |
| `PEND-06` | Queued work shows a count badge; the rest of the UI stays interactive.                                                                                                                                                                                           | Running work is countable and nothing is globally blocked.            |
| `PEND-07` | Resource-level state: the row says `Saving…` / `Saved 2s ago` inline, never only in a distant toast. Timestamps follow `TS-01`.                                                                                                                                  | The row reflects its own mutation state.                              |

## Safe retries

| ID         | Rule                                                                                      | Done when                                                |
| ---------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `RETRY-01` | Every mutating request carries a unique idempotency key; the server dedupes by it.        | Replaying the same key yields a single effect.           |
| `RETRY-02` | Auto-retry only idempotent or safe operations; everything else waits for the user.        | No auto-retry fires on non-idempotent work.              |
| `RETRY-03` | Exponential backoff with jitter and a capped budget.                                      | Spacing is monotonic until the cap; no thundering herd.  |
| `RETRY-04` | Persist actions offline, replay on reconnect, and say `Will sync when online`.            | An offline mutation survives an app restart.             |
| `RETRY-05` | Long operations chunk and checkpoint; offer an explicit Resume.                           | Interruption resumes from the checkpoint, not from zero. |
| `RETRY-06` | After the budget is exhausted, show a Retry action and keep the original payload.         | Retry reuses the payload with no re-entry.               |
| `RETRY-07` | Disable resubmit while pending and collapse identical in-flight calls.                    | Exactly one request in flight per logical action.        |
| `RETRY-08` | Exhausted retries land in the activity log with a retry action; never drop them silently. | Zero silent failures.                                    |

## Feedback on every action

| ID      | Rule                                                                                    | Done when                                                |
| ------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `FB-01` | Acknowledge every action within 100 ms via press state or an optimistic change.         | No silent interval exceeds 100 ms.                       |
| `FB-02` | Confirm in the object's context; use a toast only when the context leaves the viewport. | Confirmation sits next to the affected object.           |
| `FB-03` | Every mutation ends in exactly one of success, recoverable error, or explicit pending.  | No ambiguous terminal state.                             |
| `FB-04` | Background work and undo history are recorded in a visible activity log.                | Any async job is traceable by the user.                  |
| `FB-05` | Distinguish accepted (202) from done (200) in the copy.                                 | Copy matches the HTTP semantics.                         |
| `FB-06` | One feedback channel per action type across the app.                                    | No arbitrary switching between toast, banner, and modal. |

## Errors with a next step

Copy formula: what happened, why in plain language, what to do, one-click action.

> Couldn't save the car. The connection dropped. Retry - your edits are kept.

| ID       | Rule                                                                                                                                  | Done when                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `ERR-01` | Every message carries the four parts and a CTA.                                                                                       | Every error parses into the four parts; a CTA is present. |
| `ERR-02` | Preserve fields, selections, and scroll position on error; never clear the form.                                                      | Post-error state equals pre-error state plus the message. |
| `ERR-03` | Field errors inline; page-level errors only for page-level failures.                                                                  | Error proximity matches error scope.                      |
| `ERR-04` | Classify by the taxonomy and route to its CTA.                                                                                        | Rendered CTA matches the error class.                     |
| `ERR-05` | A request id is copyable under details, never in the headline.                                                                        | The id is retrievable; the headline stays clean.          |
| `ERR-06` | Never blame, jargon, or error codes in the primary text.                                                                              | Copy lint passes.                                         |
| `ERR-07` | Error pages for 404, 500, and offline follow `ERR-01`, offer at least one CTA (home, retry, status), and always have an escape route. | Every error page has a CTA and no dead end.               |
| `ERR-08` | No full-page takeover for recoverable inline errors.                                                                                  | Recoverable failures stay in context.                     |

Taxonomy:

| Class      | CTA            | Auto-retry |
| ---------- | -------------- | ---------- |
| network    | retry          | yes        |
| timeout    | retry          | yes        |
| server     | retry + report | yes        |
| validation | edit           | no         |
| auth       | re-auth        | no         |
| permission | request access | no         |

## Undo and confirmation

| ID           | Rule                                                                                                                                                                                                                                                                                                     | Done when                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `UNDO-01`    | Reversible actions show Undo for 5-10 s.                                                                                                                                                                                                                                                                 | Undo is available in the window and reverts fully.                      |
| `UNDO-02`    | Delete moves to trash; purge only after the retention window.                                                                                                                                                                                                                                            | Restore is possible within the window.                                  |
| `UNDO-03`    | Editor surfaces keep an undo/redo stack with keyboard parity.                                                                                                                                                                                                                                            | Every committed edit is reversible.                                     |
| `UNDO-04`    | Bulk and content edits create restore points.                                                                                                                                                                                                                                                            | The previous version is restorable.                                     |
| `UNDO-05`    | A confirm dialog appears only for irreversible actions; reversible deletes use undo instead.                                                                                                                                                                                                             | Zero confirm dialogs for reversible operations.                         |
| `UNDO-06`    | A failed optimistic mutation emits a rollback notification.                                                                                                                                                                                                                                              | The user is told about the revert.                                      |
| `UNDO-07`    | Undo copy names the action and the target: `Undid <action> <target>`.                                                                                                                                                                                                                                    | Copy matches the pattern.                                               |
| `CONFIRM-01` | In-place destructive buttons use double activation: the first press arms the control and swaps the label to `Confirm delete?`, the second press within 3 s executes, and the label reverts on timeout. Keyboard parity via double Enter or Space; a modal is reserved for high-stakes irreversible work. | A single activation never executes; the armed state reverts on timeout. |

## Timestamps

| ID      | Rule                                                                                                                                                                                                                  | Done when                                                                           |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `TS-01` | Relative time under 14 days (`2s ago`, `5m ago`, `3h ago`, `6d ago`), absolute date from 14 days. Click toggles the format, the tooltip always shows the absolute value, and the preference persists for the session. | The boundary flips exactly at 14 days; the toggle round-trips without layout break. |

## Connectivity

| ID       | Rule                                                                                                                                                                                                                                                                                                                                                                                | Done when                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `NET-01` | Detect a drop via heartbeat, socket, or visibility. Show a non-blocking `Reconnecting…` banner with a retry countdown, queue mutations, disable only server-truth-dependent actions with a stated reason, reconnect with backoff, then reconcile and notify the synced count. Preserve forms and scroll. Never a full-screen takeover for a transient drop, never silent data loss. | Local state survives the drop; queued work replays or surfaces per-operation errors. |

## Cross-cutting

| ID        | Rule                                                                             | Done when                                        |
| --------- | -------------------------------------------------------------------------------- | ------------------------------------------------ |
| `META-01` | Every surface defines empty, loading, partial, and error.                        | All four are designed and implemented.           |
| `META-02` | The server owns entity state; the client adds a pending overlay only.            | No contradictory indicators.                     |
| `META-03` | Track pending duration, retry rate, error class, and undo usage.                 | A dashboard exists per metric.                   |
| `META-04` | Cancel is available during pending and aborts the request, not just the spinner. | Cancelled work stops server-side where possible. |
| `META-05` | One word per state across UI, logs, and API: Save is not Update is not Commit.   | The glossary is enforced in review.              |

## Testing the patterns

- Vitest: pure logic for latency tiers (`PEND-01`), timestamp formatting (`TS-01`), confirmation arming (`CONFIRM-01`), retry classification (`RETRY-02`).
- Playwright: every UI feature proves its pending, error, and undo paths. `bun run test:e2e` is part of the finish line for UI changes.
- Pull request: evidence cites the pattern IDs it covers.

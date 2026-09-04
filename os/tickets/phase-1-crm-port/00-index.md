# Phase 1 — CRM port · ticket set

Source spec: `os/specs/0001-phase-1-crm-port.md`. Tracer-bullet vertical slices,
numbered in dependency order (blockers first). Published locally per ADR 0001.

## Dependency graph

```
01 scaffold+deploy
├─ 02 password gate
│  └─ 03 schema + data module + clients list (read)
│     ├─ 04 seed script
│     ├─ 05 client record CRUD
│     │  ├─ 06 phase tracker + side-effects
│     │  │  ├─ 08 events timeline + ascension signals   (also ← 05)
│     │  │  │  └─ 10 bridge-gate checklist              (also ← 06)
│     │  │  └─ 09 conversion board + in-build strip
│     │  │     └─ 11 dashboard nags                     (also ← 07, 08)
│     │  ├─ 07 contact window + local clock             (also ← 03)
│     │  └─ 12 todos                                    (also ← 03)
│     └─ 13 groups
└─ 14 stub pages
15 visual parity pass  ← 05, 09, 12, 13
```

## Frontier at start

`01` only. Work any ticket whose blockers are all done.

## Status legend

`ready-for-agent` — grabbable by construction. Do not start a ticket whose
blockers are open.

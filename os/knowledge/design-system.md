# Design System — dispatch console / job-ticket aesthetic

Canonical. Source: `_source/CLAUDE.md` ("Design system"). The direction is a
**dispatch console / job-ticket** look — deliberately not a generic SaaS
dashboard. The clients are hauling and dispatch businesses, so the tool borrows
that world's vernacular (manifests, stamps, work orders).

**Do not restyle during the React port.** Compare rendered output side by side
against `_source/outreach-os.html`.

## Color tokens

| Token | Hex | Use |
|---|---|---|
| `--rail-bg` | `#1D1B17` | Sidebar background (dark ink) |
| `--rail-line` | `rgba(255,255,255,0.08)` | Hairlines inside sidebar |
| `--rail-text` | `#B7AF9B` | Inactive sidebar nav text |
| `--rail-text-active` | `#F5F1E6` | Active/hover sidebar nav text |
| `--rail-active-bg` | `rgba(225,83,33,0.18)` | Active nav item background |
| `--paper` | `#F1ECDF` | Main canvas background (warm kraft) |
| `--paper-hover` | `#E7DFC7` | Hover on paper-toned elements |
| `--card` | `#FFFDF8` | Card / panel background |
| `--ink` | `#211D17` | Primary text |
| `--ink-soft` | `#6E6656` | Secondary text |
| `--ink-faint` | `#A79E89` | Tertiary text / captions |
| `--line` | `#DED2B8` | Standard hairline borders |
| `--line-strong` | `#C7B896` | Emphasized borders |
| `--accent` | `#E15321` | Primary accent — safety orange |
| `--accent-hover` | `#C4441A` | Accent hover |
| `--accent-soft` | `#FBE1CF` | Accent tint |
| `--good` | `#2F6B3D` | Active / posted |
| `--warn` | `#B4740E` | Pending |
| `--bad` | `#B23A2E` | Flagged |
| `--info` | `#2A5C8A` | Scheduled |

**Do not** reach for the AI-generic cream + terracotta combo (`#F4F1EA` +
`~#D97757`) — overused default. This palette uses higher-chroma safety orange
and pairs warm paper against a dark ink rail for contrast, not a second neutral.

In Tailwind, expose these as CSS custom properties in the theme layer, don't
hardcode hexes in components. **Do not install shadcn/ui defaults** — its
visual language is the opposite of this one. Port `.stamp`, `pageHeader()`,
`.panel`, and the button set by hand.

## Typography — three roles, used deliberately

- **Display** (`--font-display`): `'Barlow Condensed', 'Arial Narrow',
  sans-serif`. Bold condensed, uppercase, tight tracking. Page titles, panel
  and modal headers, section headers only. Reads like warehouse signage.
- **Body** (`--font-body`): `'Inter', -apple-system, …`. All prose, form
  inputs, task and post content, list rows. Never headers.
- **Mono** (`--font-mono`): `'JetBrains Mono', …`. Every label, caption, status
  stamp, table header, stat number, and the "Form No." ticket metadata. This is
  what creates the manifest feel — it touches anything that is a value, label,
  or system-generated marker, never free-form prose.

Keep the three-way split when adding UI. Body font never creeps into headers;
display is never used for non-headings.

## Signature components

**Status stamps** (`.stamp` + modifier): bordered, rotated −1deg, monospace,
uppercase — not soft filled pills. The recurring motif. Reuse it for any new
status-like value rather than inventing a badge style.

```css
.stamp {
  font-family: var(--font-mono); font-size: 10.5px; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase;
  padding: 3px 8px; border: 1.4px solid currentColor; border-radius: 3px;
  background: rgba(255,255,255,0.55); transform: rotate(-1deg);
}
```

**Ticket page headers** (`pageHeader(formNo, title, sub)`): every page opens
with a "Form No. 0XX · [date]" eyebrow, a large uppercase condensed title, a
double hairline rule, and a subtitle. Any new page uses this component, not a
bespoke header.

**Nav structure:** grouped `Overview` / `Workflow` (numbered 01–06 — Clients →
Groups → Creator → Schedule → Library → Todo, a genuine operational sequence) /
`Reference`. If adding a page, decide honestly whether it belongs in the
numbered sequence. Don't number things that aren't sequential.

**Icons:** hand-drawn inline SVG line icons, 20×20 viewBox, 1.6 stroke-width,
`stroke="currentColor"`, no fill. **No emoji anywhere in the UI** — deliberate
cleanup. New icons stay in the same minimal line-art style.

## Spacing & shape

- Radius: `--radius-sm: 4px` (buttons, inputs, badges), `--radius-md: 6px`
  (cards, panels, modals). Small and consistent, not pill-rounded.
- Shadows minimal: `--shadow-card: 0 1px 2px rgba(33,29,23,0.07)`. A hairline
  lift, not a glow.
- Background texture: faint dot grid,
  `radial-gradient(circle, rgba(33,29,23,0.06) 1px, transparent 1px)` at 15px.
  Reads as tooth, not pattern.

## Conventions for extending

- New pages: a route, a nav entry, a component following the existing pattern,
  always opening with the `PageHeader` component.
- New status-like fields: reuse `.stamp` with a new color-mapped modifier,
  don't invent a badge component.
- All user-entered text escaped before render. Every existing render path does
  this; don't skip it for new fields.
- Toasts for any save/delete confirmation; a custom confirm modal for
  destructive actions. Avoid native `confirm()`/`alert()` — unreliable in
  sandboxed iframes, deliberately avoided in the prototype.
- Secrets in env vars only. Never an API key in client-side code, never a key
  committed.

## Hot-path checklist (for UI work / the React port)

- [ ] Palette is the tokens above — not cream + terracotta.
- [ ] Three font roles kept distinct (display=headings, body=prose,
      mono=values/labels).
- [ ] Status values use `.stamp`, not pills or a new badge.
- [ ] Page opens with `PageHeader` / `pageHeader()`.
- [ ] Icons are 20×20, 1.6 stroke, currentColor, no fill. No emoji.
- [ ] Rendered output compared side-by-side with `_source/outreach-os.html`,
      not eyeballed.
- [ ] No shadcn/ui defaults installed.

## Reconciliation notes

None — this section of `_source/CLAUDE.md` has no competing source.

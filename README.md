# igaming-admin-prototype

Clickable UI prototype for the iGaming platform's unified Campaign 後台 (covers both in-app and outbound messaging product specs).

**Live demo:** https://clementinetseng.github.io/igaming-admin-prototype/

## Audience

- **PH operations / CS team** — user testing the messaging admin flow
- **TW RD** — handoff reference for production implementation

## Stack

Vite · React 19 · TypeScript (strict) · Tailwind · shadcn/ui · react-i18next · react-router (HashRouter) · Vitest

## Develop

```bash
npm install
npm run dev      # http://localhost:5173/igaming-admin-prototype/
npm run test     # watch mode
npm run test:run # CI mode
npm run build
```

## Languages

EN (default) and zh-TW. Switch via the top-right dropdown; choice persists in localStorage.

## Mock data

All data is in-memory and reset on refresh:
- 16 campaigns covering all status × channel combinations (`src/mock/campaigns.ts`)
- ~120 mock players with PH-realistic distribution (`src/mock/players.ts`)
- 4 ops accounts (`src/mock/ops.ts`)

## Demo states

Append `?error=1` to any URL to surface an error state for the campaign list (RD handoff aid).

## Source product specs

- [In-app messaging design](../igaming-product-specs/docs/specs/2026-04-24-in-app-messaging-design.md) (private)
- [Outbound messaging design](../igaming-product-specs/docs/specs/2026-04-29-outbound-messaging-design.md) (private)

## Prototype design spec

`docs/superpowers/specs/2026-04-30-admin-prototype-design.md`

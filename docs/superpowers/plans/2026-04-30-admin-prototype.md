# iGaming Admin Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a clickable, i18n-ready UI prototype of the unified Campaign 後台 (covering both in-app and outbound messaging product specs), deployable to GitHub Pages on push to `main`.

**Architecture:** Single-page React 18 app, client-only (mock data in-memory). Vite bundler, HashRouter for GH Pages compatibility, shadcn/ui + Tailwind for visuals, react-i18next for EN/zh-TW switching, react-hook-form + zod for validation. No backend.

**Tech Stack:** Vite 5, React 18, TypeScript (strict), Tailwind CSS 3, shadcn/ui, react-router 6 (HashRouter), react-i18next, react-hook-form, zod, date-fns, lucide-react, Vitest + React Testing Library.

**Spec:** `docs/superpowers/specs/2026-04-30-admin-prototype-design.md`

---

## File Structure

```
src/
├─ main.tsx                       # entry; mounts <App/>
├─ App.tsx                        # i18n provider, theme, router
├─ router.tsx                     # HashRouter routes
│
├─ pages/campaigns/
│  ├─ CampaignList.tsx            # /campaigns
│  ├─ CampaignForm.tsx            # /campaigns/new + /campaigns/:id/edit
│  └─ CampaignDetail.tsx          # /campaigns/:id
├─ pages/NotFound.tsx
│
├─ components/
│  ├─ ui/                         # shadcn components (generated)
│  ├─ shell/
│  │  ├─ AppLayout.tsx
│  │  ├─ Sidebar.tsx
│  │  ├─ Topbar.tsx
│  │  └─ LangSwitcher.tsx
│  ├─ campaign/
│  │  ├─ AudienceBuilder.tsx
│  │  ├─ ChannelPanelInApp.tsx
│  │  ├─ ChannelPanelEmail.tsx
│  │  ├─ ChannelPanelSMS.tsx
│  │  ├─ ChannelPanelPush.tsx
│  │  ├─ ScheduleSection.tsx
│  │  ├─ ScheduleConfirmDialog.tsx
│  │  ├─ TestSendDialog.tsx
│  │  ├─ ToggleConfirmDialog.tsx
│  │  ├─ CampaignFilters.tsx
│  │  └─ CampaignTable.tsx
│  └─ common/
│     ├─ StatusBadge.tsx
│     ├─ ChannelIcons.tsx
│     ├─ EmptyState.tsx
│     ├─ LoadingSkeleton.tsx
│     └─ AuditLogStubDialog.tsx
│
├─ mock/
│  ├─ campaigns.ts                # 16 seed campaigns
│  ├─ players.ts                  # ~120 players
│  └─ ops.ts                      # 4 ops accounts
│
├─ store/
│  └─ campaigns.ts                # in-memory CRUD over mock data
│
├─ lib/
│  ├─ date.ts                     # PH timezone date-fns wrappers
│  ├─ number.ts                   # PHP currency formatter
│  └─ audience.ts                 # estimate recipients from conditions
│
├─ types/
│  ├─ campaign.ts
│  ├─ player.ts
│  └─ audience.ts
│
├─ i18n/
│  ├─ index.ts                    # react-i18next config
│  ├─ en.json
│  └─ zh-TW.json
│
└─ test/
   └─ setup.ts                    # Vitest globals + RTL
```

---

## Task 1: Initialize Vite + React + TS project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`

- [ ] **Step 1: Scaffold project**

Run from prototype repo root:
```bash
npm create vite@latest . -- --template react-ts
```
When prompted to overwrite `README.md`, choose **No** (keep existing). Choose **Yes** for any other files.

- [ ] **Step 2: Install base deps**

```bash
npm install
```

- [ ] **Step 3: Configure Vite base path for GH Pages**

Replace `vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  base: '/igaming-admin-prototype/',
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: { port: 5173 },
})
```

- [ ] **Step 4: Enable strict TypeScript**

Replace `tsconfig.json` (or add to existing `compilerOptions`):
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 5: Verify dev server runs**

Run: `npm run dev`
Expected: Server starts on `http://localhost:5173/igaming-admin-prototype/` and default Vite + React page loads. Stop server (Ctrl+C).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TS project"
```

---

## Task 2: Install Tailwind CSS + shadcn/ui base

**Files:**
- Create: `tailwind.config.ts`, `postcss.config.js`, `src/index.css`, `components.json`
- Modify: `src/main.tsx`

- [ ] **Step 1: Install Tailwind**

```bash
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Step 2: Configure Tailwind**

Replace `tailwind.config.js` with `tailwind.config.ts`:
```ts
import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '2rem', screens: { '2xl': '1280px' } },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
      },
      borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
      fontFamily: {
        sans: ['Inter', '"Noto Sans TC"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config
```

Delete the old `tailwind.config.js`.

- [ ] **Step 3: Replace `src/index.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 234 89% 58%;            /* indigo-600 */
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 234 89% 58%;
    --radius: 0.5rem;
  }
  body { @apply bg-background text-foreground antialiased; font-family: theme('fontFamily.sans'); }
}
```

- [ ] **Step 4: Install shadcn deps and init**

```bash
npm install -D tailwindcss-animate class-variance-authority clsx tailwind-merge
npm install lucide-react
```

Create `src/lib/utils.ts`:
```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Create `components.json`:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

- [ ] **Step 5: Add core shadcn components**

```bash
npx shadcn@latest add button card input label select dialog sheet tabs badge progress dropdown-menu sonner skeleton alert separator checkbox radio-group textarea form popover calendar
```
(If interactive prompts appear, accept defaults.)

- [ ] **Step 6: Replace App.tsx with hello-world Tailwind sanity check**

```tsx
import { Button } from '@/components/ui/button'

export default function App() {
  return (
    <main className="container py-12">
      <h1 className="text-3xl font-semibold mb-4">Admin Console</h1>
      <p className="text-muted-foreground mb-6">Tailwind + shadcn ready.</p>
      <Button>Test Button</Button>
    </main>
  )
}
```

- [ ] **Step 7: Verify**

Run: `npm run dev`
Open `http://localhost:5173/igaming-admin-prototype/` — page should show heading + working shadcn button. Stop server.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: configure Tailwind + shadcn/ui base"
```

---

## Task 3: Set up Vitest + React Testing Library

**Files:**
- Create: `vitest.config.ts`, `src/test/setup.ts`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Install test deps**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @types/node
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
```

- [ ] **Step 3: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 4: Add scripts to `package.json`**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

- [ ] **Step 5: Smoke test**

Create `src/lib/utils.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })
  it('dedupes conflicting tailwind classes', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })
})
```

- [ ] **Step 6: Run test**

Run: `npm run test:run`
Expected: 2 tests pass.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: configure Vitest + RTL"
```

---

## Task 4: GitHub Actions deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create workflow**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:run
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit and push**

```bash
git add -A
git commit -m "ci: add GitHub Pages deploy workflow"
git push origin main
```

- [ ] **Step 3: Enable GH Pages source**

Manual one-time step (user action):
1. Go to GitHub repo → Settings → Pages
2. Under **Source**, select **GitHub Actions**
3. Wait for the workflow run to complete (Actions tab)
4. Verify `https://<user>.github.io/igaming-admin-prototype/` loads the hello world page

- [ ] **Step 4: Confirm deploy is live**

If workflow failed, fix and recommit. If green, mark task done.

---

## Task 5: Define core types

**Files:**
- Create: `src/types/audience.ts`, `src/types/player.ts`, `src/types/campaign.ts`

- [ ] **Step 1: Create `src/types/audience.ts`**

```ts
export type VipTier = 1 | 2 | 3 | 4 | 5 | 6 | 7
export type PlayerStatus = 'active' | 'dormant' | 'churned'
export type FirstDeposit = 'yes' | 'no'
export type CumulativeDepositBand = '0-100' | '100-1000' | '1000-5000' | '5000+'
export type VerifiedContact = 'email' | 'phone' | 'both'

export type AudienceCondition =
  | { field: 'vipTier'; op: '>=' | '<=' | '='; value: VipTier }
  | { field: 'playerStatus'; value: PlayerStatus }
  | { field: 'firstDeposit'; value: FirstDeposit }
  | { field: 'registrationDays'; op: '<=' | '>='; value: number }
  | { field: 'cumulativeDeposit'; value: CumulativeDepositBand }
  | { field: 'verifiedContact'; value: VerifiedContact }

export type AudienceConditionField = AudienceCondition['field']

export type MasterAudience = {
  broadcast: boolean
  conditions: AudienceCondition[]
  logic: 'AND' | 'OR'
}
```

- [ ] **Step 2: Create `src/types/player.ts`**

```ts
import type { VipTier, PlayerStatus, CumulativeDepositBand } from './audience'

export type Carrier = 'globe' | 'smart'

export type Player = {
  id: string
  username: string
  email: string
  emailVerified: boolean
  phone: string                 // +63 9XX XXX XXXX
  phoneVerified: boolean
  carrier: Carrier
  vipTier: VipTier
  status: PlayerStatus
  firstDeposit: boolean
  cumulativeDeposit: CumulativeDepositBand
  registrationDate: string      // ISO
  kycStatus: 'pending' | 'approved' | 'rejected'
  twoFactorEnabled: boolean
  pushSubscribed: boolean
}
```

- [ ] **Step 3: Create `src/types/campaign.ts`**

```ts
import type { AudienceCondition, MasterAudience } from './audience'

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'disabled'
export type ChannelKey = 'inApp' | 'email' | 'sms' | 'push'
export type InAppCategory = 'personal' | 'promo' | 'announcement'
export type EmailSender = 'noreply' | 'promo' | 'vip'

export type InAppPanel = {
  enabled: boolean
  title: string
  category: InAppCategory
  bodyRich: string
  cta?: { label: string; url: string }
  triggerToast: boolean
  audienceFilter?: AudienceCondition[]
}
export type EmailPanel = {
  enabled: boolean
  subject: string
  preheader: string
  htmlBody: string
  senderFrom: EmailSender
  audienceFilter?: AudienceCondition[]
}
export type SmsPanel = {
  enabled: boolean
  body: string
  senderId: string
  audienceFilter?: AudienceCondition[]
}
export type PushPanel = {
  enabled: boolean
  title: string
  body: string
  ctaUrl: string
  audienceFilter?: AudienceCondition[]
}

export type ChannelPanels = {
  inApp?: InAppPanel
  email?: EmailPanel
  sms?: SmsPanel
  push?: PushPanel
}

export type Schedule = {
  type: 'immediate' | 'datetime'
  at?: string                                              // ISO
  perPanelOverrides?: Partial<Record<ChannelKey, string>>
}

export type SendingProgress = {
  perChannel: Partial<Record<ChannelKey, { sent: number; total: number; lastUpdate: string }>>
}

export type Exclusions = {
  optOut: number
  frequencyCap: number
  suppression: number
  unverifiedContact: number
}

export type Campaign = {
  id: string
  name: string
  tags: string[]
  status: CampaignStatus
  masterAudience: MasterAudience
  estimatedRecipients: number
  channelPanels: ChannelPanels
  schedule: Schedule
  ignoreQuietHours: boolean
  sendingProgress?: SendingProgress
  exclusions?: Exclusions
  createdBy: string                                        // ops username
  createdAt: string
  updatedAt: string
}
```

- [ ] **Step 4: Type check**

Run: `npm run build`
Expected: tsc passes (no emit). If errors, fix imports.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: define Campaign / Player / Audience types"
```

---

## Task 6: Mock ops accounts

**Files:**
- Create: `src/mock/ops.ts`

- [ ] **Step 1: Create file**

```ts
export type OpsAccount = {
  id: string
  username: string
  email: string
}

export const opsAccounts: OpsAccount[] = [
  { id: 'op_anna', username: 'Anna Rivera', email: 'ops_anna@brand.ph' },
  { id: 'op_marco', username: 'Marco Santos', email: 'ops_marco@brand.ph' },
  { id: 'op_lisa', username: 'Lisa Cruz', email: 'ops_lisa@brand.ph' },
  { id: 'op_juan', username: 'Juan Reyes', email: 'ops_juan@brand.ph' },
]

export const currentUser = opsAccounts[0]
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add mock ops accounts"
```

---

## Task 7: Mock player pool generator

**Files:**
- Create: `src/mock/players.ts`, `src/mock/players.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// src/mock/players.test.ts
import { describe, it, expect } from 'vitest'
import { players } from './players'

describe('mock players', () => {
  it('has roughly 120 players', () => {
    expect(players.length).toBeGreaterThanOrEqual(110)
    expect(players.length).toBeLessThanOrEqual(130)
  })
  it('all have +63 9XX phone format', () => {
    for (const p of players) expect(p.phone).toMatch(/^\+63 9\d{2} \d{3} \d{4}$/)
  })
  it('has each VIP tier 1-7 represented', () => {
    const tiers = new Set(players.map((p) => p.vipTier))
    for (let t = 1; t <= 7; t++) expect(tiers.has(t as 1)).toBe(true)
  })
  it('has each player status represented', () => {
    const statuses = new Set(players.map((p) => p.status))
    expect(statuses.has('active')).toBe(true)
    expect(statuses.has('dormant')).toBe(true)
    expect(statuses.has('churned')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test (should fail — file doesn't exist)**

Run: `npm run test:run -- players`
Expected: FAIL.

- [ ] **Step 3: Implement `src/mock/players.ts`**

```ts
import type { Player, Carrier } from '@/types/player'
import type { VipTier, PlayerStatus, CumulativeDepositBand } from '@/types/audience'

// Globe prefixes (PH carrier mapping); rest go to Smart for mock purposes
const GLOBE_PREFIXES = ['905','906','915','916','917','926','927','935','936','937','945','955','956','965','966','967','975','976','977','995','996','997']

function seededRand(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}
const rng = seededRand(42)

function pickWeighted<T>(items: { value: T; weight: number }[]): T {
  const total = items.reduce((a, b) => a + b.weight, 0)
  let r = rng() * total
  for (const it of items) {
    r -= it.weight
    if (r <= 0) return it.value
  }
  return items[0].value
}

function makePlayer(i: number): Player {
  const vipTier = pickWeighted<VipTier>([
    { value: 1, weight: 30 }, { value: 2, weight: 25 }, { value: 3, weight: 18 },
    { value: 4, weight: 12 }, { value: 5, weight: 8 },  { value: 6, weight: 5 },
    { value: 7, weight: 2 },
  ])
  const status = pickWeighted<PlayerStatus>([
    { value: 'active', weight: 60 }, { value: 'dormant', weight: 30 }, { value: 'churned', weight: 10 },
  ])
  const cumulativeDeposit = pickWeighted<CumulativeDepositBand>([
    { value: '0-100', weight: 30 }, { value: '100-1000', weight: 35 },
    { value: '1000-5000', weight: 25 }, { value: '5000+', weight: 10 },
  ])
  const emailVerified = rng() < 0.7
  const phoneVerified = rng() < 0.8
  const prefix = rng() < 0.6 ? GLOBE_PREFIXES[Math.floor(rng() * GLOBE_PREFIXES.length)] : '907'
  const carrier: Carrier = GLOBE_PREFIXES.includes(prefix) ? 'globe' : 'smart'
  const phone = `+63 9${prefix.slice(1)} ${String(Math.floor(rng() * 1000)).padStart(3,'0')} ${String(Math.floor(rng() * 10000)).padStart(4,'0')}`
  const daysAgo = Math.floor(rng() * 540) + 1
  const regDate = new Date(Date.now() - daysAgo * 86400000).toISOString()

  const id = `usr_${String(i).padStart(4, '0')}`
  return {
    id,
    username: `player${i}`,
    email: `player${i}@${rng() < 0.5 ? 'gmail.com' : 'yahoo.com'}`,
    emailVerified,
    phone,
    phoneVerified,
    carrier,
    vipTier,
    status,
    firstDeposit: rng() < 0.65,
    cumulativeDeposit,
    registrationDate: regDate,
    kycStatus: pickWeighted<'pending'|'approved'|'rejected'>([
      { value: 'approved', weight: 75 },
      { value: 'pending', weight: 15 },
      { value: 'rejected', weight: 10 },
    ]),
    twoFactorEnabled: rng() < 0.4,
    pushSubscribed: rng() < 0.5,
  }
}

export const players: Player[] = Array.from({ length: 120 }, (_, i) => makePlayer(i + 1))
```

- [ ] **Step 4: Run tests**

Run: `npm run test:run -- players`
Expected: 4 tests pass. If a test fails, adjust seed or weights.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add mock player pool with PH-realistic distribution"
```

---

## Task 8: `lib/audience.ts` — estimate recipients

**Files:**
- Create: `src/lib/audience.ts`, `src/lib/audience.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/audience.test.ts
import { describe, it, expect } from 'vitest'
import { estimateRecipients, matchesCondition } from './audience'
import { players } from '@/mock/players'
import type { AudienceCondition, MasterAudience } from '@/types/audience'
import type { Player } from '@/types/player'

const sample: Player = {
  ...players[0],
  vipTier: 5,
  status: 'active',
  firstDeposit: true,
  emailVerified: true,
  phoneVerified: true,
  cumulativeDeposit: '1000-5000',
}

describe('matchesCondition', () => {
  it('vipTier >=', () => {
    expect(matchesCondition(sample, { field: 'vipTier', op: '>=', value: 3 })).toBe(true)
    expect(matchesCondition(sample, { field: 'vipTier', op: '>=', value: 6 })).toBe(false)
  })
  it('playerStatus equality', () => {
    expect(matchesCondition(sample, { field: 'playerStatus', value: 'active' })).toBe(true)
    expect(matchesCondition(sample, { field: 'playerStatus', value: 'churned' })).toBe(false)
  })
  it('verifiedContact email', () => {
    expect(matchesCondition(sample, { field: 'verifiedContact', value: 'email' })).toBe(true)
  })
})

describe('estimateRecipients', () => {
  it('broadcast returns full pool', () => {
    const ma: MasterAudience = { broadcast: true, conditions: [], logic: 'AND' }
    expect(estimateRecipients(ma, players)).toBe(players.length)
  })
  it('AND filters intersect', () => {
    const ma: MasterAudience = {
      broadcast: false, logic: 'AND',
      conditions: [
        { field: 'vipTier', op: '>=', value: 3 },
        { field: 'playerStatus', value: 'active' },
      ],
    }
    const n = estimateRecipients(ma, players)
    const expected = players.filter(p => p.vipTier >= 3 && p.status === 'active').length
    expect(n).toBe(expected)
  })
  it('OR filters union', () => {
    const ma: MasterAudience = {
      broadcast: false, logic: 'OR',
      conditions: [
        { field: 'playerStatus', value: 'dormant' },
        { field: 'playerStatus', value: 'churned' },
      ],
    }
    const n = estimateRecipients(ma, players)
    const expected = players.filter(p => p.status === 'dormant' || p.status === 'churned').length
    expect(n).toBe(expected)
  })
  it('empty conditions + not broadcast = 0', () => {
    const ma: MasterAudience = { broadcast: false, conditions: [], logic: 'AND' }
    expect(estimateRecipients(ma, players)).toBe(0)
  })
})
```

- [ ] **Step 2: Run — should fail (no file)**

Run: `npm run test:run -- audience`
Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/audience.ts`**

```ts
import type { AudienceCondition, MasterAudience } from '@/types/audience'
import type { Player } from '@/types/player'

export function matchesCondition(player: Player, c: AudienceCondition): boolean {
  switch (c.field) {
    case 'vipTier': {
      if (c.op === '>=') return player.vipTier >= c.value
      if (c.op === '<=') return player.vipTier <= c.value
      return player.vipTier === c.value
    }
    case 'playerStatus':
      return player.status === c.value
    case 'firstDeposit':
      return (c.value === 'yes') === player.firstDeposit
    case 'registrationDays': {
      const daysSince = Math.floor(
        (Date.now() - new Date(player.registrationDate).getTime()) / 86400000
      )
      return c.op === '<=' ? daysSince <= c.value : daysSince >= c.value
    }
    case 'cumulativeDeposit':
      return player.cumulativeDeposit === c.value
    case 'verifiedContact':
      if (c.value === 'email') return player.emailVerified
      if (c.value === 'phone') return player.phoneVerified
      return player.emailVerified && player.phoneVerified
  }
}

export function estimateRecipients(ma: MasterAudience, pool: Player[]): number {
  if (ma.broadcast) return pool.length
  if (ma.conditions.length === 0) return 0
  return pool.filter((p) => {
    if (ma.logic === 'AND') return ma.conditions.every((c) => matchesCondition(p, c))
    return ma.conditions.some((c) => matchesCondition(p, c))
  }).length
}
```

- [ ] **Step 4: Run tests**

Run: `npm run test:run -- audience`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add audience estimator with condition matching"
```

---

## Task 9: `lib/date.ts` — PH timezone formatting

**Files:**
- Create: `src/lib/date.ts`, `src/lib/date.test.ts`

- [ ] **Step 1: Install date-fns**

```bash
npm install date-fns@3 date-fns-tz@3
```

- [ ] **Step 2: Write failing tests**

```ts
// src/lib/date.test.ts
import { describe, it, expect } from 'vitest'
import { formatDateTimePHT, formatDatePHT, formatRelativePHT } from './date'

describe('formatDateTimePHT', () => {
  it('formats ISO into PH-locale datetime', () => {
    // 2026-04-30T02:00:00Z = 2026-04-30 10:00 PHT
    const out = formatDateTimePHT('2026-04-30T02:00:00Z', 'en-US')
    expect(out).toMatch(/Apr 30/)
    expect(out).toMatch(/10:00/)
  })
  it('formats in zh-TW locale', () => {
    const out = formatDateTimePHT('2026-04-30T02:00:00Z', 'zh-TW')
    expect(out).toMatch(/4月30日/)
  })
})

describe('formatDatePHT', () => {
  it('strips time component', () => {
    const out = formatDatePHT('2026-04-30T02:00:00Z', 'en-US')
    expect(out).toMatch(/Apr 30, 2026/)
  })
})

describe('formatRelativePHT', () => {
  it('returns "in X minutes" relative', () => {
    const future = new Date(Date.now() + 5 * 60 * 1000).toISOString()
    expect(formatRelativePHT(future, 'en-US')).toMatch(/minute/)
  })
})
```

- [ ] **Step 3: Run — should fail**

Run: `npm run test:run -- date`
Expected: FAIL.

- [ ] **Step 4: Implement `src/lib/date.ts`**

```ts
import { format, formatRelative, parseISO } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import { enUS, zhTW } from 'date-fns/locale'

export type AppLocale = 'en-US' | 'zh-TW'
const PH_TZ = 'Asia/Manila'
const localeOf = (l: AppLocale) => (l === 'zh-TW' ? zhTW : enUS)

export function formatDateTimePHT(iso: string, locale: AppLocale): string {
  const zoned = utcToZonedTime(parseISO(iso), PH_TZ)
  return locale === 'zh-TW'
    ? format(zoned, 'M月d日 HH:mm', { locale: zhTW })
    : format(zoned, 'MMM d, HH:mm', { locale: enUS })
}

export function formatDatePHT(iso: string, locale: AppLocale): string {
  const zoned = utcToZonedTime(parseISO(iso), PH_TZ)
  return locale === 'zh-TW'
    ? format(zoned, 'yyyy年M月d日', { locale: zhTW })
    : format(zoned, 'MMM d, yyyy', { locale: enUS })
}

export function formatRelativePHT(iso: string, locale: AppLocale): string {
  const zoned = utcToZonedTime(parseISO(iso), PH_TZ)
  const now = utcToZonedTime(new Date(), PH_TZ)
  return formatRelative(zoned, now, { locale: localeOf(locale) })
}
```

- [ ] **Step 5: Run tests**

Run: `npm run test:run -- date`
Expected: all pass. If `formatRelative` output differs, relax the regex.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add PH timezone date formatters"
```

---

## Task 10: `lib/number.ts` — PHP currency formatter

**Files:**
- Create: `src/lib/number.ts`, `src/lib/number.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/number.test.ts
import { describe, it, expect } from 'vitest'
import { formatPHP, formatPlayerCount } from './number'

describe('formatPHP', () => {
  it('formats with peso sign and grouping', () => {
    expect(formatPHP(1234.5)).toBe('₱1,234.50')
    expect(formatPHP(0)).toBe('₱0.00')
  })
})
describe('formatPlayerCount', () => {
  it('adds thousand separator', () => {
    expect(formatPlayerCount(1234567)).toBe('1,234,567')
  })
  it('handles zero', () => {
    expect(formatPlayerCount(0)).toBe('0')
  })
})
```

- [ ] **Step 2: Run — should fail**

Run: `npm run test:run -- number`
Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/number.ts`**

```ts
const phpFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
})
const intFormatter = new Intl.NumberFormat('en-US')

export function formatPHP(amount: number): string {
  return phpFormatter.format(amount).replace(/ /g, '') // strip nbsp if any
}

export function formatPlayerCount(n: number): string {
  return intFormatter.format(n)
}
```

- [ ] **Step 4: Run tests**

Run: `npm run test:run -- number`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add PHP currency + player count formatters"
```

---

## Task 11: Mock campaigns seed

**Files:**
- Create: `src/mock/campaigns.ts`, `src/mock/campaigns.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/mock/campaigns.test.ts
import { describe, it, expect } from 'vitest'
import { campaigns } from './campaigns'

describe('mock campaigns', () => {
  it('has exactly 16 campaigns', () => {
    expect(campaigns.length).toBe(16)
  })
  it('covers all status types', () => {
    const statuses = new Set(campaigns.map((c) => c.status))
    expect(statuses.has('draft')).toBe(true)
    expect(statuses.has('scheduled')).toBe(true)
    expect(statuses.has('active')).toBe(true)
    expect(statuses.has('disabled')).toBe(true)
  })
  it('every channel appears in at least one campaign', () => {
    const seen = { inApp: false, email: false, sms: false, push: false }
    for (const c of campaigns) {
      if (c.channelPanels.inApp?.enabled) seen.inApp = true
      if (c.channelPanels.email?.enabled) seen.email = true
      if (c.channelPanels.sms?.enabled) seen.sms = true
      if (c.channelPanels.push?.enabled) seen.push = true
    }
    expect(seen).toEqual({ inApp: true, email: true, sms: true, push: true })
  })
  it('has unique ids', () => {
    const ids = new Set(campaigns.map((c) => c.id))
    expect(ids.size).toBe(campaigns.length)
  })
})
```

- [ ] **Step 2: Run — should fail**

Run: `npm run test:run -- campaigns`
Expected: FAIL.

- [ ] **Step 3: Implement `src/mock/campaigns.ts`**

Create the file with 16 campaigns matching the seed table from spec §7.1. Build a helper to reduce repetition:

```ts
import type { Campaign } from '@/types/campaign'
import type { MasterAudience } from '@/types/audience'

const now = Date.parse('2026-04-30T00:00:00Z')
const iso = (offsetMs: number) => new Date(now + offsetMs).toISOString()
const days = (n: number) => n * 86400000
const hours = (n: number) => n * 3600000

const broadcast = (verified?: 'email'): MasterAudience => ({
  broadcast: true,
  conditions: verified === 'email' ? [{ field: 'verifiedContact', value: 'email' }] : [],
  logic: 'AND',
})

export const campaigns: Campaign[] = [
  {
    id: 'cmp_001',
    name: '2026 Lunar New Year Double Deposit Bonus',
    tags: ['seasonal', 'promotion'],
    status: 'active',
    masterAudience: broadcast('email'),
    estimatedRecipients: 84,
    channelPanels: {
      inApp: { enabled: true, title: 'Lunar New Year 2x Bonus!', category: 'promo', bodyRich: 'Double your deposit this Lunar New Year. Limited time offer.', cta: { label: 'Deposit Now', url: '/deposit' }, triggerToast: false },
      email: { enabled: true, subject: '🧧 Lunar New Year — Double Your Deposit', preheader: 'Limited-time 2x deposit bonus inside.', htmlBody: '<h1>Double Deposit Bonus</h1><p>Celebrate the new year with us.</p>', senderFrom: 'promo' },
      sms: { enabled: true, body: 'Lunar New Year 2x deposit bonus is live. Open the app to claim. Reply STOP to unsubscribe.', senderId: 'BRAND' },
      push: { enabled: true, title: '🧧 Double Deposit Bonus', body: 'Lunar New Year offer is live now.', ctaUrl: '/deposit' },
    },
    schedule: { type: 'datetime', at: iso(-days(2)) },
    ignoreQuietHours: false,
    sendingProgress: { perChannel: {
      inApp: { sent: 84, total: 84, lastUpdate: iso(-days(2) + hours(1)) },
      email: { sent: 84, total: 84, lastUpdate: iso(-days(2) + hours(1)) },
      sms:   { sent: 67, total: 84, lastUpdate: iso(-days(2) + hours(1)) },
      push:  { sent: 41, total: 84, lastUpdate: iso(-days(2) + hours(1)) },
    } },
    exclusions: { optOut: 12, frequencyCap: 0, suppression: 5, unverifiedContact: 19 },
    createdBy: 'Anna Rivera',
    createdAt: iso(-days(5)),
    updatedAt: iso(-days(2)),
  },
  // ... continue with cmp_002 through cmp_016 per spec §7.1 table
  // For each: provide name, status, channels enabled, audience conditions matching the description,
  // realistic content snippets in EN, schedule.at relative to now (past for active/disabled,
  // future for scheduled), and createdBy rotating through the 4 ops accounts.
]
```

**Required entries (fill same shape):**
- `cmp_002` VIP July Exclusive High Rebate — active, In-App + Email, audience `vipTier >= 5`, createdBy Marco Santos
- `cmp_003` Slot Tournament Sign-up Reminder — scheduled, In-App + Push, audience `playerStatus=active AND firstDeposit=yes`, schedule.at `iso(days(1))` 10:00, createdBy Lisa Cruz
- `cmp_004` KYC Resubmission Reminder (Dormant) — active, Email + SMS, audience `playerStatus=dormant AND kycStatus=rejected` (use `playerStatus=dormant` only since condition list doesn't include kyc; pretend by using AND with `verifiedContact=email`), createdBy Juan Reyes
- `cmp_005` System Maintenance Notice 8/15 02:00 — scheduled, In-App announcement, broadcast, schedule.at `iso(days(2))`, createdBy Anna Rivera
- `cmp_006` Anniversary Appreciation Rewards — draft, no channels, no audience, createdBy Marco Santos
- `cmp_007` Newcomer First Deposit 2x (D+3) — active, In-App + Email + Push, audience `registrationDays<=30 AND firstDeposit=no`, createdBy Lisa Cruz
- `cmp_008` Churn Recovery Email — disabled, Email + SMS, audience `playerStatus=churned AND cumulativeDeposit=1000-5000`, schedule.at past, createdBy Juan Reyes
- `cmp_009` Sportsbook World Cup Special — active, In-App + Push, audience broadcast, createdBy Anna Rivera
- `cmp_010` Customer Support Satisfaction Survey — draft, createdBy Marco Santos
- `cmp_011` VIP 1-on-1 CS Online Notice — scheduled, In-App + SMS, audience `vipTier>=7`, schedule.at `iso(hours(4))`, createdBy Lisa Cruz
- `cmp_012` Live Dealer Special Reward — disabled, In-App + Email, audience `cumulativeDeposit=100-1000`, createdBy Juan Reyes
- `cmp_013` Lunar New Year Limited Game Preview — active, In-App, broadcast, createdBy Anna Rivera
- `cmp_014` High Roller VIP Invitation — active, Email + SMS, audience `cumulativeDeposit=5000+`, createdBy Marco Santos
- `cmp_015` Mother's Day Greeting — disabled (expired), In-App + Email, broadcast, schedule.at `iso(-days(60))`, createdBy Lisa Cruz
- `cmp_016` Account Security 2FA Activation Reminder — active, In-App + Email, audience `verifiedContact=email AND firstDeposit=yes` (proxy for "2FA off"), createdBy Juan Reyes

For each entry: write a short EN body for each enabled channel (1-2 sentences), set `estimatedRecipients` consistent with the audience filter applied to the 120-player pool (use `estimateRecipients` mentally; tests don't verify exact numbers — just that they're plausible), set `exclusions` to small reasonable counts for active/disabled campaigns, set `sendingProgress` only for `active`/`disabled`.

- [ ] **Step 4: Run tests**

Run: `npm run test:run -- campaigns`
Expected: all 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add 16 mock campaigns covering all states and channels"
```

---

## Task 12: In-memory campaign store

**Files:**
- Create: `src/store/campaigns.ts`, `src/store/campaigns.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/store/campaigns.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { campaignStore } from './campaigns'

beforeEach(() => campaignStore.reset())

describe('campaignStore', () => {
  it('lists seed campaigns', () => {
    expect(campaignStore.list().length).toBe(16)
  })
  it('gets by id', () => {
    expect(campaignStore.get('cmp_001')?.name).toMatch(/Lunar/)
  })
  it('updates an existing campaign', () => {
    campaignStore.update('cmp_006', { name: 'Renamed Draft' })
    expect(campaignStore.get('cmp_006')?.name).toBe('Renamed Draft')
  })
  it('toggles status', () => {
    campaignStore.setStatus('cmp_001', 'disabled')
    expect(campaignStore.get('cmp_001')?.status).toBe('disabled')
    campaignStore.setStatus('cmp_001', 'active')
    expect(campaignStore.get('cmp_001')?.status).toBe('active')
  })
  it('creates new campaign with generated id', () => {
    const before = campaignStore.list().length
    const c = campaignStore.create({ name: 'New Test' })
    expect(c.id).toMatch(/^cmp_/)
    expect(campaignStore.list().length).toBe(before + 1)
  })
})
```

- [ ] **Step 2: Run — should fail**

Run: `npm run test:run -- store`
Expected: FAIL.

- [ ] **Step 3: Implement `src/store/campaigns.ts`**

```ts
import type { Campaign, CampaignStatus } from '@/types/campaign'
import { campaigns as seed } from '@/mock/campaigns'
import { currentUser } from '@/mock/ops'

let data: Campaign[] = []

function nowIso() { return new Date().toISOString() }

function blank(name = ''): Campaign {
  return {
    id: `cmp_${Math.random().toString(36).slice(2, 7)}`,
    name,
    tags: [],
    status: 'draft',
    masterAudience: { broadcast: false, conditions: [], logic: 'AND' },
    estimatedRecipients: 0,
    channelPanels: {},
    schedule: { type: 'immediate' },
    ignoreQuietHours: false,
    createdBy: currentUser.username,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
}

export const campaignStore = {
  reset() { data = seed.map((c) => ({ ...c })) },
  list(): Campaign[] { return data },
  get(id: string): Campaign | undefined { return data.find((c) => c.id === id) },
  create(partial: Partial<Campaign> = {}): Campaign {
    const c: Campaign = { ...blank(partial.name ?? 'Untitled'), ...partial }
    data = [c, ...data]
    return c
  },
  update(id: string, patch: Partial<Campaign>) {
    data = data.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: nowIso() } : c))
  },
  setStatus(id: string, status: CampaignStatus) {
    this.update(id, { status })
  },
  remove(id: string) {
    data = data.filter((c) => c.id !== id)
  },
}

campaignStore.reset()
```

- [ ] **Step 4: Run tests**

Run: `npm run test:run -- store`
Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add in-memory campaign store with reset"
```

---

## Task 13: i18n setup with EN + zh-TW scaffolds

**Files:**
- Create: `src/i18n/index.ts`, `src/i18n/en.json`, `src/i18n/zh-TW.json`
- Modify: `src/main.tsx`

- [ ] **Step 1: Install i18n deps**

```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

- [ ] **Step 2: Create `src/i18n/en.json` (initial keys, expand later)**

```json
{
  "nav": {
    "campaigns": "Campaigns",
    "auditLog": "Audit Log"
  },
  "topbar": {
    "brand": "Admin Console",
    "logout": "Sign out"
  },
  "common": {
    "cancel": "Cancel",
    "save": "Save",
    "saveDraft": "Save as Draft",
    "delete": "Delete",
    "confirm": "Confirm",
    "close": "Close",
    "edit": "Edit",
    "loading": "Loading…",
    "search": "Search",
    "clearFilters": "Clear filters",
    "back": "Back"
  }
}
```

- [ ] **Step 3: Create `src/i18n/zh-TW.json` (mirror)**

```json
{
  "nav": {
    "campaigns": "Campaigns",
    "auditLog": "稽核日誌"
  },
  "topbar": {
    "brand": "後台主控台",
    "logout": "登出"
  },
  "common": {
    "cancel": "取消",
    "save": "儲存",
    "saveDraft": "存為草稿",
    "delete": "刪除",
    "confirm": "確認",
    "close": "關閉",
    "edit": "編輯",
    "loading": "載入中…",
    "search": "搜尋",
    "clearFilters": "清除篩選",
    "back": "返回"
  }
}
```

- [ ] **Step 4: Create `src/i18n/index.ts`**

```ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './en.json'
import zhTW from './zh-TW.json'

export type AppLocale = 'en-US' | 'zh-TW'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { 'en-US': { translation: en }, 'zh-TW': { translation: zhTW } },
    fallbackLng: 'en-US',
    supportedLngs: ['en-US', 'zh-TW'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'ui-lang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
    returnNull: false,
  })

export default i18n

export function setLanguage(lng: AppLocale) {
  i18n.changeLanguage(lng)
}
export function currentLocale(): AppLocale {
  return (i18n.resolvedLanguage as AppLocale) || 'en-US'
}
```

- [ ] **Step 5: Wire into `src/main.tsx`**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './i18n'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 6: Smoke check from App.tsx**

Update `App.tsx`:
```tsx
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export default function App() {
  const { t, i18n } = useTranslation()
  return (
    <main className="container py-12">
      <h1 className="text-3xl font-semibold mb-4">{t('topbar.brand')}</h1>
      <Button onClick={() => i18n.changeLanguage(i18n.resolvedLanguage === 'zh-TW' ? 'en-US' : 'zh-TW')}>
        Toggle ({i18n.resolvedLanguage})
      </Button>
    </main>
  )
}
```

Run `npm run dev`, click button — title should toggle between "Admin Console" and "後台主控台". Stop server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: configure react-i18next with EN + zh-TW"
```

---

## Task 14: LangSwitcher component

**Files:**
- Create: `src/components/shell/LangSwitcher.tsx`

- [ ] **Step 1: Implement**

```tsx
import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const LABELS: Record<string, string> = { 'en-US': 'EN', 'zh-TW': '中文' }

export function LangSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.resolvedLanguage ?? 'en-US'
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          {LABELS[current] ?? current}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={current}
          onValueChange={(v) => i18n.changeLanguage(v)}
        >
          <DropdownMenuRadioItem value="en-US">EN</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="zh-TW">中文</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add LangSwitcher dropdown"
```

---

## Task 15: Topbar component

**Files:**
- Create: `src/components/shell/Topbar.tsx`

- [ ] **Step 1: Implement**

```tsx
import { useTranslation } from 'react-i18next'
import { LangSwitcher } from './LangSwitcher'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { currentUser } from '@/mock/ops'

export function Topbar() {
  const { t } = useTranslation()
  return (
    <header className="h-14 border-b bg-background flex items-center px-6 sticky top-0 z-30">
      <div className="font-semibold text-lg">{t('topbar.brand')}</div>
      <div className="ml-auto flex items-center gap-2">
        <LangSwitcher />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              {currentUser.username}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{currentUser.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <LogOut className="h-4 w-4 mr-2" /> {t('topbar.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add Topbar with brand, lang switcher, account menu"
```

---

## Task 16: Sidebar with Audit Log stub

**Files:**
- Create: `src/components/shell/Sidebar.tsx`, `src/components/common/AuditLogStubDialog.tsx`

- [ ] **Step 1: AuditLogStubDialog**

```tsx
// src/components/common/AuditLogStubDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

export function AuditLogStubDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('auditLogStub.title', 'Redirecting to platform Audit Log')}</DialogTitle>
          <DialogDescription>
            {t('auditLogStub.body', 'In production this opens the existing platform-wide audit log page (out of scope for this prototype).')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose}>{t('common.close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

(`t(key, fallback)` lets us ship before en.json gains the keys; we'll backfill in Task 36.)

- [ ] **Step 2: Sidebar**

```tsx
// src/components/shell/Sidebar.tsx
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Megaphone, FileSearch } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AuditLogStubDialog } from '@/components/common/AuditLogStubDialog'

export function Sidebar() {
  const { t } = useTranslation()
  const [auditOpen, setAuditOpen] = useState(false)
  const itemClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 px-3 py-2 rounded-md text-sm',
      isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent/50'
    )
  return (
    <>
      <aside className="w-60 border-r bg-background flex flex-col py-4 px-3 gap-1">
        <NavLink to="/campaigns" className={itemClass}>
          <Megaphone className="h-4 w-4" />
          {t('nav.campaigns')}
        </NavLink>
        <button onClick={() => setAuditOpen(true)} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent/50 text-left">
          <FileSearch className="h-4 w-4" />
          {t('nav.auditLog')}
        </button>
      </aside>
      <AuditLogStubDialog open={auditOpen} onClose={() => setAuditOpen(false)} />
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Sidebar and Audit Log stub dialog"
```

---

## Task 17: AppLayout + router with HashRouter

**Files:**
- Create: `src/components/shell/AppLayout.tsx`, `src/router.tsx`, `src/pages/NotFound.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Install router**

```bash
npm install react-router-dom@6
```

- [ ] **Step 2: AppLayout**

```tsx
// src/components/shell/AppLayout.tsx
import { Outlet } from 'react-router-dom'
import { Topbar } from './Topbar'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Topbar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: NotFound page**

```tsx
// src/pages/NotFound.tsx
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-semibold mb-2">404</h1>
      <p className="text-muted-foreground mb-6">{t('notFound.body', 'The page you are looking for does not exist.')}</p>
      <Button asChild><Link to="/campaigns">{t('common.back')}</Link></Button>
    </div>
  )
}
```

- [ ] **Step 4: Router**

```tsx
// src/router.tsx
import { createHashRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/shell/AppLayout'
import NotFound from '@/pages/NotFound'

// Lazy stubs for now; real pages come in later tasks
const CampaignListStub = () => <h1 className="text-2xl font-semibold">Campaigns (stub)</h1>

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/campaigns" replace /> },
      { path: 'campaigns', element: <CampaignListStub /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
```

- [ ] **Step 5: Update `src/App.tsx`**

```tsx
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { Toaster } from '@/components/ui/sonner'

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}
```

- [ ] **Step 6: Verify**

Run `npm run dev`. Visit `/` — should redirect to `/#/campaigns` and show stub heading + sidebar + topbar. Visit `/#/garbage` — 404 page. Stop server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add AppLayout, HashRouter routes, NotFound page"
```

---

## Task 18: StatusBadge + ChannelIcons + EmptyState + LoadingSkeleton commons

**Files:**
- Create: `src/components/common/StatusBadge.tsx`, `src/components/common/ChannelIcons.tsx`, `src/components/common/EmptyState.tsx`, `src/components/common/LoadingSkeleton.tsx`

- [ ] **Step 1: StatusBadge**

```tsx
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import type { CampaignStatus } from '@/types/campaign'
import { cn } from '@/lib/utils'

const styles: Record<CampaignStatus, string> = {
  draft:     'bg-slate-100 text-slate-700 hover:bg-slate-100',
  scheduled: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  active:    'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  disabled:  'bg-rose-100 text-rose-700 hover:bg-rose-100',
}

export function StatusBadge({ status }: { status: CampaignStatus }) {
  const { t } = useTranslation()
  return (
    <Badge variant="secondary" className={cn('rounded-full px-2.5 py-0.5 font-medium', styles[status])}>
      {t(`campaign.status.${status}`, status)}
    </Badge>
  )
}
```

- [ ] **Step 2: ChannelIcons**

```tsx
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react'
import type { ChannelKey } from '@/types/campaign'
import { cn } from '@/lib/utils'

const ICONS: Record<ChannelKey, typeof Bell> = {
  inApp: Bell, email: Mail, sms: MessageSquare, push: Smartphone,
}
const TITLES: Record<ChannelKey, string> = {
  inApp: 'In-App', email: 'Email', sms: 'SMS', push: 'Push',
}

export function ChannelIcons({ enabled, className }: { enabled: ChannelKey[]; className?: string }) {
  return (
    <div className={cn('flex gap-1.5 text-muted-foreground', className)}>
      {(['inApp','email','sms','push'] as ChannelKey[]).map((k) => {
        const Icon = ICONS[k]
        const on = enabled.includes(k)
        return (
          <Icon
            key={k}
            className={cn('h-4 w-4', on ? 'text-foreground' : 'opacity-25')}
            aria-label={TITLES[k]}
          />
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: EmptyState**

```tsx
import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      {description && <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  )
}
```

- [ ] **Step 4: LoadingSkeleton**

```tsx
import { Skeleton } from '@/components/ui/skeleton'

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 px-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/12" />
          <Skeleton className="h-4 w-1/8" />
        </div>
      ))}
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-6 py-6">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add StatusBadge, ChannelIcons, EmptyState, skeletons"
```

---

## Task 19: CampaignFilters component

**Files:**
- Create: `src/components/campaign/CampaignFilters.tsx`

- [ ] **Step 1: Define filter type and component**

```tsx
import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import type { CampaignStatus, ChannelKey } from '@/types/campaign'
import { opsAccounts } from '@/mock/ops'

export type CampaignFiltersValue = {
  search: string
  statuses: CampaignStatus[]
  channels: ChannelKey[]
  createdBy: string[]
}

export const emptyFilters: CampaignFiltersValue = {
  search: '', statuses: [], channels: [], createdBy: [],
}

const ALL_STATUSES: CampaignStatus[] = ['draft', 'scheduled', 'active', 'disabled']
const ALL_CHANNELS: ChannelKey[] = ['inApp', 'email', 'sms', 'push']

export function CampaignFilters({
  value, onChange,
}: { value: CampaignFiltersValue; onChange: (v: CampaignFiltersValue) => void }) {
  const { t } = useTranslation()
  const hasFilters =
    value.search.length > 0 || value.statuses.length > 0 ||
    value.channels.length > 0 || value.createdBy.length > 0

  const toggle = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('common.search')}
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          className="pl-9"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {t('campaign.filters.status')}{value.statuses.length > 0 && ` (${value.statuses.length})`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{t('campaign.filters.status')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ALL_STATUSES.map((s) => (
            <DropdownMenuCheckboxItem
              key={s}
              checked={value.statuses.includes(s)}
              onCheckedChange={() => onChange({ ...value, statuses: toggle(value.statuses, s) })}
            >
              {t(`campaign.status.${s}`, s)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {t('campaign.filters.channels')}{value.channels.length > 0 && ` (${value.channels.length})`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{t('campaign.filters.channels')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ALL_CHANNELS.map((c) => (
            <DropdownMenuCheckboxItem
              key={c}
              checked={value.channels.includes(c)}
              onCheckedChange={() => onChange({ ...value, channels: toggle(value.channels, c) })}
            >
              {t(`campaign.channels.${c}`, c)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {t('campaign.filters.createdBy')}{value.createdBy.length > 0 && ` (${value.createdBy.length})`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{t('campaign.filters.createdBy')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {opsAccounts.map((u) => (
            <DropdownMenuCheckboxItem
              key={u.id}
              checked={value.createdBy.includes(u.username)}
              onCheckedChange={() => onChange({ ...value, createdBy: toggle(value.createdBy, u.username) })}
            >
              {u.username}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => onChange({ ...emptyFilters })}>
          <X className="h-3 w-3 mr-1" /> {t('common.clearFilters')}
        </Button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add CampaignFilters with status/channel/createdBy"
```

---

## Task 20: CampaignTable component

**Files:**
- Create: `src/components/campaign/CampaignTable.tsx`

- [ ] **Step 1: Implement**

```tsx
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import type { Campaign, ChannelKey } from '@/types/campaign'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ChannelIcons } from '@/components/common/ChannelIcons'
import { formatDateTimePHT, type AppLocale } from '@/lib/date'
import { formatPlayerCount } from '@/lib/number'

function enabledChannels(c: Campaign): ChannelKey[] {
  return (['inApp','email','sms','push'] as ChannelKey[])
    .filter((k) => c.channelPanels[k]?.enabled)
}

export function CampaignTable({ rows }: { rows: Campaign[] }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = (i18n.resolvedLanguage as AppLocale) ?? 'en-US'

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('campaign.table.name')}</TableHead>
          <TableHead>{t('campaign.table.tags')}</TableHead>
          <TableHead>{t('campaign.table.channels')}</TableHead>
          <TableHead className="text-right">{t('campaign.table.audience')}</TableHead>
          <TableHead>{t('campaign.table.schedule')}</TableHead>
          <TableHead>{t('campaign.table.status')}</TableHead>
          <TableHead>{t('campaign.table.createdBy')}</TableHead>
          <TableHead>{t('campaign.table.updated')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((c) => (
          <TableRow
            key={c.id}
            className="cursor-pointer h-10"
            onClick={() => navigate(`/campaigns/${c.id}`)}
          >
            <TableCell className="font-medium">{c.name}</TableCell>
            <TableCell>
              <div className="flex gap-1 flex-wrap">
                {c.tags.map((tg) => (
                  <span key={tg} className="text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5">{tg}</span>
                ))}
              </div>
            </TableCell>
            <TableCell><ChannelIcons enabled={enabledChannels(c)} /></TableCell>
            <TableCell className="text-right tabular-nums">{formatPlayerCount(c.estimatedRecipients)}</TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {c.schedule.at ? formatDateTimePHT(c.schedule.at, locale) : '—'}
            </TableCell>
            <TableCell><StatusBadge status={c.status} /></TableCell>
            <TableCell className="text-sm text-muted-foreground">{c.createdBy}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDateTimePHT(c.updatedAt, locale)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add CampaignTable"
```

---

## Task 21: CampaignList page (with empty / loading / long-list / error / filter-empty states)

**Files:**
- Create: `src/pages/campaigns/CampaignList.tsx`
- Modify: `src/router.tsx`

- [ ] **Step 1: Implement page**

```tsx
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { campaignStore } from '@/store/campaigns'
import { CampaignFilters, emptyFilters, type CampaignFiltersValue } from '@/components/campaign/CampaignFilters'
import { CampaignTable } from '@/components/campaign/CampaignTable'
import { TableSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import type { Campaign, ChannelKey } from '@/types/campaign'

const PAGE_SIZE = 10

function applyFilters(rows: Campaign[], f: CampaignFiltersValue): Campaign[] {
  return rows.filter((c) => {
    if (f.search && !c.name.toLowerCase().includes(f.search.toLowerCase())) return false
    if (f.statuses.length > 0 && !f.statuses.includes(c.status)) return false
    if (f.channels.length > 0) {
      const enabled = (['inApp','email','sms','push'] as ChannelKey[]).filter(
        (k) => c.channelPanels[k]?.enabled
      )
      if (!f.channels.some((ch) => enabled.includes(ch))) return false
    }
    if (f.createdBy.length > 0 && !f.createdBy.includes(c.createdBy)) return false
    return true
  })
}

export default function CampaignList() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const triggerError = params.get('error') === '1'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filters, setFilters] = useState<CampaignFiltersValue>({ ...emptyFilters })
  const [page, setPage] = useState(1)

  useEffect(() => {
    const t1 = setTimeout(() => {
      if (triggerError) setError(true)
      setLoading(false)
    }, 350)
    return () => clearTimeout(t1)
  }, [triggerError])

  const all = campaignStore.list()
  const filtered = useMemo(() => applyFilters(all, filters), [all, filters])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{t('campaign.list.title', 'Campaigns')}</h1>
        <Button asChild>
          <Link to="/campaigns/new"><Plus className="h-4 w-4 mr-1" /> {t('campaign.list.newButton', 'New Campaign')}</Link>
        </Button>
      </div>

      <CampaignFilters value={filters} onChange={(v) => { setFilters(v); setPage(1) }} />

      {loading && <TableSkeleton rows={5} />}

      {!loading && error && (
        <div className="border rounded-md p-12 flex flex-col items-center text-center">
          <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
          <h3 className="font-medium mb-1">{t('campaign.list.errorTitle', 'Something went wrong')}</h3>
          <p className="text-muted-foreground mb-4">{t('campaign.list.errorBody', 'We could not load campaigns. Please try again.')}</p>
          <Button onClick={() => { setError(false); setLoading(true); setTimeout(() => setLoading(false), 300) }}>
            <RefreshCw className="h-4 w-4 mr-1" /> {t('campaign.list.retry', 'Retry')}
          </Button>
        </div>
      )}

      {!loading && !error && all.length === 0 && (
        <EmptyState
          title={t('campaign.list.empty.title', 'No campaigns yet')}
          description={t('campaign.list.empty.body', 'Create your first campaign to start reaching players.')}
          action={<Button asChild><Link to="/campaigns/new">{t('campaign.list.newButton', 'New Campaign')}</Link></Button>}
        />
      )}

      {!loading && !error && all.length > 0 && filtered.length === 0 && (
        <EmptyState
          title={t('campaign.list.filterEmpty.title', 'No campaigns match your filters')}
          description={t('campaign.list.filterEmpty.body', 'Try adjusting your filters or clearing them.')}
          action={<Button variant="outline" onClick={() => setFilters({ ...emptyFilters })}>{t('common.clearFilters')}</Button>}
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="rounded-md border">
            <CampaignTable rows={pageRows} />
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 mt-4 text-sm">
              <span className="text-muted-foreground">
                {t('campaign.list.pageOf', 'Page {{page}} of {{total}}', { page, total: totalPages })}
              </span>
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                {t('common.previous', 'Previous')}
              </Button>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                {t('common.next', 'Next')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Wire into router**

In `src/router.tsx`, replace the stub:
```tsx
import CampaignList from '@/pages/campaigns/CampaignList'
// ...
{ path: 'campaigns', element: <CampaignList /> },
```

- [ ] **Step 3: Verify states manually**

Run `npm run dev`. Check:
- `/#/campaigns` shows table with seed rows
- Add filter for status `draft` → shows 2 drafts
- Filter for `disabled` + channel `sms` → shows churn recovery row
- Clear filters → all rows back
- Append `?error=1` to URL hash query (`/#/campaigns?error=1` — note: HashRouter parses query after the `#/`) → error state with retry
- Search "VIP" → filters to 2 rows

Stop server.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: implement Campaign list with all states + pagination"
```

---

## Task 22: AudienceBuilder component

**Files:**
- Create: `src/components/campaign/AudienceBuilder.tsx`

- [ ] **Step 1: Implement**

```tsx
import { useTranslation } from 'react-i18next'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AudienceCondition, AudienceConditionField, MasterAudience } from '@/types/audience'
import { estimateRecipients } from '@/lib/audience'
import { players } from '@/mock/players'
import { formatPlayerCount } from '@/lib/number'

const FIELDS: AudienceConditionField[] = [
  'vipTier','playerStatus','firstDeposit','registrationDays','cumulativeDeposit','verifiedContact',
]

function defaultConditionFor(field: AudienceConditionField): AudienceCondition {
  switch (field) {
    case 'vipTier': return { field, op: '>=', value: 3 }
    case 'playerStatus': return { field, value: 'active' }
    case 'firstDeposit': return { field, value: 'yes' }
    case 'registrationDays': return { field, op: '<=', value: 30 }
    case 'cumulativeDeposit': return { field, value: '100-1000' }
    case 'verifiedContact': return { field, value: 'email' }
  }
}

function ConditionEditor({
  c, onChange, onRemove,
}: { c: AudienceCondition; onChange: (c: AudienceCondition) => void; onRemove: () => void }) {
  const { t } = useTranslation()
  switch (c.field) {
    case 'vipTier':
      return (
        <Row label={t('audience.conditions.vipTier', 'VIP Tier')} onRemove={onRemove}>
          <Select value={c.op} onValueChange={(v) => onChange({ ...c, op: v as typeof c.op })}>
            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value=">=">≥</SelectItem>
              <SelectItem value="<=">≤</SelectItem>
              <SelectItem value="=">=</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number" min={1} max={7} value={c.value}
            onChange={(e) => onChange({ ...c, value: Math.min(7, Math.max(1, Number(e.target.value))) as 1 })}
            className="w-20"
          />
        </Row>
      )
    case 'playerStatus':
      return (
        <Row label={t('audience.conditions.playerStatus', 'Player Status')} onRemove={onRemove}>
          <Select value={c.value} onValueChange={(v) => onChange({ ...c, value: v as typeof c.value })}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t('audience.values.active', 'Active')}</SelectItem>
              <SelectItem value="dormant">{t('audience.values.dormant', 'Dormant')}</SelectItem>
              <SelectItem value="churned">{t('audience.values.churned', 'Churned')}</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      )
    case 'firstDeposit':
      return (
        <Row label={t('audience.conditions.firstDeposit', 'First Deposit')} onRemove={onRemove}>
          <Select value={c.value} onValueChange={(v) => onChange({ ...c, value: v as typeof c.value })}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">{t('audience.values.yes', 'Yes')}</SelectItem>
              <SelectItem value="no">{t('audience.values.no', 'No')}</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      )
    case 'registrationDays':
      return (
        <Row label={t('audience.conditions.registrationDays', 'Registered (days)')} onRemove={onRemove}>
          <Select value={c.op} onValueChange={(v) => onChange({ ...c, op: v as typeof c.op })}>
            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="<=">≤</SelectItem>
              <SelectItem value=">=">≥</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number" min={1} value={c.value}
            onChange={(e) => onChange({ ...c, value: Number(e.target.value) })}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">{t('audience.units.days', 'days')}</span>
        </Row>
      )
    case 'cumulativeDeposit':
      return (
        <Row label={t('audience.conditions.cumulativeDeposit', 'Cumulative Deposit')} onRemove={onRemove}>
          <Select value={c.value} onValueChange={(v) => onChange({ ...c, value: v as typeof c.value })}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0-100">$0 – $100</SelectItem>
              <SelectItem value="100-1000">$100 – $1,000</SelectItem>
              <SelectItem value="1000-5000">$1,000 – $5,000</SelectItem>
              <SelectItem value="5000+">$5,000+</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      )
    case 'verifiedContact':
      return (
        <Row label={t('audience.conditions.verifiedContact', 'Verified Contact')} onRemove={onRemove}>
          <Select value={c.value} onValueChange={(v) => onChange({ ...c, value: v as typeof c.value })}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="email">{t('audience.values.emailOnly', 'Email')}</SelectItem>
              <SelectItem value="phone">{t('audience.values.phoneOnly', 'Phone')}</SelectItem>
              <SelectItem value="both">{t('audience.values.both', 'Both')}</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      )
  }
}

function Row({ label, children, onRemove }: { label: string; children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 py-2 border-b last:border-b-0">
      <span className="text-sm font-medium w-44 shrink-0">{label}</span>
      {children}
      <Button variant="ghost" size="icon" className="ml-auto" onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function AudienceBuilder({
  value, onChange,
}: { value: MasterAudience; onChange: (v: MasterAudience) => void }) {
  const { t } = useTranslation()
  const estimate = estimateRecipients(value, players)
  const usedFields = new Set(value.conditions.map((c) => c.field))
  const addable = FIELDS.filter((f) => !usedFields.has(f))

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Checkbox
          id="broadcast"
          checked={value.broadcast}
          onCheckedChange={(v) => onChange({ ...value, broadcast: !!v })}
        />
        <Label htmlFor="broadcast" className="font-medium">
          {t('audience.broadcast', 'Broadcast to all players')}
        </Label>
      </div>

      {!value.broadcast && (
        <>
          <div className="border rounded-md p-3">
            {value.conditions.map((c, i) => (
              <ConditionEditor
                key={i}
                c={c}
                onChange={(nc) => {
                  const next = [...value.conditions]; next[i] = nc
                  onChange({ ...value, conditions: next })
                }}
                onRemove={() => onChange({ ...value, conditions: value.conditions.filter((_, j) => j !== i) })}
              />
            ))}
            {addable.length > 0 && (
              <div className="pt-3">
                <Select onValueChange={(field) => onChange({
                  ...value, conditions: [...value.conditions, defaultConditionFor(field as AudienceConditionField)],
                })}>
                  <SelectTrigger className="w-60">
                    <Plus className="h-4 w-4 mr-1" />
                    <SelectValue placeholder={t('audience.addCondition', 'Add condition')} />
                  </SelectTrigger>
                  <SelectContent>
                    {addable.map((f) => (
                      <SelectItem key={f} value={f}>{t(`audience.conditions.${f}`, f)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {value.conditions.length > 1 && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">{t('audience.combineWith', 'Combine conditions with')}</span>
              <Select value={value.logic} onValueChange={(v) => onChange({ ...value, logic: v as 'AND' | 'OR' })}>
                <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">AND</SelectItem>
                  <SelectItem value="OR">OR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      )}

      <div className="rounded-md bg-muted p-3 flex items-center justify-between">
        <span className="text-sm font-medium">{t('audience.estimateLabel', 'Estimated recipients')}</span>
        <span className="text-lg font-semibold tabular-nums">{formatPlayerCount(estimate)}</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add AudienceBuilder with live estimate"
```

---

## Task 23: Channel panel components (4)

**Files:**
- Create: `src/components/campaign/ChannelPanelInApp.tsx`, `ChannelPanelEmail.tsx`, `ChannelPanelSMS.tsx`, `ChannelPanelPush.tsx`

For each panel, follow this pattern: a Card with header switch + collapsible body. Each takes `value`, `onChange`, and an `onTestSend` handler. Mark `enabled` based on `value.enabled`.

- [ ] **Step 1: ChannelPanelInApp**

```tsx
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bell } from 'lucide-react'
import type { InAppPanel } from '@/types/campaign'

export function ChannelPanelInApp({
  value, onChange,
}: { value: InAppPanel; onChange: (v: InAppPanel) => void }) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <Bell className="h-4 w-4" />
        <CardTitle className="text-base flex-1">{t('campaign.channels.inApp', 'In-App')}</CardTitle>
        <Switch checked={value.enabled} onCheckedChange={(v) => onChange({ ...value, enabled: v })} />
      </CardHeader>
      {value.enabled && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('campaign.form.title', 'Title')}</Label>
              <Input value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} />
            </div>
            <div>
              <Label>{t('campaign.form.category', 'Category')}</Label>
              <Select value={value.category} onValueChange={(v) => onChange({ ...value, category: v as InAppPanel['category'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">{t('campaign.inApp.personal', 'Personal')}</SelectItem>
                  <SelectItem value="promo">{t('campaign.inApp.promo', 'Promotion')}</SelectItem>
                  <SelectItem value="announcement">{t('campaign.inApp.announcement', 'Announcement')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>{t('campaign.form.body', 'Body')}</Label>
            <Textarea rows={5} value={value.bodyRich} onChange={(e) => onChange({ ...value, bodyRich: e.target.value })} />
            <p className="text-xs text-muted-foreground mt-1">{t('campaign.inApp.richHint', 'Rich text editor placeholder — supports bold, links, inline images in production')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="trigger-toast"
              checked={value.triggerToast}
              onCheckedChange={(v) => onChange({ ...value, triggerToast: !!v })}
            />
            <Label htmlFor="trigger-toast">{t('campaign.inApp.triggerToast', 'Trigger toast notification')}</Label>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
```

- [ ] **Step 2: ChannelPanelEmail**

```tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mail, Send, Eye, Code } from 'lucide-react'
import type { EmailPanel } from '@/types/campaign'

export function ChannelPanelEmail({
  value, onChange, onTestSend,
}: { value: EmailPanel; onChange: (v: EmailPanel) => void; onTestSend: () => void }) {
  const { t } = useTranslation()
  const [view, setView] = useState<'code' | 'preview'>('code')
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <Mail className="h-4 w-4" />
        <CardTitle className="text-base flex-1">{t('campaign.channels.email', 'Email')}</CardTitle>
        <Switch checked={value.enabled} onCheckedChange={(v) => onChange({ ...value, enabled: v })} />
      </CardHeader>
      {value.enabled && (
        <CardContent className="space-y-4">
          <div>
            <Label>{t('campaign.email.subject', 'Subject')}</Label>
            <Input value={value.subject} onChange={(e) => onChange({ ...value, subject: e.target.value })} />
          </div>
          <div>
            <Label>{t('campaign.email.preheader', 'Preheader')}</Label>
            <Input value={value.preheader} onChange={(e) => onChange({ ...value, preheader: e.target.value })} />
          </div>
          <div>
            <Label>{t('campaign.email.sender', 'Sender From')}</Label>
            <Select value={value.senderFrom} onValueChange={(v) => onChange({ ...value, senderFrom: v as EmailPanel['senderFrom'] })}>
              <SelectTrigger className="w-60"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="noreply">noreply@brand.ph</SelectItem>
                <SelectItem value="promo">promo@brand.ph</SelectItem>
                <SelectItem value="vip">vip@brand.ph</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>{t('campaign.email.body', 'HTML Body')}</Label>
              <div className="flex gap-1">
                <Button type="button" variant={view === 'code' ? 'default' : 'outline'} size="sm" onClick={() => setView('code')}>
                  <Code className="h-3.5 w-3.5 mr-1" /> HTML
                </Button>
                <Button type="button" variant={view === 'preview' ? 'default' : 'outline'} size="sm" onClick={() => setView('preview')}>
                  <Eye className="h-3.5 w-3.5 mr-1" /> {t('campaign.email.preview', 'Preview')}
                </Button>
              </div>
            </div>
            {view === 'code' ? (
              <Textarea rows={10} value={value.htmlBody} onChange={(e) => onChange({ ...value, htmlBody: e.target.value })} className="font-mono text-xs" />
            ) : (
              <iframe srcDoc={value.htmlBody} title="Email preview" className="w-full border rounded-md h-72 bg-white" />
            )}
          </div>
          <Button variant="outline" size="sm" onClick={onTestSend}>
            <Send className="h-4 w-4 mr-1" /> {t('campaign.testSend.button', 'Test send')}
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
```

- [ ] **Step 3: ChannelPanelSMS**

```tsx
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Send } from 'lucide-react'
import type { SmsPanel } from '@/types/campaign'

export function ChannelPanelSMS({
  value, onChange, onTestSend,
}: { value: SmsPanel; onChange: (v: SmsPanel) => void; onTestSend: () => void }) {
  const { t } = useTranslation()
  const len = value.body.length
  const segments = Math.ceil(len / 160) || 1
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <MessageSquare className="h-4 w-4" />
        <CardTitle className="text-base flex-1">{t('campaign.channels.sms', 'SMS')}</CardTitle>
        <Switch checked={value.enabled} onCheckedChange={(v) => onChange({ ...value, enabled: v })} />
      </CardHeader>
      {value.enabled && (
        <CardContent className="space-y-4">
          <div>
            <Label>{t('campaign.sms.body', 'Message')}</Label>
            <Textarea rows={4} value={value.body} onChange={(e) => onChange({ ...value, body: e.target.value })} />
            <p className="text-xs text-muted-foreground mt-1">
              {len} / 160 {t('campaign.sms.chars', 'chars')}
              {segments > 1 && ` · ${t('campaign.sms.segments', 'splits into {{n}} segments', { n: segments })}`}
              {' · '}{t('campaign.sms.stopHint', 'STOP unsubscribe text auto-appended')}
            </p>
          </div>
          <div>
            <Label>{t('campaign.sms.senderId', 'Sender ID')}</Label>
            <Input value={value.senderId} disabled />
          </div>
          <Button variant="outline" size="sm" onClick={onTestSend}>
            <Send className="h-4 w-4 mr-1" /> {t('campaign.testSend.button', 'Test send')}
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
```

- [ ] **Step 4: ChannelPanelPush**

```tsx
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Smartphone, Send } from 'lucide-react'
import type { PushPanel } from '@/types/campaign'

export function ChannelPanelPush({
  value, onChange, onTestSend,
}: { value: PushPanel; onChange: (v: PushPanel) => void; onTestSend: () => void }) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <Smartphone className="h-4 w-4" />
        <CardTitle className="text-base flex-1">{t('campaign.channels.push', 'Push')}</CardTitle>
        <Switch checked={value.enabled} onCheckedChange={(v) => onChange({ ...value, enabled: v })} />
      </CardHeader>
      {value.enabled && (
        <CardContent className="space-y-4">
          <div>
            <Label>{t('campaign.push.title', 'Title')}</Label>
            <Input value={value.title} maxLength={50} onChange={(e) => onChange({ ...value, title: e.target.value })} />
            <p className="text-xs text-muted-foreground mt-1">{value.title.length} / 50</p>
          </div>
          <div>
            <Label>{t('campaign.push.body', 'Body')}</Label>
            <Textarea rows={3} maxLength={100} value={value.body} onChange={(e) => onChange({ ...value, body: e.target.value })} />
            <p className="text-xs text-muted-foreground mt-1">{value.body.length} / 100</p>
          </div>
          <div>
            <Label>{t('campaign.push.url', 'Click URL')}</Label>
            <Input value={value.ctaUrl} placeholder="/lobby" onChange={(e) => onChange({ ...value, ctaUrl: e.target.value })} />
          </div>
          <Button variant="outline" size="sm" onClick={onTestSend}>
            <Send className="h-4 w-4 mr-1" /> {t('campaign.testSend.button', 'Test send')}
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
```

- [ ] **Step 5: Add Switch shadcn component if not yet**

If `npx shadcn@latest add switch` was not run earlier, run it now: `npx shadcn@latest add switch`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add 4 channel panel components"
```

---

## Task 24: ScheduleSection component (with Quiet hours warning)

**Files:**
- Create: `src/components/campaign/ScheduleSection.tsx`

- [ ] **Step 1: Implement**

```tsx
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { Schedule } from '@/types/campaign'

function isInQuietHours(iso?: string): boolean {
  if (!iso) return false
  const d = new Date(iso)
  const phHour = (d.getUTCHours() + 8) % 24
  return phHour >= 23 || phHour < 8
}

export function ScheduleSection({
  schedule, ignoreQuietHours, onScheduleChange, onIgnoreQuietHoursChange,
}: {
  schedule: Schedule
  ignoreQuietHours: boolean
  onScheduleChange: (s: Schedule) => void
  onIgnoreQuietHoursChange: (v: boolean) => void
}) {
  const { t } = useTranslation()
  const qh = isInQuietHours(schedule.at)
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{t('campaign.schedule.title', 'Schedule')}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={schedule.type}
          onValueChange={(v) => onScheduleChange({ ...schedule, type: v as Schedule['type'], at: v === 'immediate' ? undefined : schedule.at })}
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="immediate" id="sch-immediate" />
            <Label htmlFor="sch-immediate">{t('campaign.schedule.immediate', 'Send immediately')}</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="datetime" id="sch-later" />
            <Label htmlFor="sch-later">{t('campaign.schedule.later', 'Schedule for later')}</Label>
          </div>
        </RadioGroup>

        {schedule.type === 'datetime' && (
          <div>
            <Label>{t('campaign.schedule.datetime', 'Date & time (PH timezone)')}</Label>
            <Input
              type="datetime-local"
              value={schedule.at ? schedule.at.slice(0, 16) : ''}
              onChange={(e) => onScheduleChange({ ...schedule, at: new Date(e.target.value).toISOString() })}
            />
          </div>
        )}

        {qh && !ignoreQuietHours && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t('campaign.schedule.quietWarning', 'Selected time falls in Quiet Hours (23:00–08:00). SMS / Push will auto-defer to 08:00 next morning unless override is checked.')}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-2">
          <Checkbox
            id="ignore-qh"
            checked={ignoreQuietHours}
            onCheckedChange={(v) => onIgnoreQuietHoursChange(!!v)}
          />
          <Label htmlFor="ignore-qh" className="text-sm">
            {t('campaign.schedule.ignoreQH', 'Override Quiet Hours (time-sensitive only)')}
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add ScheduleSection with Quiet Hours warning"
```

---

## Task 25: Modal components (TestSend, ToggleConfirm, ScheduleConfirm)

**Files:**
- Create: `src/components/campaign/TestSendDialog.tsx`, `src/components/campaign/ToggleConfirmDialog.tsx`, `src/components/campaign/ScheduleConfirmDialog.tsx`

- [ ] **Step 1: TestSendDialog**

```tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { ChannelKey } from '@/types/campaign'

const PLACEHOLDERS: Record<ChannelKey, string> = {
  inApp: 'usr_0001\nusr_0002',
  email: 'test1@brand.ph\ntest2@brand.ph',
  sms: '+63 917 123 4567\n+63 918 234 5678',
  push: 'usr_0001',
}

export function TestSendDialog({
  open, channel, onClose,
}: { open: boolean; channel?: ChannelKey; onClose: () => void }) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  if (!channel) return null
  const recipients = value.split(/[\n,]/).map((s) => s.trim()).filter(Boolean)
  const valid = recipients.length >= 1 && recipients.length <= 5
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('campaign.testSend.title', 'Send test')}</DialogTitle>
          <DialogDescription>
            {t('campaign.testSend.description', 'Send to 1–5 recipients via {{channel}}', { channel })}
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label>{t('campaign.testSend.recipients', 'Recipients')}</Label>
          <Textarea
            rows={4} value={value} onChange={(e) => setValue(e.target.value)}
            placeholder={PLACEHOLDERS[channel]}
          />
          <p className="text-xs text-muted-foreground mt-1">{recipients.length} / 5</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button
            disabled={!valid}
            onClick={() => {
              toast.success(t('campaign.testSend.sent', 'Test send dispatched to {{n}} recipients', { n: recipients.length }))
              setValue('')
              onClose()
            }}
          >
            {t('campaign.testSend.send', 'Send')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: ToggleConfirmDialog**

```tsx
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function ToggleConfirmDialog({
  open, action, recipients, onConfirm, onClose,
}: {
  open: boolean
  action: 'enable' | 'disable'
  recipients: number
  onConfirm: () => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === 'disable'
              ? t('campaign.toggle.disableTitle', 'Disable this campaign?')
              : t('campaign.toggle.enableTitle', 'Enable this campaign?')}
          </DialogTitle>
          <DialogDescription>
            {action === 'disable'
              ? t('campaign.toggle.disableBody', 'It will be hidden from all {{n}} recipients. Read history is preserved.', { n: recipients })
              : t('campaign.toggle.enableBody', 'It will be visible again to all {{n}} recipients. No new toast notifications will be triggered.', { n: recipients })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant={action === 'disable' ? 'destructive' : 'default'} onClick={onConfirm}>
            {action === 'disable' ? t('campaign.toggle.disable', 'Disable') : t('campaign.toggle.enable', 'Enable')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: ScheduleConfirmDialog**

```tsx
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatPlayerCount } from '@/lib/number'
import type { ChannelKey, Exclusions } from '@/types/campaign'

export function ScheduleConfirmDialog({
  open, recipients, exclusions, channels, scheduleLabel, isBroadcast, onConfirm, onClose,
}: {
  open: boolean
  recipients: number
  exclusions: Exclusions
  channels: ChannelKey[]
  scheduleLabel: string
  isBroadcast: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('campaign.scheduleConfirm.title', 'Confirm Schedule')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">{t('campaign.scheduleConfirm.recipients', 'Estimated recipients')}</span>
            <span className="text-2xl font-semibold tabular-nums">{formatPlayerCount(recipients)}</span>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">{t('campaign.scheduleConfirm.excluded', 'Excluded')}</p>
            <ul className="text-sm space-y-1">
              <ExclusionRow label={t('campaign.scheduleConfirm.optOut', 'Marketing opt-out')} value={exclusions.optOut} />
              <ExclusionRow label={t('campaign.scheduleConfirm.frequencyCap', 'Frequency cap')} value={exclusions.frequencyCap} />
              <ExclusionRow label={t('campaign.scheduleConfirm.suppression', 'Suppression list')} value={exclusions.suppression} />
              <ExclusionRow label={t('campaign.scheduleConfirm.unverifiedContact', 'Unverified contact')} value={exclusions.unverifiedContact} />
            </ul>
          </div>
          <div className="text-sm">
            <p><span className="text-muted-foreground">{t('campaign.scheduleConfirm.channels', 'Channels')}: </span>
              {channels.map((c) => t(`campaign.channels.${c}`, c)).join(', ')}
            </p>
            <p><span className="text-muted-foreground">{t('campaign.scheduleConfirm.schedule', 'Schedule')}: </span>{scheduleLabel}</p>
          </div>
          {isBroadcast && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t('campaign.scheduleConfirm.broadcastWarning', 'This is a BROADCAST to all players. Double-check before confirming.')}
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button onClick={onConfirm}>{t('campaign.scheduleConfirm.confirm', 'Confirm Schedule')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ExclusionRow({ label, value }: { label: string; value: number }) {
  return (
    <li className="flex justify-between">
      <span>• {label}</span>
      <span className="tabular-nums">{formatPlayerCount(value)}</span>
    </li>
  )
}
```

- [ ] **Step 4: Add `switch` shadcn component if missing**

```bash
npx shadcn@latest add switch
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Test send / Toggle confirm / Schedule confirm dialogs"
```

---

## Task 26: CampaignForm page (the big composition)

**Files:**
- Create: `src/pages/campaigns/CampaignForm.tsx`
- Modify: `src/router.tsx`

- [ ] **Step 1: Implement**

```tsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AudienceBuilder } from '@/components/campaign/AudienceBuilder'
import { ChannelPanelInApp } from '@/components/campaign/ChannelPanelInApp'
import { ChannelPanelEmail } from '@/components/campaign/ChannelPanelEmail'
import { ChannelPanelSMS } from '@/components/campaign/ChannelPanelSMS'
import { ChannelPanelPush } from '@/components/campaign/ChannelPanelPush'
import { ScheduleSection } from '@/components/campaign/ScheduleSection'
import { TestSendDialog } from '@/components/campaign/TestSendDialog'
import { ScheduleConfirmDialog } from '@/components/campaign/ScheduleConfirmDialog'
import { FormSkeleton } from '@/components/common/LoadingSkeleton'
import { campaignStore } from '@/store/campaigns'
import { estimateRecipients } from '@/lib/audience'
import { players } from '@/mock/players'
import { formatDateTimePHT, type AppLocale } from '@/lib/date'
import type { Campaign, ChannelKey, ChannelPanels } from '@/types/campaign'

const EMPTY: Campaign = {
  id: '', name: '', tags: [], status: 'draft',
  masterAudience: { broadcast: false, conditions: [], logic: 'AND' },
  estimatedRecipients: 0,
  channelPanels: {},
  schedule: { type: 'immediate' },
  ignoreQuietHours: false,
  createdBy: '', createdAt: '', updatedAt: '',
}

const DEFAULTS: Required<{ [K in ChannelKey]: NonNullable<ChannelPanels[K]> }> = {
  inApp: { enabled: true, title: '', category: 'personal', bodyRich: '', triggerToast: false },
  email: { enabled: true, subject: '', preheader: '', htmlBody: '<p>Hello {{username}},</p>', senderFrom: 'noreply' },
  sms: { enabled: true, body: '', senderId: 'BRAND' },
  push: { enabled: true, title: '', body: '', ctaUrl: '/' },
}

export default function CampaignForm() {
  const { t, i18n } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = !!id
  const locale = (i18n.resolvedLanguage as AppLocale) ?? 'en-US'

  const [loading, setLoading] = useState(editing)
  const [draft, setDraft] = useState<Campaign>(EMPTY)
  const [tagsInput, setTagsInput] = useState('')
  const [testSendChannel, setTestSendChannel] = useState<ChannelKey | undefined>()
  const [scheduleConfirmOpen, setScheduleConfirmOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  useEffect(() => {
    if (!editing) return
    const t1 = setTimeout(() => {
      const c = campaignStore.get(id!)
      if (c) {
        setDraft(c)
        setTagsInput(c.tags.join(', '))
      }
      setLoading(false)
    }, 250)
    return () => clearTimeout(t1)
  }, [id, editing])

  const enabledChannels = useMemo<ChannelKey[]>(() =>
    (['inApp','email','sms','push'] as ChannelKey[]).filter((k) => draft.channelPanels[k]?.enabled),
    [draft.channelPanels]
  )

  const estimate = estimateRecipients(draft.masterAudience, players)

  function setPanel<K extends ChannelKey>(key: K, value: NonNullable<ChannelPanels[K]>) {
    setDraft({ ...draft, channelPanels: { ...draft.channelPanels, [key]: value } })
  }

  function ensurePanel<K extends ChannelKey>(key: K): NonNullable<ChannelPanels[K]> {
    return (draft.channelPanels[key] ?? DEFAULTS[key]) as NonNullable<ChannelPanels[K]>
  }

  function validate(): string[] {
    const errs: string[] = []
    if (!draft.name.trim()) errs.push(t('campaign.form.errors.nameRequired', 'Name is required.'))
    if (!draft.masterAudience.broadcast && draft.masterAudience.conditions.length === 0)
      errs.push(t('campaign.form.errors.audienceRequired', 'Add at least one audience condition or enable broadcast.'))
    if (enabledChannels.length === 0)
      errs.push(t('campaign.form.errors.channelRequired', 'Enable at least one channel.'))
    if (draft.schedule.type === 'datetime' && !draft.schedule.at)
      errs.push(t('campaign.form.errors.scheduleAtRequired', 'Pick a date & time for the schedule.'))
    return errs
  }

  function handleSaveDraft() {
    const tags = tagsInput.split(',').map((s) => s.trim()).filter(Boolean)
    const next = { ...draft, tags, estimatedRecipients: estimate, status: 'draft' as const }
    if (editing) {
      campaignStore.update(id!, next)
    } else {
      const created = campaignStore.create(next)
      navigate(`/campaigns/${created.id}/edit`, { replace: true })
    }
    toast.success(t('campaign.form.draftSaved', 'Draft saved'))
  }

  function handleScheduleClick() {
    const errs = validate()
    setValidationErrors(errs)
    if (errs.length === 0) setScheduleConfirmOpen(true)
  }

  function handleScheduleConfirm() {
    const tags = tagsInput.split(',').map((s) => s.trim()).filter(Boolean)
    const status = draft.schedule.type === 'immediate' ? 'active' : 'scheduled'
    const next = { ...draft, tags, estimatedRecipients: estimate, status, exclusions: {
      optOut: Math.floor(estimate * 0.05),
      frequencyCap: Math.floor(estimate * 0.02),
      suppression: Math.floor(estimate * 0.01),
      unverifiedContact: Math.floor(estimate * 0.08),
    } }
    if (editing) campaignStore.update(id!, next)
    else campaignStore.create(next)
    setScheduleConfirmOpen(false)
    toast.success(t('campaign.form.scheduled', 'Campaign scheduled'))
    navigate('/campaigns')
  }

  if (loading) return <FormSkeleton />

  return (
    <div className="pb-24 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          {editing ? t('campaign.form.editTitle', 'Edit Campaign') : t('campaign.form.newTitle', 'New Campaign')}
        </h1>
      </div>

      {validationErrors.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            <ul className="list-disc pl-5">
              {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">{t('campaign.form.basicInfo', 'Basic Info')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('campaign.form.name', 'Campaign Name')}</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div>
              <Label>{t('campaign.form.tags', 'Tags (comma separated)')}</Label>
              <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="seasonal, vip, retention" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t('campaign.form.audience', 'Master Audience')}</CardTitle></CardHeader>
          <CardContent>
            <AudienceBuilder
              value={draft.masterAudience}
              onChange={(v) => setDraft({ ...draft, masterAudience: v })}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-base font-medium">{t('campaign.form.channels', 'Channel Panels')}</h2>
          <ChannelPanelInApp value={ensurePanel('inApp')} onChange={(v) => setPanel('inApp', v)} />
          <ChannelPanelEmail value={ensurePanel('email')} onChange={(v) => setPanel('email', v)} onTestSend={() => setTestSendChannel('email')} />
          <ChannelPanelSMS value={ensurePanel('sms')} onChange={(v) => setPanel('sms', v)} onTestSend={() => setTestSendChannel('sms')} />
          <ChannelPanelPush value={ensurePanel('push')} onChange={(v) => setPanel('push', v)} onTestSend={() => setTestSendChannel('push')} />
        </div>

        <ScheduleSection
          schedule={draft.schedule}
          ignoreQuietHours={draft.ignoreQuietHours}
          onScheduleChange={(s) => setDraft({ ...draft, schedule: s })}
          onIgnoreQuietHoursChange={(v) => setDraft({ ...draft, ignoreQuietHours: v })}
        />
      </div>

      <div className="fixed bottom-0 left-60 right-0 bg-background border-t px-8 py-3 flex justify-between items-center">
        <Button variant="ghost" onClick={() => navigate('/campaigns')}>{t('common.cancel')}</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>{t('common.saveDraft')}</Button>
          <Button onClick={handleScheduleClick}>{t('campaign.form.scheduleButton', 'Schedule…')}</Button>
        </div>
      </div>

      <TestSendDialog
        open={!!testSendChannel}
        channel={testSendChannel}
        onClose={() => setTestSendChannel(undefined)}
      />

      <ScheduleConfirmDialog
        open={scheduleConfirmOpen}
        recipients={estimate}
        exclusions={{
          optOut: Math.floor(estimate * 0.05),
          frequencyCap: Math.floor(estimate * 0.02),
          suppression: Math.floor(estimate * 0.01),
          unverifiedContact: Math.floor(estimate * 0.08),
        }}
        channels={enabledChannels}
        scheduleLabel={
          draft.schedule.type === 'immediate'
            ? t('campaign.schedule.now', 'Immediately')
            : draft.schedule.at ? formatDateTimePHT(draft.schedule.at, locale) : ''
        }
        isBroadcast={draft.masterAudience.broadcast}
        onConfirm={handleScheduleConfirm}
        onClose={() => setScheduleConfirmOpen(false)}
      />
    </div>
  )
}
```

- [ ] **Step 2: Wire into router**

```tsx
// in src/router.tsx, replace the children list
import CampaignForm from '@/pages/campaigns/CampaignForm'
// ...
{ path: 'campaigns/new', element: <CampaignForm /> },
{ path: 'campaigns/:id/edit', element: <CampaignForm /> },
```

- [ ] **Step 3: Verify**

Run `npm run dev`. Test:
- `/#/campaigns/new` — empty form loads
- Try Schedule without filling anything → error list appears
- Fill name, enable broadcast, enable Email, fill subject + body, click Schedule → confirm dialog → Confirm → list shows new campaign
- Edit existing campaign `/#/campaigns/cmp_006/edit` (a draft) → form preloads
- Test Send button on Email panel → dialog opens, enter `test@brand.ph`, Send → toast confirms

Stop server.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: implement Campaign form (new + edit) with validation"
```

---

## Task 27: CampaignDetail page

**Files:**
- Create: `src/pages/campaigns/CampaignDetail.tsx`
- Modify: `src/router.tsx`

- [ ] **Step 1: Implement**

```tsx
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowLeft, Edit, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ToggleConfirmDialog } from '@/components/campaign/ToggleConfirmDialog'
import { FormSkeleton } from '@/components/common/LoadingSkeleton'
import { campaignStore } from '@/store/campaigns'
import { formatDateTimePHT, formatRelativePHT, type AppLocale } from '@/lib/date'
import { formatPlayerCount } from '@/lib/number'
import type { Campaign, ChannelKey } from '@/types/campaign'

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const locale = (i18n.resolvedLanguage as AppLocale) ?? 'en-US'

  const [loading, setLoading] = useState(true)
  const [campaign, setCampaign] = useState<Campaign | undefined>()
  const [toggleAction, setToggleAction] = useState<'enable' | 'disable' | undefined>()

  useEffect(() => {
    const t1 = setTimeout(() => {
      setCampaign(campaignStore.get(id!))
      setLoading(false)
    }, 250)
    return () => clearTimeout(t1)
  }, [id])

  if (loading) return <FormSkeleton />
  if (!campaign) return <p>{t('campaign.detail.notFound', 'Campaign not found.')}</p>

  const enabledChannels = (['inApp','email','sms','push'] as ChannelKey[])
    .filter((k) => campaign.channelPanels[k]?.enabled)

  function applyToggle(action: 'enable' | 'disable') {
    if (!campaign) return
    const next = action === 'disable' ? 'disabled' : 'active'
    campaignStore.setStatus(campaign.id, next)
    setCampaign({ ...campaign, status: next })
    toast.success(
      action === 'disable'
        ? t('campaign.detail.disabledMsg', 'Campaign disabled')
        : t('campaign.detail.enabledMsg', 'Campaign enabled (no new toast notifications)')
    )
    setToggleAction(undefined)
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/campaigns"><ArrowLeft className="h-4 w-4 mr-1" /> {t('common.back')}</Link>
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold">{campaign.name}</h1>
              <StatusBadge status={campaign.status} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {campaign.tags.map((tg) => <Badge key={tg} variant="secondary">{tg}</Badge>)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {campaign.schedule.at && (
                <>
                  {campaign.status === 'scheduled' ? t('campaign.detail.scheduledFor', 'Scheduled for ') : t('campaign.detail.sentOn', 'Sent on ')}
                  {formatDateTimePHT(campaign.schedule.at, locale)} ({formatRelativePHT(campaign.schedule.at, locale)})
                </>
              )}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {campaign.status === 'draft' && (
              <Button asChild><Link to={`/campaigns/${campaign.id}/edit`}><Edit className="h-4 w-4 mr-1" /> {t('common.edit')}</Link></Button>
            )}
            {campaign.status === 'scheduled' && (
              <>
                <Button asChild variant="outline"><Link to={`/campaigns/${campaign.id}/edit`}><Edit className="h-4 w-4 mr-1" /> {t('common.edit')}</Link></Button>
                <Button variant="destructive" onClick={() => { campaignStore.setStatus(campaign.id, 'draft'); setCampaign({ ...campaign, status: 'draft' }); toast.success(t('campaign.detail.scheduleCancelled', 'Schedule cancelled — back to draft')) }}>
                  <X className="h-4 w-4 mr-1" /> {t('campaign.detail.cancelSchedule', 'Cancel Schedule')}
                </Button>
              </>
            )}
            {(campaign.status === 'active' || campaign.status === 'disabled') && (
              <div className="flex items-center gap-2 border rounded-md px-3 py-1.5">
                <span className="text-sm">{campaign.status === 'active' ? t('campaign.detail.enabled', 'Enabled') : t('campaign.detail.disabled', 'Disabled')}</span>
                <Switch
                  checked={campaign.status === 'active'}
                  onCheckedChange={() => setToggleAction(campaign.status === 'active' ? 'disable' : 'enable')}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="audience">
        <TabsList>
          <TabsTrigger value="audience">{t('campaign.detail.tabs.audience', 'Audience')}</TabsTrigger>
          <TabsTrigger value="channels">{t('campaign.detail.tabs.channels', 'Channels')}</TabsTrigger>
          <TabsTrigger value="activity">{t('campaign.detail.tabs.activity', 'Activity')}</TabsTrigger>
        </TabsList>

        <TabsContent value="audience" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{t('campaign.detail.audienceSummary', 'Audience Summary')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('campaign.detail.estimatedRecipients', 'Estimated recipients (snapshot)')}</span>
                <span className="text-2xl font-semibold tabular-nums">{formatPlayerCount(campaign.estimatedRecipients)}</span>
              </div>
              <div>
                {campaign.masterAudience.broadcast ? (
                  <Badge variant="secondary">{t('audience.broadcast', 'Broadcast to all players')}</Badge>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {campaign.masterAudience.conditions.map((c, i) => (
                      <Badge key={i} variant="outline">
                        {t(`audience.conditions.${c.field}`, c.field)}{('op' in c) ? ` ${c.op}` : ''} {('value' in c) ? String(c.value) : ''}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              {campaign.exclusions && (
                <div className="text-sm space-y-1 pt-3 border-t">
                  <p className="font-medium mb-2">{t('campaign.scheduleConfirm.excluded', 'Excluded')}</p>
                  <ExclusionRow label={t('campaign.scheduleConfirm.optOut')} value={campaign.exclusions.optOut} />
                  <ExclusionRow label={t('campaign.scheduleConfirm.frequencyCap')} value={campaign.exclusions.frequencyCap} />
                  <ExclusionRow label={t('campaign.scheduleConfirm.suppression')} value={campaign.exclusions.suppression} />
                  <ExclusionRow label={t('campaign.scheduleConfirm.unverifiedContact')} value={campaign.exclusions.unverifiedContact} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="pt-4">
          {enabledChannels.length === 0 ? (
            <p className="text-muted-foreground">{t('campaign.detail.noChannels', 'No channels enabled.')}</p>
          ) : (
            <Tabs defaultValue={enabledChannels[0]}>
              <TabsList>
                {enabledChannels.map((c) => (
                  <TabsTrigger key={c} value={c}>{t(`campaign.channels.${c}`, c)}</TabsTrigger>
                ))}
              </TabsList>
              {enabledChannels.map((c) => (
                <TabsContent key={c} value={c} className="space-y-4 pt-4">
                  <ChannelPreview campaign={campaign} channel={c} locale={locale} />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </TabsContent>

        <TabsContent value="activity" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <ul className="text-sm space-y-2">
                <li><span className="text-muted-foreground">{formatDateTimePHT(campaign.createdAt, locale)}</span> · {t('campaign.activity.created', 'Created by {{user}}', { user: campaign.createdBy })}</li>
                <li><span className="text-muted-foreground">{formatDateTimePHT(campaign.updatedAt, locale)}</span> · {t('campaign.activity.updated', 'Last updated')}</li>
                {campaign.status === 'disabled' && (
                  <li><span className="text-muted-foreground">{formatDateTimePHT(campaign.updatedAt, locale)}</span> · {t('campaign.activity.disabled', 'Disabled by {{user}}', { user: campaign.createdBy })}</li>
                )}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">{t('campaign.activity.fullLogHint', 'Full audit history is available in the platform Audit Log.')}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ToggleConfirmDialog
        open={!!toggleAction}
        action={toggleAction ?? 'disable'}
        recipients={campaign.estimatedRecipients}
        onConfirm={() => applyToggle(toggleAction!)}
        onClose={() => setToggleAction(undefined)}
      />
    </div>
  )
}

function ExclusionRow({ label, value }: { label: string; value: number }) {
  return <div className="flex justify-between"><span>• {label}</span><span className="tabular-nums">{formatPlayerCount(value)}</span></div>
}

function ChannelPreview({ campaign, channel, locale }: { campaign: Campaign; channel: ChannelKey; locale: AppLocale }) {
  const { t } = useTranslation()
  const progress = campaign.sendingProgress?.perChannel[channel]
  const panel = campaign.channelPanels[channel]
  if (!panel) return null

  return (
    <div className="space-y-4">
      {progress && (
        <Card>
          <CardContent className="pt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('campaign.detail.progress', 'Sending progress')}</span>
              <span className="tabular-nums">{formatPlayerCount(progress.sent)} / {formatPlayerCount(progress.total)}</span>
            </div>
            <Progress value={progress.total ? (progress.sent / progress.total) * 100 : 0} />
            <p className="text-xs text-muted-foreground">{t('campaign.detail.lastUpdate', 'Last update')}: {formatDateTimePHT(progress.lastUpdate, locale)}</p>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle className="text-base">{t('campaign.detail.contentPreview', 'Content preview')}</CardTitle></CardHeader>
        <CardContent>
          {channel === 'inApp' && 'title' in panel && (
            <div>
              <p className="font-medium">{(panel as { title: string }).title}</p>
              <p className="text-sm whitespace-pre-wrap mt-1">{(panel as { bodyRich: string }).bodyRich}</p>
            </div>
          )}
          {channel === 'email' && 'subject' in panel && (
            <div className="space-y-2">
              <p><strong>{t('campaign.email.subject')}:</strong> {(panel as { subject: string }).subject}</p>
              <p className="text-sm text-muted-foreground">{(panel as { preheader: string }).preheader}</p>
              <iframe srcDoc={(panel as { htmlBody: string }).htmlBody} title="Email preview" className="w-full border rounded-md h-48 bg-white" />
            </div>
          )}
          {channel === 'sms' && 'body' in panel && !('subject' in panel) && !('htmlBody' in panel) && (
            <div className="bg-muted rounded-2xl px-4 py-3 max-w-sm">
              <p className="text-sm whitespace-pre-wrap">{(panel as { body: string }).body}</p>
            </div>
          )}
          {channel === 'push' && 'title' in panel && 'ctaUrl' in panel && (
            <div className="border rounded-lg p-3 max-w-sm bg-card shadow-sm">
              <p className="text-xs text-muted-foreground mb-1">brand.ph</p>
              <p className="font-medium text-sm">{(panel as { title: string }).title}</p>
              <p className="text-sm">{(panel as { body: string }).body}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Wire into router**

```tsx
import CampaignDetail from '@/pages/campaigns/CampaignDetail'
// ...
{ path: 'campaigns/:id', element: <CampaignDetail /> },
```

- [ ] **Step 3: Verify**

Run `npm run dev`. Test:
- Click an Active campaign in list → Detail loads with green progress bars per channel
- Disable toggle → confirm dialog → status flips, toast appears
- Re-enable → toast confirms (no new push notification phrasing)
- Click Scheduled campaign → see countdown / Cancel Schedule / Edit
- Click Draft → see Edit only
- Switch language to 中文 → all labels update

Stop server.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: implement Campaign Detail with status-aware actions"
```

---

## Task 28: Backfill all i18n strings (zh-TW translations)

**Files:**
- Modify: `src/i18n/en.json`, `src/i18n/zh-TW.json`

- [ ] **Step 1: Compile final EN keys**

Open both translation files. For every `t('key', 'fallback')` used in components from Tasks 13-27, ensure the key exists in `en.json`. Suggested grouping (replace files entirely):

`src/i18n/en.json` — full set:
```json
{
  "nav": { "campaigns": "Campaigns", "auditLog": "Audit Log" },
  "topbar": { "brand": "Admin Console", "logout": "Sign out" },
  "common": {
    "cancel": "Cancel", "save": "Save", "saveDraft": "Save as Draft",
    "delete": "Delete", "confirm": "Confirm", "close": "Close",
    "edit": "Edit", "loading": "Loading…", "search": "Search",
    "clearFilters": "Clear filters", "back": "Back",
    "previous": "Previous", "next": "Next"
  },
  "auditLogStub": {
    "title": "Redirecting to platform Audit Log",
    "body": "In production this opens the existing platform-wide audit log page (out of scope for this prototype)."
  },
  "notFound": { "body": "The page you are looking for does not exist." },
  "campaign": {
    "list": {
      "title": "Campaigns",
      "newButton": "New Campaign",
      "errorTitle": "Something went wrong",
      "errorBody": "We could not load campaigns. Please try again.",
      "retry": "Retry",
      "pageOf": "Page {{page}} of {{total}}",
      "empty": { "title": "No campaigns yet", "body": "Create your first campaign to start reaching players." },
      "filterEmpty": { "title": "No campaigns match your filters", "body": "Try adjusting your filters or clearing them." }
    },
    "filters": { "status": "Status", "channels": "Channels", "createdBy": "Created by" },
    "table": { "name": "Name", "tags": "Tags", "channels": "Channels", "audience": "Audience", "schedule": "Schedule", "status": "Status", "createdBy": "Created by", "updated": "Updated" },
    "status": { "draft": "Draft", "scheduled": "Scheduled", "active": "Active", "disabled": "Disabled" },
    "channels": { "inApp": "In-App", "email": "Email", "sms": "SMS", "push": "Push" },
    "form": {
      "newTitle": "New Campaign", "editTitle": "Edit Campaign",
      "basicInfo": "Basic Info", "name": "Campaign Name", "tags": "Tags (comma separated)",
      "audience": "Master Audience", "channels": "Channel Panels",
      "title": "Title", "category": "Category", "body": "Body",
      "scheduleButton": "Schedule…",
      "draftSaved": "Draft saved",
      "scheduled": "Campaign scheduled",
      "errors": {
        "nameRequired": "Name is required.",
        "audienceRequired": "Add at least one audience condition or enable broadcast.",
        "channelRequired": "Enable at least one channel.",
        "scheduleAtRequired": "Pick a date & time for the schedule."
      }
    },
    "inApp": {
      "personal": "Personal", "promo": "Promotion", "announcement": "Announcement",
      "richHint": "Rich text editor placeholder — supports bold, links, inline images in production",
      "triggerToast": "Trigger toast notification"
    },
    "email": { "subject": "Subject", "preheader": "Preheader", "sender": "Sender From", "body": "HTML Body", "preview": "Preview" },
    "sms": { "body": "Message", "chars": "chars", "segments": "splits into {{n}} segments", "stopHint": "STOP unsubscribe text auto-appended", "senderId": "Sender ID" },
    "push": { "title": "Title", "body": "Body", "url": "Click URL" },
    "schedule": {
      "title": "Schedule",
      "immediate": "Send immediately", "later": "Schedule for later",
      "datetime": "Date & time (PH timezone)",
      "now": "Immediately",
      "ignoreQH": "Override Quiet Hours (time-sensitive only)",
      "quietWarning": "Selected time falls in Quiet Hours (23:00–08:00). SMS / Push will auto-defer to 08:00 next morning unless override is checked."
    },
    "scheduleConfirm": {
      "title": "Confirm Schedule",
      "recipients": "Estimated recipients",
      "excluded": "Excluded",
      "optOut": "Marketing opt-out",
      "frequencyCap": "Frequency cap",
      "suppression": "Suppression list",
      "unverifiedContact": "Unverified contact",
      "channels": "Channels",
      "schedule": "Schedule",
      "broadcastWarning": "This is a BROADCAST to all players. Double-check before confirming.",
      "confirm": "Confirm Schedule"
    },
    "testSend": {
      "button": "Test send",
      "title": "Send test",
      "description": "Send to 1–5 recipients via {{channel}}",
      "recipients": "Recipients",
      "send": "Send",
      "sent": "Test send dispatched to {{n}} recipients"
    },
    "toggle": {
      "disableTitle": "Disable this campaign?",
      "disableBody": "It will be hidden from all {{n}} recipients. Read history is preserved.",
      "enableTitle": "Enable this campaign?",
      "enableBody": "It will be visible again to all {{n}} recipients. No new toast notifications will be triggered.",
      "disable": "Disable",
      "enable": "Enable"
    },
    "detail": {
      "notFound": "Campaign not found.",
      "scheduledFor": "Scheduled for ",
      "sentOn": "Sent on ",
      "cancelSchedule": "Cancel Schedule",
      "scheduleCancelled": "Schedule cancelled — back to draft",
      "enabled": "Enabled", "disabled": "Disabled",
      "enabledMsg": "Campaign enabled (no new toast notifications)",
      "disabledMsg": "Campaign disabled",
      "tabs": { "audience": "Audience", "channels": "Channels", "activity": "Activity" },
      "audienceSummary": "Audience Summary",
      "estimatedRecipients": "Estimated recipients (snapshot)",
      "noChannels": "No channels enabled.",
      "progress": "Sending progress",
      "lastUpdate": "Last update",
      "contentPreview": "Content preview"
    },
    "activity": {
      "created": "Created by {{user}}",
      "updated": "Last updated",
      "disabled": "Disabled by {{user}}",
      "fullLogHint": "Full audit history is available in the platform Audit Log."
    }
  },
  "audience": {
    "broadcast": "Broadcast to all players",
    "addCondition": "Add condition",
    "combineWith": "Combine conditions with",
    "estimateLabel": "Estimated recipients",
    "conditions": {
      "vipTier": "VIP Tier",
      "playerStatus": "Player Status",
      "firstDeposit": "First Deposit",
      "registrationDays": "Registered (days)",
      "cumulativeDeposit": "Cumulative Deposit",
      "verifiedContact": "Verified Contact"
    },
    "values": {
      "active": "Active", "dormant": "Dormant", "churned": "Churned",
      "yes": "Yes", "no": "No",
      "emailOnly": "Email", "phoneOnly": "Phone", "both": "Both"
    },
    "units": { "days": "days" }
  }
}
```

- [ ] **Step 2: Mirror to `zh-TW.json` with translations**

Provide a complete zh-TW translation. Key mappings:
- `nav.campaigns` → `行銷活動`
- `nav.auditLog` → `稽核日誌`
- `topbar.brand` → `後台主控台`
- `common.cancel` → `取消`, `save` → `儲存`, `saveDraft` → `存為草稿`, `delete` → `刪除`, `confirm` → `確認`, `close` → `關閉`, `edit` → `編輯`, `loading` → `載入中…`, `search` → `搜尋`, `clearFilters` → `清除篩選`, `back` → `返回`, `previous` → `上一頁`, `next` → `下一頁`
- `campaign.list.title` → `行銷活動`, `newButton` → `新增 Campaign`, `errorTitle` → `發生錯誤`, `errorBody` → `無法載入活動，請稍後再試。`, `retry` → `重試`, `pageOf` → `第 {{page}} / {{total}} 頁`
- `campaign.list.empty.title` → `尚無 Campaign`, `body` → `建立第一個 Campaign 開始觸達玩家。`
- `campaign.list.filterEmpty.title` → `沒有符合篩選的 Campaign`, `body` → `試著調整或清除篩選條件。`
- `campaign.filters.status` → `狀態`, `channels` → `通道`, `createdBy` → `建立者`
- `campaign.table.*` → `名稱 / 標籤 / 通道 / 受眾 / 排程 / 狀態 / 建立者 / 更新時間`
- `campaign.status.draft` → `草稿`, `scheduled` → `排程中`, `active` → `啟用中`, `disabled` → `已停用`
- `campaign.channels.inApp` → `站內信`, `email` → `Email`, `sms` → `SMS`, `push` → `Push`
- `campaign.form.newTitle` → `新增 Campaign`, `editTitle` → `編輯 Campaign`, `basicInfo` → `基本資訊`, `name` → `Campaign 名稱`, `tags` → `標籤（以逗號分隔）`, `audience` → `主受眾`, `channels` → `通道面板`, `title` → `標題`, `category` → `分類`, `body` → `內文`, `scheduleButton` → `排程…`, `draftSaved` → `草稿已儲存`, `scheduled` → `Campaign 已排程`
- `campaign.form.errors.nameRequired` → `請填寫名稱。`, `audienceRequired` → `至少新增一個受眾條件，或啟用全站廣播。`, `channelRequired` → `至少啟用一個通道。`, `scheduleAtRequired` → `請選擇排程時間。`
- `campaign.inApp.personal` → `個人訊息`, `promo` → `活動優惠`, `announcement` → `系統公告`, `richHint` → `富文字編輯器示意 — 上線時支援粗體、連結、內嵌圖片`, `triggerToast` → `觸發 toast 通知`
- `campaign.email.subject` → `主旨`, `preheader` → `Preheader`, `sender` → `寄件者`, `body` → `HTML 內文`, `preview` → `預覽`
- `campaign.sms.body` → `訊息內容`, `chars` → `字`, `segments` → `將分為 {{n}} 段傳送`, `stopHint` → `STOP 退訂提示由系統自動附加`, `senderId` → `Sender ID`
- `campaign.push.title` → `標題`, `body` → `內文`, `url` → `跳轉 URL`
- `campaign.schedule.title` → `排程`, `immediate` → `立即發送`, `later` → `排程於未來`, `datetime` → `日期與時間（PH 時區）`, `now` → `立即`, `ignoreQH` → `忽略 Quiet Hours（時效訊息專用）`, `quietWarning` → `所選時間落在 Quiet Hours（23:00–08:00）。SMS / Push 將自動延後至次日 08:00 發送，除非勾選忽略。`
- `campaign.scheduleConfirm.title` → `確認排程`, `recipients` → `預估發送人數`, `excluded` → `排除`, `optOut` → `行銷退訂`, `frequencyCap` → `頻率上限`, `suppression` → `Suppression 名單`, `unverifiedContact` → `未驗證 contact`, `channels` → `通道`, `schedule` → `排程`, `broadcastWarning` → `這是「全站廣播」，將發送給所有玩家。請再次確認。`, `confirm` → `確認排程`
- `campaign.testSend.button` → `試發`, `title` → `測試發送`, `description` → `透過 {{channel}} 發送給 1–5 位收件人`, `recipients` → `收件人`, `send` → `發送`, `sent` → `已發送試發給 {{n}} 位收件人`
- `campaign.toggle.disableTitle` → `要停用此 Campaign？`, `disableBody` → `將對所有 {{n}} 位收件人隱藏。已讀歷史保留。`, `enableTitle` → `要啟用此 Campaign？`, `enableBody` → `將對所有 {{n}} 位收件人重新顯示。不會再次觸發 toast 通知。`, `disable` → `停用`, `enable` → `啟用`
- `campaign.detail.notFound` → `找不到此 Campaign。`, `scheduledFor` → `預計發送：`, `sentOn` → `已發送：`, `cancelSchedule` → `取消排程`, `scheduleCancelled` → `已取消排程 — 回到草稿`, `enabled` → `啟用中`, `disabled` → `已停用`, `enabledMsg` → `Campaign 已重新啟用（不會重新觸發 toast）`, `disabledMsg` → `Campaign 已停用`, `tabs.audience` → `受眾`, `channels` → `通道`, `activity` → `活動紀錄`, `audienceSummary` → `受眾摘要`, `estimatedRecipients` → `預估發送人數（送出時 snapshot）`, `noChannels` → `未啟用任何通道。`, `progress` → `發送進度`, `lastUpdate` → `最後更新`, `contentPreview` → `內容預覽`
- `campaign.activity.created` → `由 {{user}} 建立`, `updated` → `最後更新`, `disabled` → `由 {{user}} 停用`, `fullLogHint` → `完整稽核紀錄請至平台稽核日誌頁查看。`
- `audience.broadcast` → `全站廣播`, `addCondition` → `新增條件`, `combineWith` → `條件邏輯`, `estimateLabel` → `預估發送人數`, `conditions.vipTier` → `VIP 等級`, `playerStatus` → `玩家狀態`, `firstDeposit` → `首存狀態`, `registrationDays` → `註冊天數`, `cumulativeDeposit` → `累計存款`, `verifiedContact` → `已驗證 contact`
- `audience.values.active` → `活躍`, `dormant` → `沉睡`, `churned` → `流失`, `yes` → `是`, `no` → `否`, `emailOnly` → `Email`, `phoneOnly` → `Phone`, `both` → `兩者皆已驗證`
- `audience.units.days` → `天`
- `auditLogStub.title` → `導向平台稽核日誌`, `body` → `正式環境會跳轉至既有的平台稽核日誌頁（不在本 prototype 範圍）。`
- `notFound.body` → `您要找的頁面不存在。`

Compose the full JSON mirroring the structure of `en.json`.

- [ ] **Step 2: Switch language and visually scan all pages**

Run `npm run dev`. Toggle to 中文. Click through:
- Campaign list (with filters, search)
- New Campaign form (all sections)
- Detail page (each tab, each status)
- All modals (Test send, Schedule confirm, Toggle confirm)

Look for any leftover EN strings — if found, add the missing key to both files.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "i18n: complete EN + zh-TW translations for all surfaces"
```

---

## Task 29: README + screenshots

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace README**

```markdown
# igaming-admin-prototype

Clickable UI prototype for the iGaming platform's unified Campaign 後台 (covers both in-app and outbound messaging product specs).

**Live demo:** https://<github-username>.github.io/igaming-admin-prototype/

## Audience

- **PH operations / CS team** — user testing the messaging admin flow
- **TW RD** — handoff reference for production implementation

## Stack

Vite · React 18 · TypeScript (strict) · Tailwind · shadcn/ui · react-i18next · react-router (HashRouter) · Vitest

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
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "docs: README with stack, run instructions, and demo state hints"
```

---

## Task 30: Final verification + push

- [ ] **Step 1: Run full test suite**

```bash
npm run test:run
```
Expected: all tests pass.

- [ ] **Step 2: Build production bundle**

```bash
npm run build
```
Expected: `dist/` produced without errors.

- [ ] **Step 3: Smoke test prod build locally**

```bash
npm run preview
```
Open the printed URL. Click through all flows. Stop server.

- [ ] **Step 4: Push to GitHub**

```bash
git push origin main
```
Watch the Actions run. Visit `https://<user>.github.io/igaming-admin-prototype/` once deploy is green.

- [ ] **Step 5: Sanity check the deployed site**

- Campaign list loads
- Click a row → Detail loads
- Switch language → labels update
- Open a draft → Edit form preloads
- New Campaign → fill out → Schedule → see in list
- Refresh page → mock data resets to seed (expected)

- [ ] **Step 6: Report status**

Plan complete. Ship.

---

## Self-Review

**1. Spec coverage:**
- Admin shell (topbar + sidebar + lang switcher) — Tasks 14–17 ✓
- Campaign list with filters, search, all states, pagination — Tasks 19–21 ✓
- Campaign Form (basic info, audience builder, 4 channel panels, schedule) — Tasks 22–26 ✓
- Campaign Detail with status-aware actions, tabs, progress, activity — Task 27 ✓
- Modals: Schedule confirm, Toggle confirm, Test send, Audit log stub — Tasks 16, 25 ✓
- Mock data: 16 campaigns / ~120 players / 4 ops — Tasks 6, 7, 11 ✓
- Tech stack: Vite, React TS strict, Tailwind, shadcn, i18next, HashRouter — Tasks 1–4, 13, 17 ✓
- Visual language: Inter + Noto Sans TC, indigo-600 brand, status colors — Task 2, 18 ✓
- i18n EN default + zh-TW switcher with localStorage — Task 13–14 ✓
- Date/time PH timezone + PHP currency formatters — Tasks 9, 10 ✓
- Audience estimator from conditions — Task 8 ✓
- GH Pages deploy via Actions — Task 4, 30 ✓
- All states (empty / loading / error / long list / filter-empty / form errors / Quiet hours warning) — Tasks 18, 21, 24, 26 ✓

**2. Placeholder scan:** No "TBD", no "implement later". Each task has runnable code. The 16-campaign seed in Task 11 has 1 fully-written entry + a structured list of 15 more with explicit fields — RD fills the same shape.

**3. Type consistency:**
- `Campaign`, `ChannelKey`, `CampaignStatus`, `MasterAudience`, `AudienceCondition` types defined in Task 5 and used consistently in 6, 7, 8, 11, 12, 18–27.
- `formatDateTimePHT(iso, locale)` signature stable across Tasks 9 → 20, 27.
- `estimateRecipients(ma, pool)` signature stable Task 8 → 22, 26.
- `t('key', 'fallback')` pattern used consistently; backfilled in Task 28.
- `campaignStore.{list, get, create, update, setStatus, remove, reset}` API stable Task 12 → 21, 26, 27.

No drift detected.

---

# iGaming 訊息中心後台 Prototype — Design Spec

- **版本**：v0.1
- **日期**：2026-04-30
- **狀態**：待 review
- **延伸自**：
  - [站內信系統設計](../../../../igaming-product-specs/docs/specs/2026-04-24-in-app-messaging-design.md)
  - [站外信系統設計](../../../../igaming-product-specs/docs/specs/2026-04-29-outbound-messaging-design.md)

---

## 1. Overview

本 prototype 是兩份 product spec 的可點擊 UI mock。**目的雙軌**：

- **B：給 TW RD 當 handoff 參考** — 覆蓋大部分畫面與所有狀態（empty / loading / error / long list），讓 RD 可以照刻 UI
- **C：給 PH 在地 ops / CS 做 user testing** — 完整互動跑得通，能點過完整流程（建草稿 → 排程 → 撤回 → 看紀錄），mock 資料具真實感

部署到 GitHub Pages，push 到 `main` 自動上線。

### 1.1 範圍邊界

兩份 product spec 涵蓋很廣，本 prototype **聚焦在後台 surface**：

**做**：
- 統一的 Campaign 後台（站外信 spec §2.3 寫明的「升級」終態，站內信變成 4 個 channel panel 之一，不獨立存在）
- Campaign 列表 / 新增 / 編輯 / 詳情
- 啟用/停用 撤回流程
- 排程確認與排除明細
- Test send

**不做**：
- 玩家收件匣、玩家通知偏好頁（前台，本 prototype 範圍外）
- 自動發信範本管理 UI（spec 明確說範本走 config，無 UI）
- 客服 suppression 管理 UI（spec §9.4 明確說 MVP 不做）
- 完整 audit log 頁（既有平台頁，僅 stub 連結）
- Multi-step wizard（單頁長表單對「編輯既有 Campaign」場景較佳）
- 假登入畫面（minimal shell：直接進入 Campaign 列表，假帳號顯示在 topbar 即可）

---

## 2. 設計目標的優先順序

當權衡時依此順序：

1. **互動跑得通到底**（C 目標）— 點得進、點得回、按鈕都有反應
2. **狀態完整**（B 目標）— 每個頁面 empty / loading / error / long list 都有
3. **視覺現代簡潔** — Linear / Stripe Dashboard 風格，不過度設計
4. **資料具真實感** — PH 市場（PHP、+63、Globe/Smart）、~16 筆 Campaign 跨各狀態 / channel

---

## 3. Information Architecture

### 3.1 Admin Shell（minimal）

```
┌─────────────────────────────────────────────────────────────┐
│ [brand]  Admin Console               EN ▾  ops_anna ▾        │  ← topbar
├──────────┬──────────────────────────────────────────────────┤
│          │                                                   │
│ ▸ Campaigns                                                  │  ← 主頁，預設打開
│ ▸ Audit Log  →  跳出 stub dialog「導向既有平台 audit log」   │
│          │                                                   │
│ sidebar  │                main content                       │
│ 240px    │                max-width 1280px                   │
└──────────┴──────────────────────────────────────────────────┘
```

- topbar：brand + 語系切換器（EN ⇄ 中文）+ 假帳號名 + 登出按鈕（不真實作）
- sidebar：240px 寬，當前頁高亮
- main：max-width 1280px 置中，padding 32px

### 3.2 頁面清單（5 個）

| # | Route | 頁面 | 用途 |
|---|-------|------|------|
| 1 | `/campaigns` | Campaign List | 全部 Campaign 表格 + 篩選 + 搜尋 |
| 2 | `/campaigns/new` | Campaign Form (create) | 新增 Campaign 表單 |
| 3 | `/campaigns/:id/edit` | Campaign Form (edit) | 編輯既有 Campaign（草稿、排程中可改） |
| 4 | `/campaigns/:id` | Campaign Detail | 檢視 Campaign，含發送進度與啟用/停用切換 |
| 5 | `/404` | Not Found | 不存在的路徑 fallback |

### 3.3 全域 Modal / Dialog

- **Schedule 確認**：送出前彈窗，顯示預估發送人數 + 排除明細
- **全站廣播二次確認**：對「全站」audience 多一層警告
- **啟用/停用切換確認**：影響所有收件人，二次確認
- **Test send**：1–5 個 user ID / email / phone 試發
- **Audit log 跳轉提示**：點 sidebar audit log 時跳「即將導向既有平台 audit log」stub
- **Quiet hours 警示 inline banner**：當排程時段落在 23:00–08:00 SMS/Push 時提示

---

## 4. 頁面細節

### 4.1 Campaign List (`/campaigns`)

**Layout**：
- 頁面標題「Campaigns」+ 右上「+ New Campaign」按鈕
- 篩選列：狀態 multi-select、Channel multi-select（依 spec §7.6 「啟用了哪些 channel」）、日期範圍 picker、建立者 multi-select
- 搜尋框：依名稱模糊查詢
- 表格欄位：Name / Tags / Channels（icon group）/ Audience（人數估算 snapshot）/ Schedule / Status（chip）/ Created by / Updated at
- 分頁：每頁 20 筆 + 上一頁/下一頁

**狀態覆蓋**：
- Empty（首次使用）：插畫 + 「No campaigns yet」+ 「Create your first campaign」CTA
- Loading：表格 skeleton 5 列
- Long list（16 筆 mock 全顯示就跨 2 頁）：分頁正常運作
- Filter 結果為空：「No campaigns match your filters」+ 「Clear filters」連結
- Error：「Something went wrong」+ retry button（mock 故意觸發用 query string `?error=1`）

### 4.2 Campaign Form (`/campaigns/new`, `/campaigns/:id/edit`)

**Layout**（單頁長表單，垂直分區）：

1. **Basic Info card**
   - Campaign Name（必填）
   - Tags（自由輸入多個 tag）

2. **Master Audience card**
   - Audience Builder：6 個條件可選（VIP Tier / 玩家狀態 / 首存狀態 / 註冊時間範圍 / 累計存款級距 / 已驗證 contact 狀態），AND/OR 切換
   - 「+ Add condition」按鈕
   - 即時顯示「Estimated recipients: N players」（mock 估算邏輯：依條件對 mock player pool 計算）
   - 全站廣播：勾選「Broadcast to all players」覆蓋上述條件

3. **Channel Panels card**（4 個 sub-card，每個 collapsible，header 有 enable toggle）
   - **In-App Panel**：Title / Category / Body（簡單 rich text editor）/ CTA（optional）/ Trigger Toast checkbox / Audience filter
   - **Email Panel**：Subject / Preheader / HTML body（從 default template 改，preview 即時 render）/ Sender From dropdown（noreply@ / promo@ / vip@）/ Audience filter（建議「Verified Email only」）/ Test send 按鈕
   - **SMS Panel**：Body（160 字計數器、超過顯示分段警示）/ Sender ID（系統預設灰色 readonly）/ Audience filter（建議「Verified Phone only」）/ Test send 按鈕
   - **Push Panel**：Title（≤50 字計數器）/ Body（≤100 字計數器）/ Click URL / Icon preview（brand logo readonly）/ Audience filter（自動排除未授權 push 玩家）/ Test send 按鈕

4. **Schedule card**
   - 「Send immediately」 vs 「Schedule for later」radio
   - DateTime picker（PH timezone 顯示）
   - Per-panel override（accordion 展開：可為各 channel 獨立設定發送時間）
   - 「Ignore Quiet Hours」checkbox（勾選時旁邊紅字警示）

5. **Sticky Bottom Action Bar**：
   - 左：「Save as Draft」secondary
   - 右：「Schedule…」primary（觸發 Schedule 確認 modal）

**狀態覆蓋**：
- 欄位驗證錯誤（紅框 + 下方錯誤訊息）
- 「未啟用任何 channel」error：點 Schedule 時阻擋
- Quiet hours inline warning：排程時段違規時即時跳出
- Edit mode：載入 mock data 預填（loading skeleton 期間）
- 自動存草稿提示（mock：每 30 秒在 sticky bar 顯示「Draft saved」）

### 4.3 Campaign Detail (`/campaigns/:id`)

**Header**：
- Campaign name（大字）+ Status chip
- Schedule info（如「Scheduled for Apr 30 10:00 PHT」）
- 操作按鈕：依狀態變化
  - 草稿：Continue Editing / Delete
  - 排程中：Edit / Cancel Schedule
  - 啟用中：Disable（toggle，二次確認）
  - 已停用：Enable（toggle，二次確認，不重發 toast）

**Tabs**：

1. **Audience tab**
   - Master audience 條件展示（read-only chips）
   - 估算人數 + 排除明細（snapshot 在送出當下計算）

2. **Channels tab**（每個啟用 channel 為 sub-tab）
   - 該 channel 內容預覽（Email：iframe 渲染 HTML / SMS：手機 mockup 顯示 / Push：notification card 模擬）
   - 該 channel 發送進度（啟用中時）：「Sent 23,000 / 50,000」+ progress bar
   - 該 channel audience filter（如有）

3. **Activity tab**
   - 最近 5 筆 audit 事件（建立 / 編輯 / 啟用切換 / 排程修改 等）
   - 「View full audit log →」連結到 stub dialog

**狀態覆蓋**：
- 草稿：無進度條、操作為「Continue Editing」
- 排程中：倒數計時 / Cancel Schedule
- 啟用中：per-channel 進度條 + Disable toggle
- 已停用：灰階 + Enable recovery hint
- Loading：整個 detail 區 skeleton

### 4.4 Modals

#### Schedule 確認 modal
```
┌──────────────────────────────────────────┐
│ Confirm Schedule                          │
├──────────────────────────────────────────┤
│ Estimated recipients: 24,317              │
│                                            │
│ Excluded:                                  │
│  • Marketing opt-out:        1,203        │
│  • Frequency cap:              486        │
│  • Suppression list:           218        │
│  • Unverified contact:       1,876        │
│                                            │
│ Channels: In-App, Email, SMS              │
│ Schedule: 2026-05-01 10:00 PHT            │
│                                            │
│            [Cancel]   [Confirm Schedule]   │
└──────────────────────────────────────────┘
```

對「全站廣播」追加紅色警告區塊。

#### Test Send modal
- Channel selector（已啟用的 channels）
- Recipients 輸入：1–5 個 user ID / email / phone（依 channel）
- Send button → mock toast「Test send dispatched to 3 recipients」

#### Toggle 確認 modal
- 文案區分啟用 vs 停用（停用 = 撤回對玩家可見性）
- 顯示影響玩家數
- 二次確認

---

## 5. 主要互動流（user testing 驗證路徑）

### Flow A：建立 Campaign 走完一條線（happy path）
1. `/campaigns` → 點「+ New Campaign」
2. 填名稱「2026 Mother's Day Promo」、加 tag「seasonal」
3. Master audience：VIP ≥3 AND 已驗證 Email AND 註冊 ≤90 天 → Estimated 8,432 players
4. 啟用 Email panel：填 subject、preheader、HTML body（從 template 改）
5. 啟用 SMS panel：填 160 字 body
6. Test send Email 給自己（mock 收到 toast 確認）
7. Schedule 設明天 10:00 PHT
8. 點 Schedule → 確認 modal 看排除明細
9. Confirm → 跳回列表，看到「Scheduled」狀態的新 row

### Flow B：撤回流（停用 → 啟用）
1. 列表中點一個「Active」Campaign
2. Detail 頁 → 點 Disable toggle
3. 二次確認 modal「This will hide the campaign from all recipients. Continue?」
4. Confirm → 狀態 chip 變「Disabled」
5. 點 Enable → 回到 Active（toast 提示「Campaign re-enabled. Recipients won't receive a new toast notification.」）

### Flow C：篩選找特定 Campaign
1. 列表 → 篩選「Status: Disabled」+「Channels: SMS」+「Date: Last 30 days」
2. 表格收斂到 2 筆
3. 點 Clear filters → 回到全部

### Flow D：編輯排程中的 Campaign
1. 列表中點「Scheduled」Campaign
2. Detail → 點 Edit
3. Form 載入既有資料（loading skeleton）
4. 改 schedule 時間
5. Save → 回 Detail 頁顯示新時間

### Flow E：語系切換
1. Topbar 點 EN dropdown → 選中文
2. 整個介面立即重新 render 為 zh-TW
3. 重新整理頁面 → 仍記住中文（localStorage）

---

## 6. Campaign 資料模型

```ts
type Status = 'draft' | 'scheduled' | 'active' | 'disabled'

type AudienceCondition =
  | { field: 'vipTier', op: '>=' | '<=' | '=', value: number }
  | { field: 'playerStatus', value: 'active' | 'dormant' | 'churned' }
  | { field: 'firstDeposit', value: 'yes' | 'no' }
  | { field: 'registrationDays', op: '<=' | '>=', value: number }
  | { field: 'cumulativeDeposit', value: '0-100' | '100-1000' | '1000-5000' | '5000+' }
  | { field: 'verifiedContact', value: 'email' | 'phone' | 'both' }

type Campaign = {
  id: string
  name: string
  tags: string[]
  status: Status
  masterAudience: {
    broadcast: boolean
    conditions: AudienceCondition[]
    logic: 'AND' | 'OR'
  }
  estimatedRecipients: number
  channelPanels: {
    inApp?: {
      enabled: boolean
      title: string
      category: 'personal' | 'promo' | 'announcement'
      bodyRich: string
      cta?: { label: string, url: string }
      triggerToast: boolean
      audienceFilter?: AudienceCondition[]
    }
    email?: {
      enabled: boolean
      subject: string
      preheader: string
      htmlBody: string
      senderFrom: 'noreply' | 'promo' | 'vip'
      audienceFilter?: AudienceCondition[]
    }
    sms?: {
      enabled: boolean
      body: string
      senderId: string
      audienceFilter?: AudienceCondition[]
    }
    push?: {
      enabled: boolean
      title: string
      body: string
      ctaUrl: string
      audienceFilter?: AudienceCondition[]
    }
  }
  schedule: {
    type: 'immediate' | 'datetime'
    at?: string
    perPanelOverrides?: Partial<Record<'inApp'|'email'|'sms'|'push', string>>
  }
  ignoreQuietHours: boolean
  sendingProgress?: {
    perChannel: Record<'inApp'|'email'|'sms'|'push', { sent: number, total: number, lastUpdate: string }>
  }
  exclusions?: {
    optOut: number
    frequencyCap: number
    suppression: number
    unverifiedContact: number
  }
  createdBy: string
  createdAt: string
  updatedAt: string
}
```

---

## 7. Mock 資料

### 7.1 Campaigns（16 筆，covering 各狀態 / 各 channel 組合）

| # | 名稱 | 狀態 | Channels | Audience |
|---|------|------|---------|----------|
| 1 | 2026 Lunar New Year Double Deposit Bonus | Active | In-App + Email + SMS + Push | Broadcast, verified email |
| 2 | VIP July Exclusive High Rebate | Active | In-App + Email | VIP ≥ 5 |
| 3 | Slot Tournament Sign-up Reminder | Scheduled (T+1 10:00) | In-App + Push | Active + first-deposited |
| 4 | KYC Resubmission Reminder (Dormant) | Active | Email + SMS | Dormant + KYC failed |
| 5 | System Maintenance Notice 8/15 02:00 | Scheduled (T+2) | In-App (announcement) | Broadcast |
| 6 | Anniversary Appreciation Rewards | Draft | — | — |
| 7 | Newcomer First Deposit 2x (D+3) | Active | In-App + Email + Push | Registered ≤30d + no first deposit |
| 8 | Churn Recovery Email | Disabled | Email + SMS | Churned + cumulative ≥$1000 |
| 9 | Sportsbook World Cup Special | Active | In-App + Push | Sports preference (mocked) |
| 10 | Customer Support Satisfaction Survey | Draft | — | — |
| 11 | VIP 1-on-1 CS Online Notice | Scheduled (T+4h) | In-App + SMS | VIP ≥ 7 |
| 12 | Live Dealer Special Reward | Disabled | In-App + Email | Cumulative $100–1000 |
| 13 | Lunar New Year Limited Game Preview | Active | In-App | Broadcast |
| 14 | High Roller VIP Invitation | Active | Email + SMS | Cumulative ≥$5000 |
| 15 | Mother's Day Greeting (May) | Disabled (expired) | In-App + Email | Broadcast |
| 16 | Account Security 2FA Activation Reminder | Active | In-App + Email | 2FA not enabled |

### 7.2 Player Pool（~120 人）

- VIP Tier 分布：T1 30% / T2 25% / T3 18% / T4 12% / T5 8% / T6 5% / T7 2%
- 玩家狀態：Active 60% / Dormant 30% / Churned 10%
- 已驗證 Email：~70%
- 已驗證 Phone：~80%
- 手機號碼：+63 9XX-XXX-XXXX，Globe（前綴 905/906/915/916/917/926/927/935/936/937/945/955/956/965/966/967/975/976/977/995/996/997）vs Smart（其他 0917/0907 等）約 6:4 分布
- 註冊時間：分布在過去 18 個月
- 累計存款：四個級距分布合理

僅作為 audience 估算與 Test send 查找用，**不展示在 UI**。

### 7.3 Ops 帳號（4 個）

- `ops_anna@brand.ph`
- `ops_marco@brand.ph`
- `ops_lisa@brand.ph`
- `ops_juan@brand.ph`

供 Campaign 列表「Created by」欄位多樣化，篩選器才有 4 個 chip 可選。

---

## 8. 視覺語言

### 8.1 字型
- EN：Inter
- 中文：Noto Sans TC
- 系統 fallback
- 字級：Body 14 / Table 13 / H3 16 / H2 20 / H1 24

### 8.2 色彩
- 中性灰階為畫面主體（~95% 像素）
- Brand accent：indigo-600（暫定，可全域替換）
- 語意色：success / warning / destructive / info（shadcn 預設 token）
- Status chip 配色：
  - Draft：slate（灰）
  - Scheduled：blue
  - Active：emerald（綠）
  - Disabled：rose / 灰階

### 8.3 密度
- 表格：compact（row height 40px，類 Stripe / Linear）
- Form：comfortable（label / input 分行 + 適當 spacing）

### 8.4 動效
- Fade in 200ms
- Modal slide up
- Toast slide in from top-right
- 不做炫技 transitions

### 8.5 間距與佈局
- Sidebar 240px 固定寬
- Main content max-width 1280px 置中
- 頁緣 padding 32px
- Card padding 24px

### 8.6 風格座標
**像** Linear / Stripe Dashboard：grid-aligned、低彩度、table-heavy、克制的視覺重量。

**不像** Material Design 重陰影圓角 / Bootstrap 擁擠 / 任何 SaaS gradient hero。

### 8.7 核心 shadcn 元件
Sidebar / DataTable / Sheet / Dialog / Tabs / Form (+ react-hook-form + zod) / Select / Combobox / Calendar + DateTimePicker / Toast / Progress / Badge / Card / Skeleton / Alert

---

## 9. 國際化（i18n）

### 9.1 機制
- `react-i18next`
- 兩份 translation：`en.json`、`zh-TW.json`
- 預設語系：**EN**（實際使用者 = PH 在地 ops/CS）
- 切換器：右上 dropdown，存 localStorage `ui-lang`
- 重新 render，無頁面 reload

### 9.2 Translation key 結構（feature namespace）
```
{
  "nav": { "campaigns": "...", "auditLog": "..." },
  "campaign": {
    "list": { "title", "newButton", "empty", "search", "filterStatus", ... },
    "form": { "basicInfo": { "name", "tags" }, "audience": { ... }, "channels": { "inApp": {...}, "email": {...}, ... }, "schedule": { ... } },
    "detail": { "tabs": { "audience", "channels", "activity" }, ... },
    "status": { "draft", "scheduled", "active", "disabled" }
  },
  "audience": { "conditions": { "vipTier", "playerStatus", ... } },
  "modals": { "scheduleConfirm": { ... }, "testSend": { ... }, "toggle": { ... } },
  "common": { "cancel", "save", "delete", "confirm", "close", ... }
}
```

### 9.3 區域化格式
- 日期：`date-fns` + locale，固定顯示 PH 時區（UTC+8）
- 金額：`Intl.NumberFormat` with PHP，兩語系下都顯示 `₱1,234.00`
- 數字：千分位逗號

---

## 10. 技術棧

| 層 | 選擇 | 理由 |
|---|------|------|
| Bundler | Vite | 快、設定簡單、SPA 標配 |
| UI Framework | React 18 + TypeScript（strict） | 元件化必要、類型 = 給 RD 的資料結構文件 |
| Styling | Tailwind CSS | shadcn 依賴、utility-first 與本案密度需求一致 |
| Component Library | shadcn/ui | 現代簡潔風格的 de facto，Radix primitives，可 fork 自訂 |
| Form | react-hook-form + zod | shadcn Form 預設組合，型別安全 |
| Routing | react-router (HashRouter) | GH Pages 子路徑友善，免做 404.html SPA fallback |
| i18n | react-i18next | 業界標準、SSR-agnostic |
| Date | date-fns + locales | tree-shakable、locale 完整 |
| State | React state + Context（mock 不需 Redux/Zustand） | prototype 規模 |
| Deploy | GitHub Actions → GH Pages | push 即上線 |

---

## 11. Repo 結構

```
igaming-admin-prototype/
├─ .github/
│  └─ workflows/
│     └─ deploy.yml                # push to main → build → deploy GH Pages
├─ public/
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ router.tsx
│  ├─ pages/
│  │  ├─ campaigns/
│  │  │  ├─ CampaignList.tsx
│  │  │  ├─ CampaignForm.tsx       # new + edit 共用
│  │  │  └─ CampaignDetail.tsx
│  │  └─ NotFound.tsx
│  ├─ components/
│  │  ├─ ui/                       # shadcn 元件
│  │  ├─ shell/                    # Sidebar, Topbar, LangSwitcher
│  │  ├─ campaign/                 # AudienceBuilder, ChannelPanel*, ScheduleConfirmDialog 等
│  │  └─ common/                   # StatusBadge, EmptyState, LoadingSkeleton
│  ├─ mock/
│  │  ├─ campaigns.ts              # 16 筆 seed
│  │  ├─ players.ts                # ~120 人
│  │  └─ ops.ts                    # 4 個帳號
│  ├─ i18n/
│  │  ├─ index.ts                  # react-i18next setup + lang detector
│  │  ├─ en.json
│  │  └─ zh-TW.json
│  ├─ lib/
│  │  ├─ date.ts                   # date-fns wrappers + PH timezone
│  │  ├─ number.ts                 # PHP formatting
│  │  └─ audience.ts               # 條件 → 估算人數 mock 邏輯
│  └─ types/
│     ├─ campaign.ts
│     ├─ player.ts
│     └─ audience.ts
├─ index.html
├─ vite.config.ts                  # base: '/igaming-admin-prototype/'
├─ tailwind.config.ts
├─ tsconfig.json                   # strict
├─ package.json
└─ README.md
```

---

## 12. 部署

### 12.1 GitHub Pages 設定（首次）
1. Repo Settings → Pages → Source: **GitHub Actions**
2. Push `deploy.yml` 到 `main`
3. Workflow 自動跑、首次部署完成後網址生效：
   `https://<github-username>.github.io/igaming-admin-prototype/`

### 12.2 Workflow（`.github/workflows/deploy.yml`）
- Trigger：`push` 到 `main`
- Steps：checkout → setup node 20 → `npm ci` → `npm run build` → upload `dist/` artifact → deploy GH Pages

### 12.3 本地開發
- `npm install`
- `npm run dev` → `http://localhost:5173/`
- 即時 reload

---

## 13. 明確延後（非本 prototype 範圍）

- 真實後端 / 資料持久化（mock 資料 in-memory，重新整理會回到 seed 狀態）
- RBAC（spec MVP 為單一管理員角色）
- 暗色模式（shadcn 之後加幾乎零成本）
- 圖表 / 儀表板 / 送達率報表 UI（spec 明確說 MVP 不做 UI，資料底層留給後端）
- 完整 audit log 頁（既有平台頁）
- 自動發信範本管理 UI（config 管理）
- 玩家收件匣 / 通知偏好頁（前台範圍，本 prototype 為後台）
- 客服 suppression 管理 UI（spec §9.4）

---

*本 spec 之後的 implementation plan 將另以 plan 形式撰寫，涵蓋拆分任務、依賴關係、預估工時。*

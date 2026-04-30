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

const emptyAudience = (): MasterAudience => ({
  broadcast: false,
  conditions: [],
  logic: 'AND',
})

export const campaigns: Campaign[] = [
  // ─── cmp_001 ───────────────────────────────────────────────────────────────
  // Active | In-App + Email + SMS + Push | Broadcast (verified email)
  {
    id: 'cmp_001',
    name: '2026 Lunar New Year Double Deposit Bonus',
    tags: ['seasonal', 'promotion'],
    status: 'active',
    masterAudience: broadcast('email'),
    estimatedRecipients: 84,
    channelPanels: {
      inApp: {
        enabled: true,
        title: 'Lunar New Year 2x Bonus!',
        category: 'promo',
        bodyRich: 'Double your deposit this Lunar New Year. Limited time offer — claim before midnight.',
        cta: { label: 'Deposit Now', url: '/deposit' },
        triggerToast: false,
      },
      email: {
        enabled: true,
        subject: '🧧 Lunar New Year — Double Your Deposit',
        preheader: 'Limited-time 2x deposit bonus inside.',
        htmlBody: '<h1>Double Deposit Bonus</h1><p>Celebrate the Lunar New Year with us. Make a deposit this week and we\'ll match it 100%. Offer valid until Feb 18.</p>',
        senderFrom: 'promo',
      },
      sms: {
        enabled: true,
        body: 'Lunar New Year 2x deposit bonus is LIVE. Open the app to claim your reward now. Reply STOP to unsubscribe.',
        senderId: 'BRAND',
      },
      push: {
        enabled: true,
        title: '🧧 Double Deposit Bonus',
        body: 'Lunar New Year offer is live — double your deposit today!',
        ctaUrl: '/deposit',
      },
    },
    schedule: { type: 'datetime', at: iso(-days(2)) },
    ignoreQuietHours: false,
    sendingProgress: {
      perChannel: {
        inApp: { sent: 84, total: 84, lastUpdate: iso(-days(2) + hours(1)) },
        email: { sent: 84, total: 84, lastUpdate: iso(-days(2) + hours(1)) },
        sms:   { sent: 67, total: 84, lastUpdate: iso(-days(2) + hours(1)) },
        push:  { sent: 41, total: 84, lastUpdate: iso(-days(2) + hours(1)) },
      },
    },
    exclusions: { optOut: 12, frequencyCap: 0, suppression: 5, unverifiedContact: 19 },
    createdBy: 'Anna Rivera',
    createdAt: iso(-days(5)),
    updatedAt: iso(-days(2)),
  },

  // ─── cmp_002 ───────────────────────────────────────────────────────────────
  // Active | In-App + Email | VIP >= 5
  {
    id: 'cmp_002',
    name: 'VIP July Exclusive High Rebate',
    tags: ['vip', 'promotion'],
    status: 'active',
    masterAudience: {
      broadcast: false,
      conditions: [{ field: 'vipTier', op: '>=', value: 5 }],
      logic: 'AND',
    },
    estimatedRecipients: 18,
    channelPanels: {
      inApp: {
        enabled: true,
        title: 'Your VIP High Rebate is Ready',
        category: 'personal',
        bodyRich: 'As a valued VIP member, enjoy an exclusive high rebate this July. Check your account for details.',
        cta: { label: 'View Rebate', url: '/vip' },
        triggerToast: false,
      },
      email: {
        enabled: true,
        subject: 'VIP Exclusive: July High Rebate Offer',
        preheader: 'Your exclusive rebate bonus awaits — VIP members only.',
        htmlBody: '<h1>July Exclusive High Rebate</h1><p>Dear VIP Member, as a thank you for your continued loyalty, we are offering an exclusive high rebate this July. Log in to view and claim your personalized offer.</p>',
        senderFrom: 'vip',
      },
    },
    schedule: { type: 'datetime', at: iso(-days(1)) },
    ignoreQuietHours: false,
    sendingProgress: {
      perChannel: {
        inApp: { sent: 18, total: 18, lastUpdate: iso(-days(1) + hours(2)) },
        email: { sent: 18, total: 18, lastUpdate: iso(-days(1) + hours(2)) },
      },
    },
    exclusions: { optOut: 1, frequencyCap: 0, suppression: 0, unverifiedContact: 2 },
    createdBy: 'Marco Santos',
    createdAt: iso(-days(4)),
    updatedAt: iso(-days(1)),
  },

  // ─── cmp_003 ───────────────────────────────────────────────────────────────
  // Scheduled (T+1 10:00) | In-App + Push | Active + first-deposited
  {
    id: 'cmp_003',
    name: 'Slot Tournament Sign-up Reminder',
    tags: ['tournament', 'promotion'],
    status: 'scheduled',
    masterAudience: {
      broadcast: false,
      conditions: [
        { field: 'playerStatus', value: 'active' },
        { field: 'firstDeposit', value: 'yes' },
      ],
      logic: 'AND',
    },
    estimatedRecipients: 62,
    channelPanels: {
      inApp: {
        enabled: true,
        title: 'Slot Tournament Starts Tomorrow!',
        category: 'promo',
        bodyRich: 'Don\'t miss our weekend Slot Tournament — sign up now and compete for the top prize pool.',
        cta: { label: 'Sign Up', url: '/lobby' },
        triggerToast: false,
      },
      push: {
        enabled: true,
        title: 'Slot Tournament — Last Chance to Register',
        body: 'Sign up before 10:00 AM tomorrow and get a free entry bonus.',
        ctaUrl: '/lobby',
      },
    },
    schedule: { type: 'datetime', at: iso(days(1) + hours(10)) },
    ignoreQuietHours: false,
    createdBy: 'Lisa Cruz',
    createdAt: iso(-days(1)),
    updatedAt: iso(-hours(3)),
  },

  // ─── cmp_004 ───────────────────────────────────────────────────────────────
  // Active | Email + SMS | Dormant + verified email (proxy for KYC resubmission)
  {
    id: 'cmp_004',
    name: 'KYC Resubmission Reminder (Dormant)',
    tags: ['kyc', 'retention'],
    status: 'active',
    masterAudience: {
      broadcast: false,
      conditions: [
        { field: 'playerStatus', value: 'dormant' },
        { field: 'verifiedContact', value: 'email' },
      ],
      logic: 'AND',
    },
    estimatedRecipients: 22,
    channelPanels: {
      email: {
        enabled: true,
        subject: 'Action Required: Resubmit Your KYC Documents',
        preheader: 'Your verification is incomplete — please resubmit to restore full access.',
        htmlBody: '<h1>KYC Resubmission Required</h1><p>Our records show your identity verification was not completed. Please log in and resubmit your documents to restore full account access and enjoy uninterrupted service.</p>',
        senderFrom: 'noreply',
      },
      sms: {
        enabled: true,
        body: '[BRAND] Action required: your KYC docs need resubmission. Log in to complete verification. Reply STOP to opt out.',
        senderId: 'BRAND',
      },
    },
    schedule: { type: 'datetime', at: iso(-days(3)) },
    ignoreQuietHours: false,
    sendingProgress: {
      perChannel: {
        email: { sent: 22, total: 22, lastUpdate: iso(-days(3) + hours(1)) },
        sms:   { sent: 19, total: 22, lastUpdate: iso(-days(3) + hours(1)) },
      },
    },
    exclusions: { optOut: 4, frequencyCap: 0, suppression: 1, unverifiedContact: 0 },
    createdBy: 'Juan Reyes',
    createdAt: iso(-days(6)),
    updatedAt: iso(-days(3)),
  },

  // ─── cmp_005 ───────────────────────────────────────────────────────────────
  // Scheduled (T+2) | In-App announcement | Broadcast
  {
    id: 'cmp_005',
    name: 'System Maintenance Notice 8/15 02:00',
    tags: ['announcement'],
    status: 'scheduled',
    masterAudience: broadcast(),
    estimatedRecipients: 120,
    channelPanels: {
      inApp: {
        enabled: true,
        title: 'Scheduled Maintenance — Aug 15, 02:00 AM',
        category: 'announcement',
        bodyRich: 'Our platform will be undergoing scheduled maintenance on Aug 15 from 02:00–04:00 AM (PHT). Services will be temporarily unavailable during this window.',
        triggerToast: false,
      },
    },
    schedule: { type: 'datetime', at: iso(days(2)) },
    ignoreQuietHours: true,
    createdBy: 'Anna Rivera',
    createdAt: iso(-days(1)),
    updatedAt: iso(-hours(6)),
  },

  // ─── cmp_006 ───────────────────────────────────────────────────────────────
  // Draft | no channels | no audience
  {
    id: 'cmp_006',
    name: 'Anniversary Appreciation Rewards',
    tags: [],
    status: 'draft',
    masterAudience: emptyAudience(),
    estimatedRecipients: 0,
    channelPanels: {},
    schedule: { type: 'immediate' },
    ignoreQuietHours: false,
    createdBy: 'Marco Santos',
    createdAt: iso(-hours(5)),
    updatedAt: iso(-hours(5)),
  },

  // ─── cmp_007 ───────────────────────────────────────────────────────────────
  // Active | In-App + Email + Push | Registered <=30d + no first deposit
  {
    id: 'cmp_007',
    name: 'Newcomer First Deposit 2x (D+3)',
    tags: ['newcomer', 'promotion'],
    status: 'active',
    masterAudience: {
      broadcast: false,
      conditions: [
        { field: 'registrationDays', op: '<=', value: 30 },
        { field: 'firstDeposit', value: 'no' },
      ],
      logic: 'AND',
    },
    estimatedRecipients: 7,
    channelPanels: {
      inApp: {
        enabled: true,
        title: 'Make Your First Deposit — Get 2x Bonus!',
        category: 'promo',
        bodyRich: 'Welcome! Make your first deposit within 3 days and receive a 100% match bonus up to PHP 2,000.',
        cta: { label: 'Deposit Now', url: '/deposit' },
        triggerToast: false,
      },
      email: {
        enabled: true,
        subject: 'Your First Deposit Bonus is Waiting',
        preheader: 'Deposit now and get 2x your money — new member exclusive.',
        htmlBody: '<h1>Welcome Bonus: 2x Your First Deposit</h1><p>Hi there! You\'re just one deposit away from doubling your balance. Make your first deposit before your offer expires and enjoy a 100% match bonus, up to PHP 2,000.</p>',
        senderFrom: 'promo',
      },
      push: {
        enabled: true,
        title: '2x Your First Deposit — Offer Expiring',
        body: 'Your new member 2x bonus is waiting. Deposit now before it expires!',
        ctaUrl: '/deposit',
      },
    },
    schedule: { type: 'datetime', at: iso(-hours(12)) },
    ignoreQuietHours: false,
    sendingProgress: {
      perChannel: {
        inApp: { sent: 7, total: 7, lastUpdate: iso(-hours(11)) },
        email: { sent: 7, total: 7, lastUpdate: iso(-hours(11)) },
        push:  { sent: 5, total: 7, lastUpdate: iso(-hours(11)) },
      },
    },
    exclusions: { optOut: 0, frequencyCap: 0, suppression: 0, unverifiedContact: 1 },
    createdBy: 'Lisa Cruz',
    createdAt: iso(-days(2)),
    updatedAt: iso(-hours(12)),
  },

  // ─── cmp_008 ───────────────────────────────────────────────────────────────
  // Disabled | Email + SMS | Churned + cumulative 1000-5000
  {
    id: 'cmp_008',
    name: 'Churn Recovery Email',
    tags: ['churn', 'retention'],
    status: 'disabled',
    masterAudience: {
      broadcast: false,
      conditions: [
        { field: 'playerStatus', value: 'churned' },
        { field: 'cumulativeDeposit', value: '1000-5000' },
      ],
      logic: 'AND',
    },
    estimatedRecipients: 8,
    channelPanels: {
      email: {
        enabled: true,
        subject: 'We Miss You — Here\'s an Exclusive Comeback Offer',
        preheader: 'It\'s been a while. Come back and claim a special bonus just for you.',
        htmlBody: '<h1>We\'d Love to See You Again</h1><p>It\'s been some time since your last visit. As a valued member, we\'ve prepared an exclusive comeback bonus to welcome you back. Log in this week to claim it.</p>',
        senderFrom: 'promo',
      },
      sms: {
        enabled: true,
        body: '[BRAND] We miss you! An exclusive comeback bonus is waiting. Log in this week to claim. Reply STOP to opt out.',
        senderId: 'BRAND',
      },
    },
    schedule: { type: 'datetime', at: iso(-days(14)) },
    ignoreQuietHours: false,
    sendingProgress: {
      perChannel: {
        email: { sent: 8, total: 8, lastUpdate: iso(-days(14) + hours(2)) },
        sms:   { sent: 6, total: 8, lastUpdate: iso(-days(14) + hours(2)) },
      },
    },
    exclusions: { optOut: 3, frequencyCap: 1, suppression: 0, unverifiedContact: 0 },
    createdBy: 'Juan Reyes',
    createdAt: iso(-days(20)),
    updatedAt: iso(-days(10)),
  },

  // ─── cmp_009 ───────────────────────────────────────────────────────────────
  // Active | In-App + Push | Broadcast (sports preference mocked as broadcast)
  {
    id: 'cmp_009',
    name: 'Sportsbook World Cup Special',
    tags: ['sports', 'promotion'],
    status: 'active',
    masterAudience: broadcast(),
    estimatedRecipients: 120,
    channelPanels: {
      inApp: {
        enabled: true,
        title: 'World Cup Special — Bet Now!',
        category: 'promo',
        bodyRich: 'The World Cup is here! Place your bets on our Sportsbook and enjoy enhanced odds on all featured matches this weekend.',
        cta: { label: 'Go to Sportsbook', url: '/sportsbook' },
        triggerToast: false,
      },
      push: {
        enabled: true,
        title: '⚽ World Cup Special Odds',
        body: 'Enhanced odds on all World Cup matches — place your bets now!',
        ctaUrl: '/sportsbook',
      },
    },
    schedule: { type: 'datetime', at: iso(-days(1)) },
    ignoreQuietHours: false,
    sendingProgress: {
      perChannel: {
        inApp: { sent: 120, total: 120, lastUpdate: iso(-days(1) + hours(1)) },
        push:  { sent: 58, total: 120, lastUpdate: iso(-days(1) + hours(1)) },
      },
    },
    exclusions: { optOut: 8, frequencyCap: 2, suppression: 3, unverifiedContact: 0 },
    createdBy: 'Anna Rivera',
    createdAt: iso(-days(3)),
    updatedAt: iso(-days(1)),
  },

  // ─── cmp_010 ───────────────────────────────────────────────────────────────
  // Draft | no channels | no audience
  {
    id: 'cmp_010',
    name: 'Customer Support Satisfaction Survey',
    tags: [],
    status: 'draft',
    masterAudience: emptyAudience(),
    estimatedRecipients: 0,
    channelPanels: {},
    schedule: { type: 'immediate' },
    ignoreQuietHours: false,
    createdBy: 'Marco Santos',
    createdAt: iso(-hours(2)),
    updatedAt: iso(-hours(2)),
  },

  // ─── cmp_011 ───────────────────────────────────────────────────────────────
  // Scheduled (T+4h) | In-App + SMS | VIP >= 7
  {
    id: 'cmp_011',
    name: 'VIP 1-on-1 CS Online Notice',
    tags: ['vip'],
    status: 'scheduled',
    masterAudience: {
      broadcast: false,
      conditions: [{ field: 'vipTier', op: '>=', value: 7 }],
      logic: 'AND',
    },
    estimatedRecipients: 3,
    channelPanels: {
      inApp: {
        enabled: true,
        title: 'Your Dedicated CS Agent is Online',
        category: 'personal',
        bodyRich: 'Your personal VIP account manager is available for a 1-on-1 session today. Tap to connect now.',
        cta: { label: 'Connect Now', url: '/support' },
        triggerToast: true,
      },
      sms: {
        enabled: true,
        body: '[BRAND VIP] Your dedicated CS agent is online and ready for your 1-on-1 session. Open the app to connect. Reply STOP to opt out.',
        senderId: 'BRAND',
      },
    },
    schedule: { type: 'datetime', at: iso(hours(4)) },
    ignoreQuietHours: false,
    createdBy: 'Lisa Cruz',
    createdAt: iso(-hours(1)),
    updatedAt: iso(-hours(1)),
  },

  // ─── cmp_012 ───────────────────────────────────────────────────────────────
  // Disabled | In-App + Email | Cumulative $100-1000
  {
    id: 'cmp_012',
    name: 'Live Dealer Special Reward',
    tags: ['promotion', 'retention'],
    status: 'disabled',
    masterAudience: {
      broadcast: false,
      conditions: [{ field: 'cumulativeDeposit', value: '100-1000' }],
      logic: 'AND',
    },
    estimatedRecipients: 38,
    channelPanels: {
      inApp: {
        enabled: true,
        title: 'Live Dealer Bonus Just for You',
        category: 'promo',
        bodyRich: 'Enjoy a special cash reward when you play any Live Dealer table this weekend. Minimum bet PHP 500.',
        cta: { label: 'Play Live', url: '/lobby' },
        triggerToast: false,
      },
      email: {
        enabled: true,
        subject: 'Special Reward: Play Live Dealer This Weekend',
        preheader: 'Earn a bonus on every Live Dealer table session this weekend.',
        htmlBody: '<h1>Live Dealer Special Reward</h1><p>We have a special offer just for you — play any Live Dealer game this weekend and earn a cash reward on your session. Minimum qualifying bet is PHP 500. Offer valid Sat–Sun only.</p>',
        senderFrom: 'promo',
      },
    },
    schedule: { type: 'datetime', at: iso(-days(7)) },
    ignoreQuietHours: false,
    sendingProgress: {
      perChannel: {
        inApp: { sent: 38, total: 38, lastUpdate: iso(-days(7) + hours(1)) },
        email: { sent: 35, total: 38, lastUpdate: iso(-days(7) + hours(1)) },
      },
    },
    exclusions: { optOut: 5, frequencyCap: 2, suppression: 1, unverifiedContact: 3 },
    createdBy: 'Juan Reyes',
    createdAt: iso(-days(10)),
    updatedAt: iso(-days(5)),
  },

  // ─── cmp_013 ───────────────────────────────────────────────────────────────
  // Active | In-App | Broadcast
  {
    id: 'cmp_013',
    name: 'Lunar New Year Limited Game Preview',
    tags: ['seasonal'],
    status: 'active',
    masterAudience: broadcast(),
    estimatedRecipients: 120,
    channelPanels: {
      inApp: {
        enabled: true,
        title: 'New Lunar New Year Games — Play Now',
        category: 'announcement',
        bodyRich: 'Explore our exclusive Lunar New Year themed games, live for a limited time only. Be the first to play!',
        cta: { label: 'Explore Games', url: '/lobby' },
        triggerToast: false,
      },
    },
    schedule: { type: 'datetime', at: iso(-days(3)) },
    ignoreQuietHours: false,
    sendingProgress: {
      perChannel: {
        inApp: { sent: 120, total: 120, lastUpdate: iso(-days(3) + hours(1)) },
      },
    },
    exclusions: { optOut: 10, frequencyCap: 0, suppression: 2, unverifiedContact: 0 },
    createdBy: 'Anna Rivera',
    createdAt: iso(-days(5)),
    updatedAt: iso(-days(3)),
  },

  // ─── cmp_014 ───────────────────────────────────────────────────────────────
  // Active | Email + SMS | Cumulative >= $5000
  {
    id: 'cmp_014',
    name: 'High Roller VIP Invitation',
    tags: ['vip', 'promotion'],
    status: 'active',
    masterAudience: {
      broadcast: false,
      conditions: [{ field: 'cumulativeDeposit', value: '5000+' }],
      logic: 'AND',
    },
    estimatedRecipients: 12,
    channelPanels: {
      email: {
        enabled: true,
        subject: 'You\'re Invited: Exclusive High Roller VIP Event',
        preheader: 'A private invitation for our most valued players.',
        htmlBody: '<h1>Exclusive VIP Invitation</h1><p>You have been selected for our exclusive High Roller event, available only to our top-tier players. Join us for elevated limits, personal service, and special rewards. Log in to RSVP and view event details.</p>',
        senderFrom: 'vip',
      },
      sms: {
        enabled: true,
        body: '[BRAND VIP] You have an exclusive High Roller event invitation. Log in to RSVP and claim your special access. Reply STOP to opt out.',
        senderId: 'BRAND',
      },
    },
    schedule: { type: 'datetime', at: iso(-hours(6)) },
    ignoreQuietHours: false,
    sendingProgress: {
      perChannel: {
        email: { sent: 12, total: 12, lastUpdate: iso(-hours(5)) },
        sms:   { sent: 11, total: 12, lastUpdate: iso(-hours(5)) },
      },
    },
    exclusions: { optOut: 0, frequencyCap: 0, suppression: 1, unverifiedContact: 1 },
    createdBy: 'Marco Santos',
    createdAt: iso(-days(2)),
    updatedAt: iso(-hours(6)),
  },

  // ─── cmp_015 ───────────────────────────────────────────────────────────────
  // Disabled (expired) | In-App + Email | Broadcast | past schedule
  {
    id: 'cmp_015',
    name: "Mother's Day Greeting",
    tags: ['seasonal'],
    status: 'disabled',
    masterAudience: broadcast(),
    estimatedRecipients: 120,
    channelPanels: {
      inApp: {
        enabled: true,
        title: "Happy Mother's Day from Our Team",
        category: 'announcement',
        bodyRich: "Wishing all our members and their families a warm and joyful Mother's Day. As a small token of appreciation, enjoy a free spin bonus today.",
        cta: { label: 'Claim Bonus', url: '/lobby' },
        triggerToast: false,
      },
      email: {
        enabled: true,
        subject: "Happy Mother's Day — A Gift from Us",
        preheader: "A special greeting and a little surprise inside.",
        htmlBody: "<h1>Happy Mother's Day!</h1><p>On this special day, we want to wish you and your loved ones a joyful Mother's Day. As a thank you for being part of our community, enjoy a complimentary free spin bonus — no deposit needed. Valid today only.</p>",
        senderFrom: 'promo',
      },
    },
    schedule: { type: 'datetime', at: iso(-days(60)) },
    ignoreQuietHours: false,
    sendingProgress: {
      perChannel: {
        inApp: { sent: 120, total: 120, lastUpdate: iso(-days(60) + hours(2)) },
        email: { sent: 112, total: 120, lastUpdate: iso(-days(60) + hours(2)) },
      },
    },
    exclusions: { optOut: 14, frequencyCap: 0, suppression: 3, unverifiedContact: 8 },
    createdBy: 'Lisa Cruz',
    createdAt: iso(-days(65)),
    updatedAt: iso(-days(55)),
  },

  // ─── cmp_016 ───────────────────────────────────────────────────────────────
  // Active | In-App + Email | verifiedContact=email + firstDeposit=yes (proxy for 2FA off)
  {
    id: 'cmp_016',
    name: 'Account Security 2FA Activation Reminder',
    tags: ['safety'],
    status: 'active',
    masterAudience: {
      broadcast: false,
      conditions: [
        { field: 'verifiedContact', value: 'email' },
        { field: 'firstDeposit', value: 'yes' },
      ],
      logic: 'AND',
    },
    estimatedRecipients: 51,
    channelPanels: {
      inApp: {
        enabled: true,
        title: 'Secure Your Account — Enable 2FA',
        category: 'personal',
        bodyRich: 'Protect your account and funds by enabling Two-Factor Authentication (2FA). It only takes 60 seconds.',
        cta: { label: 'Enable 2FA', url: '/support' },
        triggerToast: true,
      },
      email: {
        enabled: true,
        subject: 'Action Recommended: Enable 2FA to Protect Your Account',
        preheader: 'Add an extra layer of security in just 60 seconds.',
        htmlBody: '<h1>Enable Two-Factor Authentication</h1><p>Your account currently does not have Two-Factor Authentication (2FA) enabled. We strongly recommend activating 2FA to keep your account and funds safe. Log in and go to Security Settings to enable it now — it takes less than a minute.</p>',
        senderFrom: 'noreply',
      },
    },
    schedule: { type: 'datetime', at: iso(-hours(4)) },
    ignoreQuietHours: false,
    sendingProgress: {
      perChannel: {
        inApp: { sent: 51, total: 51, lastUpdate: iso(-hours(3)) },
        email: { sent: 51, total: 51, lastUpdate: iso(-hours(3)) },
      },
    },
    exclusions: { optOut: 6, frequencyCap: 0, suppression: 2, unverifiedContact: 0 },
    createdBy: 'Juan Reyes',
    createdAt: iso(-days(1)),
    updatedAt: iso(-hours(4)),
  },
]

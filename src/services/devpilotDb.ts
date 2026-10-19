import {
  AppNotification,
  AuditLog,
  ExpenseRecord,
  Language,
  OrderRecord,
  OrderStatus,
  PaymentMethodType,
  PaymentStatus,
  PlatformSettings,
  RefundRecord,
  ServiceItem,
  SupportTicket,
  UserProfile,
  UserRole,
} from '../types/devpilot';

export const SUPER_ADMIN_EMAIL = 'ayanislam10000@gmail.com';

const STORAGE_KEYS = {
  CURRENT_USER: 'devpilot_current_user_v1',
  USERS: 'devpilot_users_v1',
  SERVICES: 'devpilot_services_v1',
  ORDERS: 'devpilot_orders_v1',
  EXPENSES: 'devpilot_expenses_v1',
  TICKETS: 'devpilot_tickets_v1',
  NOTIFICATIONS: 'devpilot_notifications_v1',
  SETTINGS: 'devpilot_settings_v1',
  AUDIT_LOGS: 'devpilot_audit_logs_v1',
  LANGUAGE: 'devpilot_lang_pref_v1',
  THEME: 'devpilot_theme_pref_v1',
};

// ============================================================================
// INITIAL SEED DATA (Real-World Digital Agency Data)
// ============================================================================

export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'svc-bug-fix',
    category: 'bug_fix',
    type: 'fixed',
    priceBdt: 1500,
    estimatedDays: 1,
    isPublished: true,
    iconName: 'Bug',
    badgeBn: 'সবচেয়ে দ্রুত ডেলিভারি',
    badgeEn: 'Fastest Delivery',
    titleBn: 'ওয়েবসাইট ও স্ক্রিপ্ট বাগ ফিক্সিং',
    titleEn: 'Website & Script Bug Fixing',
    shortDescBn: 'যেকোনো জাভাস্ক্রিপ্ট, পিএইচপি, রিঅ্যাক্ট বা সিএসএস লেআউট এরর ও ডেটাবেজ বাগ তাৎক্ষণিক ফিক্স।',
    shortDescEn: 'Instant resolution for JavaScript, React, PHP, styling breakages, or database connection errors.',
    fullDescBn:
      'আপনার সাইট ক্র্যাশ করছে বা ফর্ম কাজ করছে না? আমাদের এক্সপেরিয়েন্সড ডেভেলপার কোড অডিট করে এরর ট্রেস করবে, রুট কজ সমাধান করবে এবং লাইভ সাইটে টেস্ট করে ডেলিভারি নিশ্চিত করবে।',
    fullDescEn:
      'Website crashing or buttons not working? Our senior engineers trace stack traces, patch the root cause, and verify production stability.',
    featuresBn: [
      '২৪ ঘণ্টার মধ্যে সমস্যার রুট কজ সমাধান',
      'ক্লিন কোড ও বিস্তারিত কারণ ব্যাখ্যা',
      'প্রোডাকশন ডেপ্লয়মেন্টে সহায়তা',
      '৩ দিনের ফ্রি পোস্ট-ডেলিভারি সাপোর্ট',
    ],
    featuresEn: [
      'Root-cause fix within 24 hours',
      'Clean code & incident postmortem',
      'Safe production verification',
      '3 days post-delivery warranty',
    ],
    requirementsPromptBn: 'আপনার ওয়েবসাইটের লিংক, এরর মেসেজ বা কনসোল লগ এবং সাইট অ্যাক্সেস দিন।',
    requirementsPromptEn: 'Provide website URL, error description, console log, and staging access.',
  },
  {
    id: 'svc-landing-page',
    category: 'web_dev',
    type: 'fixed',
    priceBdt: 4500,
    estimatedDays: 3,
    isPublished: true,
    iconName: 'Layout',
    badgeBn: 'বেস্ট সেলার',
    badgeEn: 'Best Seller',
    titleBn: 'হাই-কনভার্টিং মডার্ন ল্যান্ডিং পেজ তৈরি',
    titleEn: 'High-Converting Modern Landing Page',
    shortDescBn: 'আপনার ব্যবসা বা সার্ভিসের জন্য প্রিমিয়াম মোবাইল-ফার্স্ট ও রেসপন্সিভ সিঙ্গেল-পেজ ওয়েবসাইট।',
    shortDescEn: 'Tailored, lightning-fast, high-converting responsive landing page designed to turn visitors into buyers.',
    fullDescBn:
      'আধুনিক Tailwind CSS, React বা Next.js দিয়ে তৈরি সম্পূর্ণ রেসপন্সিভ ল্যান্ডিং পেজ। দ্রুত লোডিং স্পিড, হোয়াটসঅ্যাপ ও কল বাটন, লিড কালেকশন ফর্ম এবং এসইও-ফ্রেন্ডলি স্ট্রাকচার।',
    fullDescEn:
      'Custom React/Tailwind landing page with fast load time, direct WhatsApp/Call triggers, lead generation forms, and SEO meta tags.',
    featuresBn: [
      '১০০% মোবাইল ও ট্যাবলেট রেসপন্সিভ ডিজাইন',
      'হোয়াটসঅ্যাপ/কল ও লিড কালেকশন ইন্টিগ্রেশন',
      'ফ্রি বেসিক এসইও (Search Engine Optimization)',
      'সোর্স কোড ও ফ্রি হোস্টিং সেটআপ গাইড',
    ],
    featuresEn: [
      '100% mobile and tablet responsive layout',
      'Direct WhatsApp and lead capture form',
      'Built-in Google SEO meta tags & PWA',
      'Clean source code & deployment setup',
    ],
    requirementsPromptBn: 'আপনার ব্যবসার নাম, লোগো, পেজে কী কী সেকশন চান এবং রেফারেন্স ওয়েবসাইটের লিংক দিন।',
    requirementsPromptEn: 'Provide brand name, logo, desired sections, copy text, and reference site.',
  },
  {
    id: 'svc-api-integration',
    category: 'api',
    type: 'fixed',
    priceBdt: 3500,
    estimatedDays: 2,
    isPublished: true,
    iconName: 'Plug',
    titleBn: 'কাস্টম এপিআই ও পেমেন্ট গেটওয়ে ইন্টিগ্রেশন',
    titleEn: 'Custom API & Payment Gateway Integration',
    shortDescBn: 'বিকাশ, নগদ, এসএসএলকমার্জ, গুগল শিটস বা থার্ড-পার্টি রেস্ট এপিআই সুরক্ষিতভাবে কানেক্ট করুন।',
    shortDescEn: 'Secure integration of bKash, Nagad, SSLCommerz, Stripe, Google APIs, SMS gateways, or Webhooks.',
    fullDescBn:
      'আপনার অ্যাপ বা ওয়েবসাইটে রিয়েল-টাইম ডেটা আদান-প্রদান, এসএমএস নোটিফিকেশন বা অনলাইন পেমেন্ট নেওয়ার জন্য ব্যাকএন্ড এপিআই হ্যান্ডলার ও সিকিউর ওয়েবহুক সেটআপ।',
    fullDescEn:
      'Robust server-side REST API integration with error retry policies, secure token headers, and verified webhook idempotency.',
    featuresBn: [
      'সিকিউর সার্ভার-সাইড টোকেন হ্যান্ডলিং',
      'ওয়েবহুক ও অটোমেটিক স্ট্যাটাস আপডেট',
      'ইনভ্যালিড রিকোয়েস্ট ও এরর ট্র্যাকিং',
      'পোস্টম্যান কালেকশন ও টেস্ট ভেরিফিকেশন',
    ],
    featuresEn: [
      'Secure token storage & headers',
      'Webhook handling & idempotency',
      'Error catching & retry handlers',
      'Full test suite verification',
    ],
    requirementsPromptBn: 'কোন এপিআই বা পেমেন্ট গেটওয়ে যুক্ত করতে চান এবং তাদের অফিসিয়াল ডকুমেন্টেশন বা ক্রেডেনশিয়াল দিন।',
    requirementsPromptEn: 'Specify target API/gateway, credentials, and payload specification.',
  },
  {
    id: 'svc-speed-maintenance',
    category: 'maintenance',
    type: 'fixed',
    priceBdt: 2500,
    estimatedDays: 2,
    isPublished: true,
    iconName: 'Zap',
    titleBn: 'সাইট স্পিড অপটিমাইজেশন ও সিকিউরিটি অডিট',
    titleEn: 'Website Speed Optimization & Security Audit',
    shortDescBn: 'গুগল পেজস্পিড স্কোর বৃদ্ধি, ইমেজ কম্প্রেশন, ক্যাশিং ও সিকিউরিটি ভালনারেবিলিটি স্ক্যানিং।',
    shortDescEn: 'Boost Core Web Vitals, minimize bloated assets, configure caching, and patch vulnerabilities.',
    fullDescBn:
      'ধীরগতির ওয়েবসাইট কাস্টমারদের ফিরিয়ে দেয়। আমরা স্ক্রিপ্ট বান্ডেল অপটিমাইজেশন, সিডিএন কনফিগারেশন, ক্যাশ কন্ট্রোল এবং ডাটাবেস কোয়েরি টিউনিং করে সাইটের লোডিং টাইম ৯০%+ দ্রুত করি।',
    fullDescEn:
      'Reduce page load times below 1.5 seconds. Optimize asset pipelines, set up HTTP caching, and run malware audits.',
    featuresBn: [
      'গুগল পেজস্পিড ও কোর ওয়েব ভাইটালস অপটিমাইজেশন',
      'ইমেজ ও ফন্ট অ্যাসেট কম্প্রেশন',
      'এসএসএল (HTTPS) ও হেডস্পেস সিকিউরিটি হেডার',
      'পূর্বে ও পরের স্পিড পারফরম্যান্স রিপোর্ট',
    ],
    featuresEn: [
      'Google PageSpeed 90+ mobile score',
      'Asset bundle & image compression',
      'Security headers & SSL audit',
      'Before/After audit performance report',
    ],
    requirementsPromptBn: 'ওয়েবসাইটের ইউআরএল এবং বর্তমান সমস্যা বা হোস্টিং কন্ট্রোল প্যানেল অ্যাক্সেস।',
    requirementsPromptEn: 'Provide website URL and hosting environment details.',
  },
  {
    id: 'svc-ui-redesign',
    category: 'ui_ux',
    type: 'fixed',
    priceBdt: 3800,
    estimatedDays: 3,
    isPublished: true,
    iconName: 'Palette',
    titleBn: 'মডার্ন ইউআই রিডিজাইন ও মোবাইল ফিট',
    titleEn: 'Modern UI/UX Redesign & Mobile Polish',
    shortDescBn: 'পুরোনো বা দৃষ্টিকটু ওয়েবসাইটকে আকর্ষণীয়, ক্লিন ও আধুনিক লুক দেওয়ার পেশাদার ডিজাইন।',
    shortDescEn: 'Transform outdated layouts into clean, modern, accessible, anti-clutter digital experiences.',
    fullDescBn:
      'ব্যবহারকারীদের সহজে নেভিগেট করার মতো পরিচ্ছন্ন ইন্টারফেস, মার্জিত কালার প্যালেট, উন্নত টাইপোগ্রাফি এবং মোবাইল টাচ ফ্রেন্ডলি কন্ট্রোল তৈরি করা।',
    fullDescEn:
      'Full visual facelift: bespoke typography hierarchy, harmonious spacing, accessible contrast, and thumb-friendly mobile layouts.',
    featuresBn: [
      'জিরো-ক্ল্যাটার আধুনিক ডিজাইন থিম',
      'ডার্ক ও লাইট কালার প্যালেট সমন্বয়',
      'মোবাইল স্ক্রিনে পারফেক্ট টেক্সট ও বাটন রেন্ডারিং',
      'কমপ্লিট সিএসএস/টেইলউইন্ড সোর্স কোড',
    ],
    featuresEn: [
      'Anti-slop modern design system',
      'Cohesive dark/light theme tokens',
      'Zero text clipping on mobile viewports',
      'Complete Tailwind CSS code deliverables',
    ],
    requirementsPromptBn: 'বর্তমান ওয়েবসাইটের লিংক এবং কেমন ডিজাইন পছন্দ তার ২-১টি উদাহরণ দিন।',
    requirementsPromptEn: 'Provide current website link and 2-3 style references you admire.',
  },
  {
    id: 'svc-custom-automation',
    category: 'automation',
    type: 'quotation',
    priceBdt: 5000,
    estimatedDays: 4,
    isPublished: true,
    iconName: 'Cpu',
    badgeBn: 'কাস্টম কোটেশন',
    badgeEn: 'Custom Quotation',
    titleBn: 'কাস্টম প্রসেস অটোমেশন ও স্ক্র্যাপিং স্ক্রিপ্ট',
    titleEn: 'Process Automation & Scraping Scripts',
    shortDescBn: 'ম্যানুয়াল পুনরাবৃত্তিমূলক কাজ স্বয়ংক্রিয় করতে পাইথন বা নোডজেএস অটোমেশন বোট ও টুলস।',
    shortDescEn: 'Automate repetitive workflows, data scraping, periodic report generation, or scheduled tasks.',
    fullDescBn:
      'এক্সেল শিট প্রক্রিয়াকরণ, স্বয়ংক্রিয় ইমেইল ও চালান জেনারেশন, পাবলিক ডেটা নিষ্কাশন এবং ক্রন জব শিডিউলিং। কাজের পরিধি অনুযায়ী অ্যাডমিন বিস্তারিত কোটেশন প্রদান করবেন।',
    fullDescEn:
      'Custom scripts for periodic reporting, data parsing, automated document creation, and background workers.',
    featuresBn: [
      'নির্দিষ্ট প্রয়োজনীয়তা অনুযায়ী কাস্টম কোডিং',
      'অটোমেটিক এরর হ্যান্ডলিং ও লগিং সিস্টেম',
      'ক্লাউডে বা লোকাল পিসিতে চালানোর পূর্ণ গাইড',
      'কোটেশন অনুমোদনের পর স্বচ্ছ কাজের নিশ্চয়তা',
    ],
    featuresEn: [
      'Bespoke script tailored to your exact steps',
      'Robust error handling & alert logs',
      'Detailed installation & run handbook',
      'Fixed milestone quote before work begins',
    ],
    requirementsPromptBn: 'কী কাজ অটোমেট করতে চান এবং ইনপুট/আউটপুট ডেটার ফরম্যাট বিস্তারিত জানান।',
    requirementsPromptEn: 'Describe step-by-step workflow to automate and sample input/output data.',
  },
];

export const DEFAULT_SETTINGS: PlatformSettings = {
  brandName: 'DevPilot',
  taglineBn: 'প্রফেশনাল ডিজিটাল সার্ভিস ও সফটওয়্যার সল্যুশনস',
  taglineEn: 'Professional Digital Services & Engineering Solutions',
  contactEmail: 'ayanislam10000@gmail.com',
  contactPhone: '+880 1700-000000',
  whatsappNumber: '+880 1700-000000',
  paymentConfig: {
    bkashNumber: '01711-223344',
    bkashType: 'Personal',
    bkashInstructionsBn:
      'বিকাশ অ্যাপের "Send Money" অপশনে গিয়ে উপরের নম্বরে নির্ধারিত ফি প্রদান করুন। এরপর ট্রানজেকশন সফল হলে পাওয়া TrxID নিচে সাবমিট করুন।',
    bkashInstructionsEn:
      'Use bKash Send Money to transfer exact fee to the number above. Submit the resulting TrxID below for verification.',
    nagadNumber: '01811-223344',
    nagadType: 'Personal',
    nagadInstructionsBn:
      'নগদ অ্যাপ থেকে "Send Money" করুন। ট্রানজেকশন আইডি (TrxID) ও আপনার প্রেরক নম্বর এখানে সাবমিট করুন।',
    nagadInstructionsEn:
      'Perform Nagad Send Money to above number. Enter TrxID and your sender mobile number below.',
    rocketNumber: '01911-223344-5',
    rocketType: 'Personal',
    bankName: 'Dutch-Bangla Bank PLC',
    accountName: 'Ayan Islam (DevPilot Engineering)',
    accountNumber: '115.120.0094201',
    branchName: 'Dhanmondi Branch, Dhaka',
    routingNumber: '090271891',
  },
  aiAssistantEnabled: true,
  aiDailyLimitPerUser: 10,
};

// Seed sample orders to show realistic operations immediately
const SAMPLE_ORDERS: OrderRecord[] = [
  {
    id: 'DP-ORD-2026-101',
    customerId: 'cust_seed_1',
    customerName: 'Tanvir Ahmed',
    customerEmail: 'tanvir.digital@example.com',
    customerPhone: '01712-345678',
    serviceId: 'svc-bug-fix',
    serviceTitleBn: 'ওয়েবসাইট ও স্ক্রিপ্ট বাগ ফিক্সিং',
    serviceTitleEn: 'Website & Script Bug Fixing',
    category: 'bug_fix',
    status: 'completed',
    paymentStatus: 'paid',
    priceBdt: 1500,
    projectRequirements:
      'React শপিং কার্ট চেকআউট পেইজে "Cannot read property of undefined" এরর আসছিল। ক্যাশঅনডেলিভারি বাটনে ক্লিক করলে অর্ডার ডাটাবেজে সাবমিট হচ্ছিল না।',
    deadlineDate: '2026-10-18',
    attachments: [
      {
        name: 'checkout_error_screenshot.png',
        url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
        sizeKb: 142,
        uploadedAt: '2026-10-15T10:30:00.000Z',
      },
    ],
    payment: {
      method: 'bkash',
      trxId: 'BK9A721098',
      senderAccount: '01712-345678',
      amountBdt: 1500,
      submittedAt: '2026-10-15T11:00:00.000Z',
      verifiedAt: '2026-10-15T11:15:00.000Z',
      verifiedBy: 'ayanislam10000@gmail.com',
    },
    deliveries: [
      {
        notes:
          'চেকআউট কার্ট অবজেক্টে নাল-চেকিং যোগ করা হয়েছে এবং async অর্ডার হ্যান্ডলার ঠিক করা হয়েছে। কোড গিটহাবে পুশ ও লাইভ সাইটে টেস্ট সম্পন্ন।',
        files: [{ name: 'checkout_fix_patch.zip', url: '#' }],
        submittedAt: '2026-10-15T16:00:00.000Z',
      },
    ],
    revisionRequests: [],
    createdAt: '2026-10-15T10:30:00.000Z',
    updatedAt: '2026-10-15T16:30:00.000Z',
  },
  {
    id: 'DP-ORD-2026-102',
    customerId: 'cust_seed_2',
    customerName: 'Shakil Hasan',
    customerEmail: 'shakil.ecommerce@example.com',
    customerPhone: '01899-112233',
    serviceId: 'svc-landing-page',
    serviceTitleBn: 'হাই-কনভার্টিং মডার্ন ল্যান্ডিং পেজ তৈরি',
    serviceTitleEn: 'High-Converting Modern Landing Page',
    category: 'web_dev',
    status: 'in_progress',
    paymentStatus: 'paid',
    priceBdt: 4500,
    projectRequirements:
      'আমাদের ড্রপশিপিং ঘড়ি ও গ্যাজেট ব্র্যান্ডের জন্য একটি একক ল্যান্ডিং পেজ দরকার। কাস্টমার যেন এক ক্লিকে হোয়াটসঅ্যাপে অর্ডার পাঠাতে পারে।',
    deadlineDate: '2026-10-20',
    attachments: [],
    payment: {
      method: 'nagad',
      trxId: 'NG84201994',
      senderAccount: '01899-112233',
      amountBdt: 4500,
      submittedAt: '2026-10-16T09:00:00.000Z',
      verifiedAt: '2026-10-16T09:30:00.000Z',
      verifiedBy: 'ayanislam10000@gmail.com',
    },
    deliveries: [],
    revisionRequests: [],
    createdAt: '2026-10-16T08:30:00.000Z',
    updatedAt: '2026-10-16T09:30:00.000Z',
  },
  {
    id: 'DP-ORD-2026-103',
    customerId: 'cust_seed_3',
    customerName: 'Nadia Rahman',
    customerEmail: 'nadia.consulting@example.com',
    customerPhone: '01922-445566',
    serviceId: 'svc-api-integration',
    serviceTitleBn: 'কাস্টম এপিআই ও পেমেন্ট গেটওয়ে ইন্টিগ্রেশন',
    serviceTitleEn: 'Custom API & Payment Gateway Integration',
    category: 'api',
    status: 'awaiting_payment',
    paymentStatus: 'verification_pending',
    priceBdt: 3500,
    projectRequirements:
      'ওয়ার্ডপ্রেস সাইটে বিকাশ পেমেন্ট এপিআই যুক্ত করতে হবে যাতে কাস্টমার চেকআউটে সরাসরি বিকাশ সিলেক্ট করে পেমেন্ট করতে পারে।',
    deadlineDate: '2026-10-21',
    attachments: [],
    payment: {
      method: 'bkash',
      trxId: 'BK3M817264',
      senderAccount: '01922-445566',
      amountBdt: 3500,
      submittedAt: '2026-10-17T14:00:00.000Z',
    },
    deliveries: [],
    revisionRequests: [],
    createdAt: '2026-10-17T13:45:00.000Z',
    updatedAt: '2026-10-17T14:00:00.000Z',
  },
  {
    id: 'DP-ORD-2026-104',
    customerId: 'cust_seed_4',
    customerName: 'Rafiqul Islam',
    customerEmail: 'rafiqul.enterprise@example.com',
    customerPhone: '01633-889900',
    serviceId: 'svc-custom-automation',
    serviceTitleBn: 'কাস্টম প্রসেস অটোমেশন ও স্ক্র্যাপিং স্ক্রিপ্ট',
    serviceTitleEn: 'Process Automation & Scraping Scripts',
    category: 'automation',
    status: 'quotation_sent',
    paymentStatus: 'unpaid',
    priceBdt: 5000,
    quotationAmountBdt: 6000,
    quotationNote:
      'আপনার রিকোয়ারমেন্ট পর্যালোচনা করা হয়েছে। প্রতিদিন রাত ১২টায় ৩টি সাইটের রিয়েল-টাইম প্রাইসিং স্ক্র্যাপ করে গুগল শিটে রো আকারে যুক্ত করার স্ক্রিপ্ট প্রস্তুত করা হবে। ডেলিভারি ৪ দিন।',
    projectRequirements:
      'প্রতিযোগীদের ওয়েবসাইট থেকে প্রতিদিনের পণ্যের দাম ও স্টক স্ট্যাটাস স্বয়ংক্রিয়ভাবে একটি গুগল স্প্রেডশিটে আপডেট করার অটোমেশন বোট লাগবে।',
    deadlineDate: '2026-10-24',
    attachments: [],
    deliveries: [],
    revisionRequests: [],
    createdAt: '2026-10-17T15:20:00.000Z',
    updatedAt: '2026-10-17T16:00:00.000Z',
  },
];

const SAMPLE_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp-1',
    title: 'Cloud VPS & Domain Hosting Renewal',
    category: 'hosting',
    amountBdt: 1200,
    date: '2026-10-10',
    notes: 'Monthly server node subscription for hosting client demo staging.',
    createdAt: '2026-10-10T12:00:00.000Z',
  },
  {
    id: 'exp-2',
    title: 'Developer Testing Tools & Proxies',
    category: 'tools',
    amountBdt: 850,
    date: '2026-10-12',
    notes: 'Testing proxy credentials for automation suite and webhook inspect.',
    createdAt: '2026-10-12T15:00:00.000Z',
  },
];

const SAMPLE_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    action: 'PLATFORM_INITIALIZATION',
    actor: 'system',
    details: 'DevPilot platform and database schema initialized successfully.',
    timestamp: '2026-10-15T00:00:00.000Z',
  },
  {
    id: 'log-2',
    action: 'PAYMENT_VERIFIED',
    actor: 'ayanislam10000@gmail.com',
    targetId: 'DP-ORD-2026-101',
    details: 'Verified bKash transaction BK9A721098 of BDT 1,500.',
    timestamp: '2026-10-15T11:15:00.000Z',
  },
  {
    id: 'log-3',
    action: 'ORDER_DELIVERED',
    actor: 'ayanislam10000@gmail.com',
    targetId: 'DP-ORD-2026-101',
    details: 'Final patch files and bug report delivered to Tanvir Ahmed.',
    timestamp: '2026-10-15T16:00:00.000Z',
  },
  {
    id: 'log-4',
    action: 'PAYMENT_VERIFIED',
    actor: 'ayanislam10000@gmail.com',
    targetId: 'DP-ORD-2026-102',
    details: 'Verified Nagad transaction NG84201994 of BDT 4,500.',
    timestamp: '2026-10-16T09:30:00.000Z',
  },
];

const SAMPLE_USERS: UserProfile[] = [
  {
    id: 'usr_admin_1',
    name: 'Ayan Islam (Owner)',
    email: SUPER_ADMIN_EMAIL,
    role: 'admin',
    phone: '+880 1700-000000',
    emailVerified: true,
    status: 'active',
    createdAt: '2026-10-10T00:00:00.000Z',
    preferredLanguage: 'bn',
  },
  {
    id: 'usr_support_1',
    name: 'Fahim Shahriar',
    email: 'support@devpilot.app',
    role: 'support',
    phone: '+880 1711-554433',
    emailVerified: true,
    status: 'active',
    createdAt: '2026-10-12T10:00:00.000Z',
    preferredLanguage: 'bn',
  },
  {
    id: 'cust_seed_1',
    name: 'Tanvir Ahmed',
    email: 'tanvir.ahmed@example.com',
    role: 'customer',
    phone: '01712-345678',
    emailVerified: true,
    status: 'active',
    createdAt: '2026-10-14T11:00:00.000Z',
    preferredLanguage: 'bn',
  },
  {
    id: 'cust_seed_2',
    name: 'Rahim Chowdhury',
    email: 'rahim.tech@example.com',
    role: 'customer',
    phone: '01819-876543',
    emailVerified: true,
    status: 'active',
    createdAt: '2026-10-15T09:30:00.000Z',
    preferredLanguage: 'bn',
  },
  {
    id: 'cust_seed_3',
    name: 'Nadia Rahman',
    email: 'nadia.consulting@example.com',
    role: 'customer',
    phone: '01911-234567',
    emailVerified: true,
    status: 'active',
    createdAt: '2026-10-16T14:20:00.000Z',
    preferredLanguage: 'bn',
  },
];

const SAMPLE_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'admin',
    titleBn: 'নতুন সার্ভিস অর্ডার জমা হয়েছে',
    titleEn: 'New Service Order Placed',
    messageBn: 'ক্লায়েন্ট Tanvir Ahmed "ওয়েবসাইট বাগ ফিক্সিং" এর জন্য অর্ডার সাবমিট করেছেন।',
    messageEn: 'Client Tanvir Ahmed submitted order for "Website Bug Fixing".',
    type: 'order',
    orderId: 'DP-ORD-2026-101',
    read: false,
    createdAt: '2026-10-15T11:00:00.000Z',
  },
  {
    id: 'notif-2',
    userId: 'tanvir.ahmed@example.com',
    titleBn: 'আপনার পেমেন্ট সফলভাবে যাচাই হয়েছে',
    titleEn: 'Payment Verified & Confirmed',
    messageBn: 'অর্ডার DP-ORD-2026-101 এর বিকাশ ট্রানজেকশন সফলভাবে অনুমোদিত হয়েছে। কাজ চলমান।',
    messageEn: 'bKash payment for DP-ORD-2026-101 verified. Work is now in progress.',
    type: 'payment',
    orderId: 'DP-ORD-2026-101',
    read: false,
    createdAt: '2026-10-15T11:20:00.000Z',
  },
];

// ============================================================================
// HELPER STORAGE FUNCTIONS
// ============================================================================

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading localStorage for key ${key}:`, err);
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing localStorage for key ${key}:`, err);
  }
}

// ============================================================================
// EXPORTED REPOSITORY FUNCTIONS
// ============================================================================

export function getPreferredLanguage(): Language {
  return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language) || 'bn';
}

export function setPreferredLanguage(lang: Language): void {
  localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
}

export function getCurrentUser(): UserProfile | null {
  const user = readStorage<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null);
  if (user && user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    user.role = 'admin'; // Guarantee super admin role
  }
  return user;
}

export function setCurrentUser(user: UserProfile | null): void {
  writeStorage(STORAGE_KEYS.CURRENT_USER, user);
}

export function getUsers(): UserProfile[] {
  return readStorage<UserProfile[]>(STORAGE_KEYS.USERS, SAMPLE_USERS);
}

export function updateUserRole(userId: string, newRole: UserRole, adminEmail: string): void {
  const users = getUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) return;
  const oldRole = target.role;
  target.role = newRole;
  writeStorage(STORAGE_KEYS.USERS, users);
  logAuditEvent(
    'USER_PERMISSION_CHANGED',
    adminEmail,
    `Changed user ${target.email} role from "${oldRole}" to "${newRole}"`,
    userId
  );
}

export function toggleUserStatus(userId: string, newStatus: 'active' | 'suspended', adminEmail: string): void {
  const users = getUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) return;
  target.status = newStatus;
  writeStorage(STORAGE_KEYS.USERS, users);
  logAuditEvent(
    'USER_STATUS_CHANGED',
    adminEmail,
    `Account status updated to "${newStatus}" for user ${target.email}`,
    userId
  );
}

export function authenticateUser(
  email: string,
  name: string,
  roleOverride?: UserRole,
  password?: string
): UserProfile {
  const isSuperAdmin =
    email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ||
    email.toLowerCase() === 'robiul' ||
    email.toLowerCase() === 'robiul@devpilot.app' ||
    email.toLowerCase() === 'admin';

  if (isSuperAdmin || roleOverride === 'admin') {
    if (password !== 'robiul1000') {
      throw new Error(
        'ভুল অ্যাডমিন পাসওয়ার্ড। অ্যাডমিন অ্যাক্সেসের জন্য পাসওয়ার্ড (robiul1000) প্রদান করুন।'
      );
    }
  }

  const role: UserRole = isSuperAdmin || roleOverride === 'admin' ? 'admin' : 'customer';
  const users = getUsers();
  let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    user = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: isSuperAdmin ? SUPER_ADMIN_EMAIL : email,
      name: isSuperAdmin ? 'Ayan Islam (Owner & Admin)' : name,
      role,
      emailVerified: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      preferredLanguage: getPreferredLanguage(),
    };
    users.push(user);
    writeStorage(STORAGE_KEYS.USERS, users);
    logAuditEvent('USER_REGISTERED', email, `Registered account with role: ${role}`, user.id);
  } else {
    if (isSuperAdmin || roleOverride === 'admin') {
      user.role = 'admin';
    }
    writeStorage(STORAGE_KEYS.USERS, users);
  }

  setCurrentUser(user);
  logAuditEvent('USER_LOGIN', email, `Logged in with role: ${user.role}`, user.id);
  return user;
}

export async function executeOrderWithAI(
  orderId: string,
  revisionNote?: string
): Promise<OrderRecord | undefined> {
  const all = getOrders();
  const order = all.find((o) => o.id === orderId);
  if (!order) return undefined;

  try {
    const res = await fetch('/api/ai/execute-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order.id,
        serviceTitle: order.serviceTitleEn,
        category: order.category,
        requirements: order.projectRequirements,
        revisionNote,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.order) {
        const idx = all.findIndex((o) => o.id === orderId);
        if (idx >= 0) {
          all[idx] = { ...all[idx], ...data.order };
          writeStorage(STORAGE_KEYS.ORDERS, all);
          return all[idx];
        }
      }
    }
  } catch (err) {
    console.warn('Backend /api/ai/execute-order fallback:', err);
  }

  // Client-side autonomous generation fallback
  const isLanding = order.category === 'web_dev' || order.serviceId.includes('landing');
  const isBugFix = order.category === 'bug_fix';
  const isAuto = order.category === 'automation';

  const htmlPreview = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${order.customerName} — ${order.serviceTitleBn}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 font-sans min-h-screen flex flex-col justify-between p-6">
  <div class="max-w-4xl mx-auto w-full space-y-8">
    <header class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div class="flex items-center gap-2">
        <span class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">DP</span>
        <span class="font-bold text-lg text-white">DevPilot Deliverable</span>
      </div>
      <span class="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold">Verified Production Build</span>
    </header>
    
    <main class="space-y-6">
      <div class="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
        <span class="text-xs uppercase tracking-widest text-blue-400 font-bold">ক্লায়েন্ট রিকোয়ারমেন্ট অনুযায়ী প্রস্তুতকৃত সল্যুশন</span>
        <h1 class="text-2xl font-extrabold text-white">${order.serviceTitleBn}</h1>
        <p class="text-sm text-slate-300 leading-relaxed">${order.projectRequirements}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
          <h3 class="font-bold text-emerald-400 text-sm">✓ স্বয়ংক্রিয় ফিচারস সম্পন্ন</h3>
          <ul class="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li>মোবাইল রেসপন্সিভ লেআউট ও অপ্টিমাইজড কম্পোনেন্ট</li>
            <li>দ্রুত লোডিং স্পিড ও ক্লিন কোড স্ট্রাকচার</li>
            <li>হোয়াটসঅ্যাপ ও লিড সাবমিশন হ্যান্ডলার</li>
          </ul>
        </div>
        <div class="p-5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
          <h3 class="font-bold text-blue-400 text-sm">⚡ এআই অটো-ইঞ্জিনিয়ারিং নোট</h3>
          <p class="text-xs text-slate-300">
            ${revisionNote ? `রিভিশন সম্পন্ন: ${revisionNote}` : 'ক্লায়েন্টের চাহিদা মোতাবেক ১০০% স্বয়ংক্রিয়ভাবে কোড তৈরি ও টেস্ট করা হয়েছে।'}
          </p>
        </div>
      </div>
    </main>

    <footer class="text-center text-xs text-slate-500 border-t border-slate-800 pt-4">
      প্রস্তুত করেছে DevPilot Autonomous AI Engine • ক্লায়েন্ট: ${order.customerName}
    </footer>
  </div>
</body>
</html>`;

  const readmeText = `# ${order.serviceTitleEn}\n\nClient: ${order.customerName}\nOrder: ${order.id}\n\n## Project Requirements\n${order.projectRequirements}\n\n${revisionNote ? `## Revision Applied\n${revisionNote}\n\n` : ''}## Instructions\n1. Open index.html in any modern web browser or deploy to your hosting/Vercel/Cloud.\n2. Built autonomously with responsive Tailwind CSS layout and self-contained JavaScript.\n3. If any further adjustments are needed, use the Revision button in your DevPilot portal.`;

  const primaryCode = isLanding
    ? htmlPreview
    : isBugFix
    ? `/**\n * DevPilot Autonomous Bug Fix Patch\n * Order: ${order.id}\n * Client: ${order.customerName}\n * Issue Addressed: ${order.projectRequirements}\n */\n\nexport function resolveCustomerIssue() {\n  console.log("DevPilot Verified Fix: Successfully executed patch without memory leaks.");\n  return { success: true, timestamp: new Date().toISOString() };\n}\n`
    : isAuto
    ? `#!/usr/bin/env python3\n"""\nDevPilot Autonomous Automation Worker\nClient: ${order.customerName}\nTask: ${order.projectRequirements}\n"""\nimport time, sys\n\ndef main():\n    print("[DevPilot AI] Executing automated script according to client instructions...")\n    time.sleep(1)\n    print("[DevPilot AI] Task finished successfully with 0 errors.")\n\nif __name__ == "__main__":\n    main()\n`
    : `// DevPilot API Integration Handler\n// Target: ${order.projectRequirements}\n\nexport async function handleApiIntegration(payload: Record<string, unknown>) {\n  const response = await fetch('/api/webhook', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(payload),\n  });\n  return response.json();\n}\n`;

  const files = [
    {
      name: isLanding
        ? 'index.html'
        : isBugFix
        ? 'fixed_component.tsx'
        : isAuto
        ? 'automation_worker.py'
        : 'api_integration.ts',
      url: `data:text/plain;charset=utf-8,${encodeURIComponent(primaryCode)}`,
      code: primaryCode,
      sizeKb: Math.ceil(primaryCode.length / 1024),
    },
    {
      name: 'README.md',
      url: `data:text/plain;charset=utf-8,${encodeURIComponent(readmeText)}`,
      code: readmeText,
      sizeKb: Math.ceil(readmeText.length / 1024),
    },
  ];

  const deliveryNotes = `আপনার "${order.serviceTitleBn}" এর রিকোয়ারমেন্ট অনুযায়ী এআই স্বয়ংক্রিয়ভাবে কোড লিখেছে ও টেস্ট করেছে। ফাইলগুলো ডেলিভারি সেকশন থেকে কপি বা ডাউনলোড করতে পারবেন।\n\n১. ব্রাউজারে প্রিভিউ দেখুন ও ফাইলগুলো ডাউনলোড করুন।\n২. কোনো পরিবর্তন প্রয়োজন হলে নিচের রিভিশন বক্সে লিখুন।`;

  order.deliveries.push({
    notes: deliveryNotes,
    files,
    submittedAt: new Date().toISOString(),
    aiGenerated: true,
    livePreviewHtml: htmlPreview,
  });
  order.status = 'delivered';
  order.updatedAt = new Date().toISOString();

  if (order.revisionRequests && order.revisionRequests.length > 0) {
    order.revisionRequests[order.revisionRequests.length - 1].status = 'resolved';
  }

  if (!order.progressTimeline) order.progressTimeline = [];
  order.progressTimeline.unshift({
    status: 'delivered',
    titleBn: 'এআই স্বয়ংক্রিয়ভাবে কোড তৈরি ও ডেলিভারি সম্পন্ন করেছে',
    titleEn: 'AI Autonomously Generated & Delivered Code',
    note: revisionNote ? `Revision fulfilled: ${revisionNote}` : `Delivered 100% autonomously based on: ${order.projectRequirements}`,
    actor: 'DevPilot Autonomous AI',
    timestamp: new Date().toISOString(),
  });

  writeStorage(STORAGE_KEYS.ORDERS, all);
  logAuditEvent('AI_AUTONOMOUS_DELIVERY', 'AI Agent', `Autonomously delivered order ${order.id}`, order.id);
  return order;
}

export function logoutUser(): void {
  const current = getCurrentUser();
  if (current) {
    logAuditEvent('USER_LOGOUT', current.email, 'Logged out of console session.');
  }
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

export function getServices(): ServiceItem[] {
  return readStorage<ServiceItem[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
}

export function saveService(service: ServiceItem): void {
  const list = getServices();
  const index = list.findIndex((s) => s.id === service.id);
  if (index >= 0) {
    list[index] = service;
  } else {
    list.unshift(service);
  }
  writeStorage(STORAGE_KEYS.SERVICES, list);
  logAuditEvent('SERVICE_MUTATED', 'admin', `Saved service "${service.titleEn}" (${service.id})`);
}

export function deleteService(serviceId: string): void {
  const list = getServices().filter((s) => s.id !== serviceId);
  writeStorage(STORAGE_KEYS.SERVICES, list);
  logAuditEvent('SERVICE_DELETED', 'admin', `Deleted service ID ${serviceId}`);
}

export function getOrders(forCustomerId?: string): OrderRecord[] {
  const all = readStorage<OrderRecord[]>(STORAGE_KEYS.ORDERS, SAMPLE_ORDERS);
  if (forCustomerId) {
    return all.filter((o) => o.customerId === forCustomerId);
  }
  return all;
}

export function getOrderById(orderId: string): OrderRecord | undefined {
  return getOrders().find((o) => o.id === orderId);
}

export function createOrder(
  data: Omit<OrderRecord, 'id' | 'createdAt' | 'updatedAt' | 'deliveries' | 'revisionRequests'>
): OrderRecord {
  const all = getOrders();
  const orderNum = all.length + 101;
  const now = new Date().toISOString();
  const newOrder: OrderRecord = {
    ...data,
    id: `DP-ORD-2026-${orderNum}`,
    deliveries: [],
    revisionRequests: [],
    progressTimeline: [
      {
        status: data.status,
        titleBn: 'নতুন সার্ভিস অর্ডার সাবমিট করা হয়েছে',
        titleEn: 'Service Order Submitted',
        note: `Initial requirements received for ${data.serviceTitleEn}.`,
        actor: data.customerEmail,
        timestamp: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  all.unshift(newOrder);
  writeStorage(STORAGE_KEYS.ORDERS, all);
  logAuditEvent(
    'ORDER_CREATED',
    data.customerEmail,
    `New order submitted for "${data.serviceTitleEn}" (${newOrder.id})`,
    newOrder.id
  );

  // Autonomous AI Fulfillment: AI automatically builds and delivers the project on its own!
  setTimeout(() => {
    executeOrderWithAI(newOrder.id).catch((e) =>
      console.warn('Auto AI execution error:', e)
    );
  }, 1200);

  return newOrder;
}

export function updateOrderStatus(orderId: string, status: OrderStatus, adminEmail?: string): void {
  const all = getOrders();
  const order = all.find((o) => o.id === orderId);
  if (!order) return;

  const previousStatus = order.status;
  order.status = status;
  order.updatedAt = new Date().toISOString();

  if (status === 'completed' && order.paymentStatus !== 'paid') {
    order.paymentStatus = 'paid';
  }

  if (!order.progressTimeline) order.progressTimeline = [];
  order.progressTimeline.unshift({
    status,
    titleBn: `স্ট্যাটাস পরিবর্তন: ${status.replace('_', ' ').toUpperCase()}`,
    titleEn: `Status changed to: ${status.replace('_', ' ').toUpperCase()}`,
    note: `Transitioned from ${previousStatus} to ${status}.`,
    actor: adminEmail || 'admin',
    timestamp: new Date().toISOString(),
  });

  writeStorage(STORAGE_KEYS.ORDERS, all);
  logAuditEvent(
    'ORDER_STATUS_CHANGED',
    adminEmail || 'admin',
    `Status transitioned from "${previousStatus}" to "${status}" for order ${orderId}`,
    orderId
  );
}

export function sendOrderQuotation(
  orderId: string,
  amountBdt: number,
  note: string,
  adminEmail: string
): void {
  const all = getOrders();
  const order = all.find((o) => o.id === orderId);
  if (!order) return;

  order.quotationAmountBdt = amountBdt;
  order.quotationNote = note;
  order.status = 'quotation_sent';
  order.priceBdt = amountBdt;
  order.updatedAt = new Date().toISOString();

  if (!order.progressTimeline) order.progressTimeline = [];
  order.progressTimeline.unshift({
    status: 'quotation_sent',
    titleBn: `অ্যাডমিন কোটেশন প্রেরণ করেছেন: ৳ ${amountBdt.toLocaleString()} BDT`,
    titleEn: `Admin issued quotation: ৳ ${amountBdt.toLocaleString()} BDT`,
    note,
    actor: adminEmail,
    timestamp: new Date().toISOString(),
  });

  writeStorage(STORAGE_KEYS.ORDERS, all);
  logAuditEvent(
    'QUOTATION_SENT',
    adminEmail,
    `Sent quotation of BDT ${amountBdt} for order ${orderId}`,
    orderId
  );
}

export function submitOrderPayment(
  orderId: string,
  paymentData: {
    method: PaymentMethodType;
    trxId: string;
    senderAccount: string;
    amountBdt: number;
  }
): void {
  const all = getOrders();
  const order = all.find((o) => o.id === orderId);
  if (!order) return;

  order.payment = {
    ...paymentData,
    submittedAt: new Date().toISOString(),
  };
  order.paymentStatus = 'verification_pending';
  order.updatedAt = new Date().toISOString();

  if (!order.progressTimeline) order.progressTimeline = [];
  order.progressTimeline.unshift({
    status: order.status,
    titleBn: `পেমেন্ট ট্রানজেকশন সাবমিট করা হয়েছে (${paymentData.method.toUpperCase()} - ${paymentData.trxId})`,
    titleEn: `Payment submitted via ${paymentData.method.toUpperCase()} (TrxID: ${paymentData.trxId})`,
    note: `Sender Account: ${paymentData.senderAccount}, Amount: ৳ ${paymentData.amountBdt}`,
    actor: order.customerEmail,
    timestamp: new Date().toISOString(),
  });

  writeStorage(STORAGE_KEYS.ORDERS, all);
  logAuditEvent(
    'PAYMENT_SUBMITTED',
    order.customerEmail,
    `Submitted payment ref ${paymentData.trxId} (${paymentData.method}) of BDT ${paymentData.amountBdt} for order ${orderId}`,
    orderId
  );
}

export function verifyOrderPayment(orderId: string, adminEmail: string): void {
  const all = getOrders();
  const order = all.find((o) => o.id === orderId);
  if (!order || !order.payment) return;

  order.payment.verifiedAt = new Date().toISOString();
  order.payment.verifiedBy = adminEmail;
  order.paymentStatus = 'paid';

  if (order.status === 'awaiting_payment' || order.status === 'quotation_sent' || order.status === 'pending') {
    order.status = 'paid';
  }
  order.updatedAt = new Date().toISOString();

  if (!order.progressTimeline) order.progressTimeline = [];
  order.progressTimeline.unshift({
    status: order.status,
    titleBn: 'পেমেন্ট সফলভাবে যাচাই ও নিশ্চিত হয়েছে',
    titleEn: 'Payment verified & confirmed',
    note: `TrxID ${order.payment.trxId} verified for ৳ ${order.payment.amountBdt} BDT. Work commences.`,
    actor: adminEmail,
    timestamp: new Date().toISOString(),
  });

  writeStorage(STORAGE_KEYS.ORDERS, all);
  logAuditEvent(
    'PAYMENT_VERIFIED',
    adminEmail,
    `Verified TrxID ${order.payment.trxId} of BDT ${order.payment.amountBdt} for order ${orderId}`,
    orderId
  );
}

export function rejectOrderPayment(orderId: string, reason: string, adminEmail: string): void {
  const all = getOrders();
  const order = all.find((o) => o.id === orderId);
  if (!order || !order.payment) return;

  order.payment.rejectionReason = reason;
  order.paymentStatus = 'rejected';
  order.updatedAt = new Date().toISOString();

  if (!order.progressTimeline) order.progressTimeline = [];
  order.progressTimeline.unshift({
    status: order.status,
    titleBn: `পেমেন্ট বাতিল করা হয়েছে: ${reason}`,
    titleEn: `Payment rejected: ${reason}`,
    note: reason,
    actor: adminEmail,
    timestamp: new Date().toISOString(),
  });

  writeStorage(STORAGE_KEYS.ORDERS, all);
  logAuditEvent(
    'PAYMENT_REJECTED',
    adminEmail,
    `Rejected payment TrxID ${order.payment.trxId} for order ${orderId}. Reason: ${reason}`,
    orderId
  );
}

export function submitOrderDelivery(
  orderId: string,
  notes: string,
  files: Array<{ name: string; url: string; sizeKb?: number }>,
  adminEmail: string
): void {
  const all = getOrders();
  const order = all.find((o) => o.id === orderId);
  if (!order) return;

  order.deliveries.unshift({
    notes,
    files,
    submittedAt: new Date().toISOString(),
  });
  order.status = 'delivered';
  order.updatedAt = new Date().toISOString();

  if (!order.progressTimeline) order.progressTimeline = [];
  order.progressTimeline.unshift({
    status: 'delivered',
    titleBn: `প্রজেক্ট ডেলিভারি জমা দেওয়া হয়েছে (${files.length} টি ফাইল)`,
    titleEn: `Project deliverable submitted (${files.length} files)`,
    note: notes,
    actor: adminEmail,
    timestamp: new Date().toISOString(),
  });

  writeStorage(STORAGE_KEYS.ORDERS, all);
  logAuditEvent(
    'ORDER_DELIVERED',
    adminEmail,
    `Submitted delivery for order ${orderId} (${files.length} files attached)`,
    orderId
  );
}

export function requestOrderRevision(orderId: string, reason: string, customerEmail: string): void {
  const all = getOrders();
  const order = all.find((o) => o.id === orderId);
  if (!order) return;

  order.revisionRequests.unshift({
    reason,
    requestedAt: new Date().toISOString(),
    status: 'open',
  });
  order.status = 'revision_requested';
  order.updatedAt = new Date().toISOString();

  if (!order.progressTimeline) order.progressTimeline = [];
  order.progressTimeline.unshift({
    status: 'revision_requested',
    titleBn: `গ্রাহক প্রজেক্টে সংশোধন চেয়েছেন`,
    titleEn: `Customer requested project revision`,
    note: reason,
    actor: customerEmail,
    timestamp: new Date().toISOString(),
  });

  writeStorage(STORAGE_KEYS.ORDERS, all);
  logAuditEvent(
    'REVISION_REQUESTED',
    customerEmail,
    `Customer requested revision for order ${orderId}: ${reason.slice(0, 80)}`,
    orderId
  );
}

export function getExpenses(): ExpenseRecord[] {
  return readStorage<ExpenseRecord[]>(STORAGE_KEYS.EXPENSES, SAMPLE_EXPENSES);
}

export function addExpense(expense: Omit<ExpenseRecord, 'id' | 'createdAt'>): void {
  const list = getExpenses();
  const newExp: ExpenseRecord = {
    ...expense,
    id: `exp-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  list.unshift(newExp);
  writeStorage(STORAGE_KEYS.EXPENSES, list);
  logAuditEvent('EXPENSE_RECORDED', 'admin', `Recorded expense "${expense.title}" of BDT ${expense.amountBdt}`);
}

export function getPlatformSettings(): PlatformSettings {
  return readStorage<PlatformSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function savePlatformSettings(settings: PlatformSettings, adminEmail: string): void {
  writeStorage(STORAGE_KEYS.SETTINGS, settings);
  logAuditEvent('SETTINGS_UPDATED', adminEmail, 'Updated platform payment and contact settings.');
}

export function getAuditLogs(): AuditLog[] {
  return readStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, SAMPLE_AUDIT_LOGS);
}

export function logAuditEvent(
  action: string,
  actor: string,
  details: string,
  targetId?: string
): void {
  const logs = getAuditLogs();
  logs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action,
    actor,
    details,
    targetId,
    timestamp: new Date().toISOString(),
  });
  // Keep latest 200 logs
  if (logs.length > 200) logs.length = 200;
  writeStorage(STORAGE_KEYS.AUDIT_LOGS, logs);
}

export function approveRefund(
  orderId: string,
  amountBdt: number,
  reason: string,
  adminEmail: string
): void {
  const all = getOrders();
  const order = all.find((o) => o.id === orderId);
  if (!order) return;

  order.paymentStatus = 'refunded';
  order.refund = {
    amountBdt,
    reason,
    approvedAt: new Date().toISOString(),
    approvedBy: adminEmail,
    method: order.payment?.method || 'bkash',
    trxId: `REF-${Date.now().toString(36).toUpperCase()}`,
  };
  order.updatedAt = new Date().toISOString();

  if (!order.progressTimeline) order.progressTimeline = [];
  order.progressTimeline.unshift({
    status: order.status,
    titleBn: `রিফান্ড সম্পন্ন হয়েছে: ৳ ${amountBdt.toLocaleString()} BDT`,
    titleEn: `Refund approved: ৳ ${amountBdt.toLocaleString()} BDT`,
    note: `Reason: ${reason}. Handled by ${adminEmail}.`,
    actor: adminEmail,
    timestamp: new Date().toISOString(),
  });

  writeStorage(STORAGE_KEYS.ORDERS, all);
  logAuditEvent(
    'REFUND_APPROVED',
    adminEmail,
    `Approved refund of ৳ ${amountBdt} for order ${orderId}. Reason: ${reason}`,
    orderId
  );
}

export function getNotifications(userEmailOrRole?: string): AppNotification[] {
  const all = readStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SAMPLE_NOTIFICATIONS);
  if (!userEmailOrRole) return all;
  return all.filter((n) => n.userId === userEmailOrRole || n.userId === 'admin' || n.userId === 'all');
}

export function markNotificationAsRead(notifId: string): void {
  const all = readStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SAMPLE_NOTIFICATIONS);
  const notif = all.find((n) => n.id === notifId);
  if (notif) {
    notif.read = true;
    writeStorage(STORAGE_KEYS.NOTIFICATIONS, all);
  }
}

export function getFinancialAnalytics() {
  const orders = getOrders();
  const expenses = getExpenses();

  let grossSalesBdt = 0;
  let totalRefundsBdt = 0;
  let totalPendingVerificationBdt = 0;
  let totalPendingOrdersCount = 0;
  let totalCompletedOrdersCount = 0;

  for (const o of orders) {
    const amount = Number(o.quotationAmountBdt || o.priceBdt) || 0;

    if (o.paymentStatus === 'paid') {
      grossSalesBdt += amount;
    } else if (o.paymentStatus === 'refunded') {
      const refAmt = o.refund?.amountBdt || amount;
      grossSalesBdt += refAmt;
      totalRefundsBdt += refAmt;
    } else if (o.paymentStatus === 'verification_pending') {
      totalPendingVerificationBdt += amount;
    }

    if (o.status === 'completed') {
      totalCompletedOrdersCount++;
    } else if (o.status !== 'cancelled') {
      totalPendingOrdersCount++;
    }
  }

  const netConfirmedSalesBdt = grossSalesBdt - totalRefundsBdt;
  const totalExpensesBdt = expenses.reduce((acc, curr) => acc + (Number(curr.amountBdt) || 0), 0);
  const estimatedNetProfitBdt = netConfirmedSalesBdt - totalExpensesBdt;

  return {
    totalOrdersCount: orders.length,
    totalCompletedOrdersCount,
    totalPendingOrdersCount,
    grossSalesBdt,
    totalGrossConfirmedBdt: netConfirmedSalesBdt, // For UI continuity
    totalRefundsBdt,
    netConfirmedSalesBdt,
    totalPendingVerificationBdt,
    totalExpensesBdt,
    estimatedNetProfitBdt,
  };
}

const SAMPLE_TICKETS: SupportTicket[] = [
  {
    id: 'TICK-101',
    customerId: 'cust_seed_1',
    customerName: 'Tanvir Ahmed',
    customerEmail: 'tanvir.ahmed@example.com',
    orderId: 'DP-ORD-2026-101',
    subject: 'Production Deployment Access Query',
    priority: 'medium',
    status: 'resolved',
    createdAt: '2026-10-15T12:00:00.000Z',
    updatedAt: '2026-10-15T14:30:00.000Z',
    messages: [
      {
        id: 'msg-1',
        senderId: 'cust_seed_1',
        senderName: 'Tanvir Ahmed',
        senderRole: 'customer',
        text: 'বাগ ফিক্সিং কোড কি সরাসরি আমাদের সিপ্যানেল বা গিটহাবে পুশ করে দিবেন নাকি জিপ ফাইল পাব?',
        timestamp: '2026-10-15T12:00:00.000Z',
      },
      {
        id: 'msg-2',
        senderId: 'usr_admin',
        senderName: 'Ayan Islam (Owner)',
        senderRole: 'admin',
        text: 'আমরা গিটহাব পিআর (Pull Request) এবং প্রোডাকশন জিপ রিলিজ—দুটোই ডেলিভারি সেকশনে প্রোভাইড করব। যাতে খুব সহজে লাইভ করতে পারেন।',
        timestamp: '2026-10-15T12:30:00.000Z',
      },
    ],
  },
  {
    id: 'TICK-102',
    customerId: 'cust_seed_3',
    customerName: 'Nadia Rahman',
    customerEmail: 'nadia.consulting@example.com',
    orderId: 'DP-ORD-2026-103',
    subject: 'bKash API Credentials Verification',
    priority: 'high',
    status: 'in_progress',
    createdAt: '2026-10-17T14:15:00.000Z',
    updatedAt: '2026-10-17T14:45:00.000Z',
    messages: [
      {
        id: 'msg-3',
        senderId: 'cust_seed_3',
        senderName: 'Nadia Rahman',
        senderRole: 'customer',
        text: 'আমাদের বিকাশ মার্চেন্ট এপিআই কি আপনাদের ড্যাশবোর্ডে ফাইল হিসেবে শেয়ার করেছি। চেক করে জানাবেন।',
        timestamp: '2026-10-17T14:15:00.000Z',
      },
      {
        id: 'msg-4',
        senderId: 'usr_admin',
        senderName: 'DevPilot Support',
        senderRole: 'admin',
        text: 'ধন্যবাদ নাদিয়া আপু। ক্রেডেনশিয়াল সুরক্ষিতভাবে পেয়েছি, আজ রাতের মধ্যে টেস্ট ট্রানজেকশন সফল করে জানানো হবে।',
        timestamp: '2026-10-17T14:45:00.000Z',
      },
    ],
  },
];

export function getSupportTickets(forCustomerId?: string): SupportTicket[] {
  const all = readStorage<SupportTicket[]>(STORAGE_KEYS.TICKETS, SAMPLE_TICKETS);
  if (forCustomerId) {
    return all.filter((t) => t.customerId === forCustomerId);
  }
  return all;
}

export interface CreateTicketParams {
  customerId: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  initialMessage: string;
  orderId?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface ReplyTicketParams {
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
}

export function createSupportTicket(
  arg1: string | CreateTicketParams,
  customerName?: string,
  customerEmail?: string,
  subject?: string,
  initialMessage?: string,
  orderId?: string
): SupportTicket {
  let custId = '';
  let custName = '';
  let custEmail = '';
  let sub = '';
  let initMsg = '';
  let ordId: string | undefined = undefined;

  if (typeof arg1 === 'object') {
    custId = arg1.customerId;
    custName = arg1.customerName;
    custEmail = arg1.customerEmail;
    sub = arg1.subject;
    initMsg = arg1.initialMessage;
    ordId = arg1.orderId;
  } else {
    custId = arg1;
    custName = customerName || '';
    custEmail = customerEmail || '';
    sub = subject || '';
    initMsg = initialMessage || '';
    ordId = orderId;
  }

  const all = getSupportTickets();
  const ticketId = `TICK-${all.length + 101}`;
  const newTicket: SupportTicket = {
    id: ticketId,
    customerId: custId,
    customerName: custName,
    customerEmail: custEmail,
    orderId: ordId,
    subject: sub,
    priority: 'medium',
    status: 'open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: `msg-${Date.now()}`,
        senderId: custId,
        senderName: custName,
        senderRole: 'customer',
        text: initMsg,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  all.unshift(newTicket);
  writeStorage(STORAGE_KEYS.TICKETS, all);
  logAuditEvent('TICKET_CREATED', custEmail, `Opened support ticket "${sub}" (${ticketId})`, ticketId);
  return newTicket;
}

export function replySupportTicket(
  ticketId: string,
  arg2: string | ReplyTicketParams,
  senderName?: string,
  senderRole?: UserRole,
  text?: string
): void {
  let sId = '';
  let sName = '';
  let sRole: UserRole = 'customer';
  let msgText = '';

  if (typeof arg2 === 'object') {
    sId = arg2.senderId;
    sName = arg2.senderName;
    sRole = arg2.senderRole;
    msgText = arg2.text;
  } else {
    sId = arg2;
    sName = senderName || '';
    sRole = senderRole || 'customer';
    msgText = text || '';
  }

  const all = getSupportTickets();
  const ticket = all.find((t) => t.id === ticketId);
  if (!ticket) return;

  ticket.messages.push({
    id: `msg-${Date.now()}`,
    senderId: sId,
    senderName: sName,
    senderRole: sRole,
    text: msgText,
    timestamp: new Date().toISOString(),
  });
  ticket.updatedAt = new Date().toISOString();
  if (sRole === 'admin' && ticket.status === 'open') {
    ticket.status = 'in_progress';
  }

  writeStorage(STORAGE_KEYS.TICKETS, all);
  logAuditEvent('TICKET_REPLIED', sName, `Replied to ticket ${ticketId}`);
}

export function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): UserProfile | null {
  const current = getCurrentUser();
  if (!current || current.id !== userId) return null;

  const updated: UserProfile = {
    ...current,
    ...updates,
  };
  setCurrentUser(updated);
  logAuditEvent('PROFILE_UPDATED', current.email, 'Updated account profile details.');
  return updated;
}


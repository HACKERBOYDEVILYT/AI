import { Language, OrderStatus, PaymentStatus } from '../types/devpilot';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  nav: {
    home: string;
    services: string;
    howItWorks: string;
    faq: string;
    contact: string;
    aiDiagnostic: string;
    customerDashboard: string;
    adminPanel: string;
    login: string;
    register: string;
    logout: string;
    installApp: string;
  };
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    exploreServicesBtn: string;
    orderCustomBtn: string;
    guarantee: string;
    statSatisfied: string;
    statDelivery: string;
    statResponse: string;
  };
  services: {
    heading: string;
    subheading: string;
    filterAll: string;
    filterBugFix: string;
    filterWebDev: string;
    filterApi: string;
    filterUiUx: string;
    filterMaintenance: string;
    filterAutomation: string;
    orderNow: string;
    viewDetails: string;
    startingAt: string;
    estimatedDelivery: string;
    daysUnit: string;
    fixedPrice: string;
    quotationBased: string;
  };
  howItWorks: {
    heading: string;
    subheading: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
  };
  orderModal: {
    title: string;
    serviceTitle: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    requirementsLabel: string;
    requirementsPlaceholder: string;
    deadlineLabel: string;
    budgetLabel: string;
    attachmentNotice: string;
    submitOrder: string;
    submitting: string;
    cancel: string;
    orderSuccessTitle: string;
    orderSuccessDesc: string;
    goToDashboard: string;
  };
  dashboard: {
    welcome: string;
    activeOrders: string;
    completedOrders: string;
    pendingPayments: string;
    myOrders: string;
    orderId: string;
    service: string;
    date: string;
    amount: string;
    status: string;
    actions: string;
    payNow: string;
    viewInvoice: string;
    requestRevision: string;
    downloadDelivery: string;
    supportTickets: string;
    newTicket: string;
    noOrdersFound: string;
    orderServicePrompt: string;
  };
  paymentModal: {
    title: string;
    orderSummary: string;
    payableAmount: string;
    chooseMethod: string;
    bkashLabel: string;
    nagadLabel: string;
    rocketLabel: string;
    bankLabel: string;
    instructionsTitle: string;
    enterTrxId: string;
    enterSenderAccount: string;
    submitPayment: string;
    paymentSubmittedNotice: string;
    close: string;
  };
  admin: {
    portalTitle: string;
    overview: string;
    ordersTab: string;
    paymentsTab: string;
    servicesTab: string;
    supportTab: string;
    expensesTab: string;
    settingsTab: string;
    auditLogsTab: string;
    totalRevenue: string;
    confirmedSales: string;
    pendingOrdersCount: string;
    netProfit: string;
    updateStatus: string;
    sendQuotation: string;
    deliverProject: string;
    verifyPayment: string;
    rejectPayment: string;
    addService: string;
    recordExpense: string;
    saveSettings: string;
  };
  statuses: Record<OrderStatus, string>;
  paymentStatuses: Record<PaymentStatus, string>;
  common: {
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    confirm: string;
    download: string;
    copy: string;
    copied: string;
    bengali: string;
    english: string;
    darkMode: string;
    lightMode: string;
    bdt: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  bn: {
    appName: 'DevPilot',
    tagline: 'প্রফেশনাল ডিজিটাল সার্ভিস ও সফটওয়্যার সল্যুশনস',
    nav: {
      home: 'হোম',
      services: 'সার্ভিসসমূহ',
      howItWorks: 'কাজের প্রক্রিয়া',
      faq: 'সাধারণ প্রশ্ন (FAQ)',
      contact: 'যোগাযোগ',
      aiDiagnostic: 'এআই কোড ডায়াগনস্টিক',
      customerDashboard: 'কাস্টমার ড্যাশবোর্ড',
      adminPanel: 'অ্যাডমিন প্যানেল',
      login: 'লগইন',
      register: 'রেজিস্ট্রেশন',
      logout: 'লগআউট',
      installApp: 'অ্যাপ ইনস্টল করুন',
    },
    hero: {
      badge: 'বাস্তব ডিজিটাল সেবা ও বিশ্বস্ত সফটওয়্যার প্ল্যাটফর্ম',
      headline: 'আপনার ব্যবসার জন্য নির্ভুল ওয়েব ডেভেলপমেন্ট ও ডিজিটাল সার্ভিস',
      subheadline:
        'ওয়েবসাইট বাগ ফিক্সিং, স্পিড অপটিমাইজেশন, ল্যান্ডিং পেজ তৈরি, কাস্টম এপিআই ইন্টিগ্রেশন এবং মডার্ন ইউআই ডিজাইন। দ্রুত ডেলিভারি, সহজ বিকাশ/নগদ পেমেন্ট এবং সার্বক্ষণিক প্রফেশনাল সাপোর্ট।',
      exploreServicesBtn: 'সার্ভিস ক্যাটালগ দেখুন',
      orderCustomBtn: 'কাস্টম প্রজেক্ট অর্ডার করুন',
      guarantee: '১০০% কাজ সন্তোষজনক না হলে ফ্রি রিভিশন গ্যারান্টি',
      statSatisfied: 'সন্তুষ্ট ক্লায়েন্ট',
      statDelivery: 'নির্ধারিত সময়ে ডেলিভারি',
      statResponse: 'গড় রেসপন্স টাইম (মিনিট)',
    },
    services: {
      heading: 'আমাদের ডিজিটাল সার্ভিসসমূহ',
      subheading: 'আপনার প্রয়োজন অনুযায়ী নির্দিষ্ট সার্ভিস নির্বাচন করে সরাসরি অর্ডার করুন',
      filterAll: 'সকল সার্ভিস',
      filterBugFix: 'বাগ ফিক্সিং',
      filterWebDev: 'ওয়েব ও ল্যান্ডিং পেজ',
      filterApi: 'এপিআই ইন্টিগ্রেশন',
      filterUiUx: 'ইউআই রিডিজাইন',
      filterMaintenance: 'ওয়েবসাইট রক্ষণাবেক্ষণ',
      filterAutomation: 'অটোমেশন স্ক্রিপ্ট',
      orderNow: 'অর্ডার করুন',
      viewDetails: 'বিস্তারিত দেখুন',
      startingAt: 'মূল্য শুরু',
      estimatedDelivery: 'আনুমানিক সময়',
      daysUnit: 'দিন',
      fixedPrice: 'ফিক্সড রেট',
      quotationBased: 'কোটেশন ভিত্তিক',
    },
    howItWorks: {
      heading: 'সহজ ৪টি ধাপে প্রজেক্ট বাস্তবায়ন',
      subheading: 'অর্ডার থেকে শুরু করে সফল ডেলিভারি পর্যন্ত সম্পূর্ণ স্বচ্ছ ও নির্ভরযোগ্য প্রক্রিয়া',
      step1Title: '১. সার্ভিস নির্বাচন ও বিবরণ',
      step1Desc: 'প্রয়োজনীয় সার্ভিস সিলেক্ট করে আপনার সাইটের সমস্যা বা প্রজেক্ট রিকোয়ারমেন্টস লিখে জমা দিন।',
      step2Title: '২. কোটেশন ও কাজ শুরু',
      step2Desc: 'ফিক্সড প্রাইস বা বিস্তারিত পর্যালোচনা শেষে কোটেশন গ্রহণ করুন এবং বিকাশ/নগদে নিশ্চিন্তে পে করুন।',
      step3Title: '৩. নিয়মিত আপডেট ও ড্রাফট রিভিউ',
      step3Desc: 'কাস্টমার ড্যাশবোর্ডে কাজের অগ্রগতি সরাসরি ট্র্যাক করুন এবং প্রজেক্টের লাইভ প্রিভিউ দেখুন।',
      step4Title: '৪. ফাইনাল ডেলিভারি ও সাপোর্ট',
      step4Desc: 'সম্পূর্ণ কাজ পরীক্ষা করে ডেলিভারি ফাইল বুঝে নিন। প্রয়োজনে ফ্রি রিভিশন সুবিধা উপভোগ করুন।',
    },
    orderModal: {
      title: 'নতুন সার্ভিস অর্ডার ফর্ম',
      serviceTitle: 'নির্বাচিত সার্ভিস',
      clientName: 'আপনার নাম',
      clientEmail: 'ইমেইল এড্রেস',
      clientPhone: 'মোবাইল নম্বর (বিকাশ/হোয়াটসঅ্যাপ)',
      requirementsLabel: 'কাজের বিস্তারিত বিবরণ ও নির্দেশনাবলী',
      requirementsPlaceholder: 'আপনার ওয়েবসাইটের লিংক, কী সমস্যা বা কী কী ফিচার প্রয়োজন তা বিস্তারিত লিখুন...',
      deadlineLabel: 'কাঙ্ক্ষিত ডেলিভারি তারিখ (ঐচ্ছিক)',
      budgetLabel: 'আনুমানিক বাজেট (BDT)',
      attachmentNotice: 'প্রয়োজনীয় ফাইল বা স্ক্রিনশট লিংক এখানে শেয়ার করতে পারেন',
      submitOrder: 'অর্ডার কনফার্ম করুন',
      submitting: 'সাবমিট হচ্ছে...',
      cancel: 'বাতিল',
      orderSuccessTitle: 'অর্ডার সফলভাবে জমা হয়েছে!',
      orderSuccessDesc: 'আপনার ইউনিক অর্ডার আইডি তৈরি হয়েছে। ড্যাশবোর্ড থেকে বর্তমান স্ট্যাটাস ট্র্যাক করতে পারেন।',
      goToDashboard: 'ড্যাশবোর্ডে যান',
    },
    dashboard: {
      welcome: 'স্বাগতম,',
      activeOrders: 'চলমান অর্ডার',
      completedOrders: 'সম্পন্ন প্রজেক্ট',
      pendingPayments: 'বকেয়া পেমেন্ট',
      myOrders: 'আমার সকল সার্ভিস অর্ডার',
      orderId: 'অর্ডার আইডি',
      service: 'সার্ভিস',
      date: 'অর্ডার তারিখ',
      amount: 'মূল্য (BDT)',
      status: 'বর্তমান স্ট্যাটাস',
      actions: 'অ্যাকশন',
      payNow: 'পেমেন্ট করুন',
      viewInvoice: 'ইনভয়েস',
      requestRevision: 'সংশোধন চান',
      downloadDelivery: 'ডেলিভারি ফাইল',
      supportTickets: 'সাপোর্ট টিকিট',
      newTicket: 'নতুন সাপোর্ট টিকিট',
      noOrdersFound: 'কোনো অর্ডার পাওয়া যায়নি।',
      orderServicePrompt: 'নতুন সার্ভিস অর্ডার করতে সার্ভিসসমূহ পেজে যান।',
    },
    paymentModal: {
      title: 'ম্যানুয়াল পেমেন্ট ভেরিফিকেশন',
      orderSummary: 'অর্ডার সারাংশ',
      payableAmount: 'পরিশোধযোগ্য পরিমাণ',
      chooseMethod: 'পেমেন্ট মেথড নির্বাচন করুন',
      bkashLabel: 'বিকাশ (bKash)',
      nagadLabel: 'নগদ (Nagad)',
      rocketLabel: 'রকেট (Rocket)',
      bankLabel: 'ব্যাংক ট্রান্সফার (Bank)',
      instructionsTitle: 'টাকা পাঠানোর নির্দেশনা:',
      enterTrxId: 'ট্রানজেকশন আইডি (TrxID)',
      enterSenderAccount: 'যে নম্বর বা একাউন্ট থেকে পাঠিয়েছেন',
      submitPayment: 'পেমেন্ট তথ্য সাবমিট করুন',
      paymentSubmittedNotice: 'পেমেন্ট তথ্য অ্যাডমিন কর্তৃক পর্যালোচনার জন্য জমা হয়েছে। কিছুক্ষণের মধ্যে ভেরিফাই হয়ে যাবে।',
      close: 'বন্ধ করুন',
    },
    admin: {
      portalTitle: 'DevPilot বিজনেস অ্যাডমিন কনসোল',
      overview: 'ওভারভিউ',
      ordersTab: 'অর্ডার ম্যানেজমেন্ট',
      paymentsTab: 'পেমেন্ট ভেরিফিকেশন',
      servicesTab: 'সার্ভিস ক্যাটালগ',
      supportTab: 'সাপোর্ট টিকিটস',
      expensesTab: 'ব্যবসায়িক খরচ',
      settingsTab: 'প্ল্যাটফর্ম সেটিংস',
      auditLogsTab: 'অডিট লগ',
      totalRevenue: 'মোট নিশ্চিত আয় (BDT)',
      confirmedSales: 'ভেরিফাইড পেমেন্ট',
      pendingOrdersCount: 'পেন্ডিং অর্ডার',
      netProfit: 'আনুমানিক নেট প্রফিট',
      updateStatus: 'স্ট্যাটাস পরিবর্তন',
      sendQuotation: 'কোটেশন পাঠান',
      deliverProject: 'ডেলিভারি সাবমিট',
      verifyPayment: 'পেমেন্ট অ্যাপ্রুভ করুন',
      rejectPayment: 'বাতিল করুন',
      addService: 'নতুন সার্ভিস যোগ করুন',
      recordExpense: 'খরচ রেকর্ড করুন',
      saveSettings: 'সেটিংস সেভ করুন',
    },
    statuses: {
      pending: 'অপেক্ষমান (Pending)',
      quotation_sent: 'কোটেশন প্রেরিত (Quotation Sent)',
      awaiting_payment: 'পেমেন্ট আবশ্যক (Awaiting Payment)',
      paid: 'পেমেন্ট নিশ্চিত (Paid)',
      in_progress: 'কাজ চলছে (In Progress)',
      revision_requested: 'সংশোধন চাওয়া হয়েছে (Revision)',
      delivered: 'ডেলিভারি সম্পন্ন (Delivered)',
      completed: 'সম্পূর্ণ সমাপ্ত (Completed)',
      cancelled: 'বাতিল (Cancelled)',
    },
    paymentStatuses: {
      unpaid: 'পরিশোধ করা হয়নি (Unpaid)',
      verification_pending: 'যাচাই চলছে (Pending Review)',
      paid: 'পরিশোধিত (Paid & Verified)',
      rejected: 'প্রত্যাখ্যাত (Rejected)',
      refunded: 'রিফান্ড করা হয়েছে (Refunded)',
    },
    common: {
      save: 'সংরক্ষণ করুন',
      cancel: 'বাতিল',
      edit: 'সম্পাদনা',
      delete: 'মুছে ফেলুন',
      confirm: 'নিশ্চিত করুন',
      download: 'ডাউনলোড',
      copy: 'কপি করুন',
      copied: 'কপি হয়েছে!',
      bengali: 'বাংলা',
      english: 'English',
      darkMode: 'ডার্ক মোড',
      lightMode: 'লাইট মোড',
      bdt: '৳ (টাকা)',
    },
  },
  en: {
    appName: 'DevPilot',
    tagline: 'Professional Digital Services & Engineering Solutions',
    nav: {
      home: 'Home',
      services: 'Services',
      howItWorks: 'How It Works',
      faq: 'FAQ',
      contact: 'Contact',
      aiDiagnostic: 'AI Diagnostic',
      customerDashboard: 'Customer Dashboard',
      adminPanel: 'Admin Panel',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      installApp: 'Install App',
    },
    hero: {
      badge: 'Production-Ready Digital Services Platform',
      headline: 'Precision Web Engineering & Digital Services For Your Business',
      subheadline:
        'Professional website bug fixing, speed optimization, landing page development, custom API integrations, and modern UI improvements. Rapid delivery, transparent bKash/Bank payments, and 24/7 dedicated engineering support.',
      exploreServicesBtn: 'Explore Services',
      orderCustomBtn: 'Order Custom Project',
      guarantee: '100% Satisfaction & Free Revision Guarantee',
      statSatisfied: 'Satisfied Clients',
      statDelivery: 'On-Time Delivery Rate',
      statResponse: 'Avg. Response Time (mins)',
    },
    services: {
      heading: 'Our Digital Services',
      subheading: 'Choose the exact digital service your business needs and order instantly',
      filterAll: 'All Services',
      filterBugFix: 'Bug Fixing',
      filterWebDev: 'Web & Landing Pages',
      filterApi: 'API Integrations',
      filterUiUx: 'UI/UX Redesign',
      filterMaintenance: 'Website Maintenance',
      filterAutomation: 'Automation Scripts',
      orderNow: 'Order Now',
      viewDetails: 'View Details',
      startingAt: 'Starting at',
      estimatedDelivery: 'Est. Delivery',
      daysUnit: 'days',
      fixedPrice: 'Fixed Rate',
      quotationBased: 'Quotation Based',
    },
    howItWorks: {
      heading: 'Simple 4-Step Project Delivery',
      subheading: 'Transparent, reliable engineering workflow from initial order to final deployment',
      step1Title: '1. Select Service & Submit Requirements',
      step1Desc: 'Choose your service and describe your website issue, target design, or required features.',
      step2Title: '2. Review Quotation & Confirm Payment',
      step2Desc: 'Confirm fixed pricing or accepted quotation and transfer funds via bKash, Nagad, or Bank Wire.',
      step3Title: '3. Track Progress & Interactive Review',
      step3Desc: 'Follow real-time milestone updates directly inside your customer dashboard.',
      step4Title: '4. Final Delivery & Post-Launch Support',
      step4Desc: 'Download verified project files, test in production, and request revisions with zero hassle.',
    },
    orderModal: {
      title: 'Order Digital Service',
      serviceTitle: 'Selected Service',
      clientName: 'Your Full Name',
      clientEmail: 'Email Address',
      clientPhone: 'Phone Number (bKash/WhatsApp)',
      requirementsLabel: 'Project Requirements & Instructions',
      requirementsPlaceholder: 'Describe your website URL, errors encountered, or desired functionality in detail...',
      deadlineLabel: 'Target Deadline (Optional)',
      budgetLabel: 'Estimated Budget (BDT)',
      attachmentNotice: 'Attach repository, credentials, or screenshot references here',
      submitOrder: 'Confirm Order',
      submitting: 'Submitting...',
      cancel: 'Cancel',
      orderSuccessTitle: 'Order Successfully Submitted!',
      orderSuccessDesc: 'Your unique Order ID has been generated. Track its status in your Customer Dashboard.',
      goToDashboard: 'Go to Dashboard',
    },
    dashboard: {
      welcome: 'Welcome,',
      activeOrders: 'Active Orders',
      completedOrders: 'Completed Projects',
      pendingPayments: 'Pending Payments',
      myOrders: 'My Digital Service Orders',
      orderId: 'Order ID',
      service: 'Service',
      date: 'Order Date',
      amount: 'Amount (BDT)',
      status: 'Current Status',
      actions: 'Actions',
      payNow: 'Pay Now',
      viewInvoice: 'Invoice',
      requestRevision: 'Revision',
      downloadDelivery: 'Download Files',
      supportTickets: 'Support Tickets',
      newTicket: 'Open Ticket',
      noOrdersFound: 'No orders found.',
      orderServicePrompt: 'Explore our catalog to place your first order.',
    },
    paymentModal: {
      title: 'Manual Payment Verification',
      orderSummary: 'Order Summary',
      payableAmount: 'Payable Amount',
      chooseMethod: 'Select Payment Method',
      bkashLabel: 'bKash',
      nagadLabel: 'Nagad',
      rocketLabel: 'Rocket',
      bankLabel: 'Bank Transfer',
      instructionsTitle: 'Payment Transfer Instructions:',
      enterTrxId: 'Transaction ID (TrxID)',
      enterSenderAccount: 'Sender Mobile / Account Number',
      submitPayment: 'Submit Verification',
      paymentSubmittedNotice: 'Payment reference submitted to Admin for verification. Confirmation will appear shortly.',
      close: 'Close',
    },
    admin: {
      portalTitle: 'DevPilot Business Operations Console',
      overview: 'Overview',
      ordersTab: 'Orders Manager',
      paymentsTab: 'Payment Verification',
      servicesTab: 'Services Catalog',
      supportTab: 'Support Tickets',
      expensesTab: 'Operating Expenses',
      settingsTab: 'Platform Settings',
      auditLogsTab: 'Audit Logs',
      totalRevenue: 'Total Verified Revenue',
      confirmedSales: 'Confirmed Sales',
      pendingOrdersCount: 'Pending Orders',
      netProfit: 'Estimated Net Profit',
      updateStatus: 'Change Status',
      sendQuotation: 'Send Quotation',
      deliverProject: 'Submit Delivery',
      verifyPayment: 'Approve Payment',
      rejectPayment: 'Reject Payment',
      addService: 'Add New Service',
      recordExpense: 'Record Expense',
      saveSettings: 'Save Settings',
    },
    statuses: {
      pending: 'Pending',
      quotation_sent: 'Quotation Sent',
      awaiting_payment: 'Awaiting Payment',
      paid: 'Paid',
      in_progress: 'In Progress',
      revision_requested: 'Revision Requested',
      delivered: 'Delivered',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
    paymentStatuses: {
      unpaid: 'Unpaid',
      verification_pending: 'Review Pending',
      paid: 'Paid & Verified',
      rejected: 'Rejected',
      refunded: 'Refunded',
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      confirm: 'Confirm',
      download: 'Download',
      copy: 'Copy',
      copied: 'Copied!',
      bengali: 'বাংলা',
      english: 'English',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      bdt: 'BDT (৳)',
    },
  },
};

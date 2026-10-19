import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Layers,
  Wrench,
  DollarSign,
  MessageSquare,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Download,
  RotateCcw,
  FileText,
  UserCheck,
  ExternalLink,
  Receipt,
  FileSpreadsheet,
  Lock,
  Users,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  AuditLog,
  ExpenseRecord,
  Language,
  OrderRecord,
  OrderStatus,
  PaymentMethodType,
  PaymentStatus,
  PlatformSettings,
  ServiceItem,
  SupportTicket,
  ThemeMode,
  UserProfile,
  UserRole,
} from '../../types/devpilot';
import { translations } from '../../locales/translations';
import {
  getOrders,
  getServices,
  getExpenses,
  getAuditLogs,
  getPlatformSettings,
  getSupportTickets,
  getFinancialAnalytics,
  getUsers,
  updateUserRole,
  toggleUserStatus,
  approveRefund,
  saveService,
  deleteService,
  updateOrderStatus,
  sendOrderQuotation,
  verifyOrderPayment,
  rejectOrderPayment,
  submitOrderDelivery,
  addExpense,
  savePlatformSettings,
  replySupportTicket,
  authenticateUser,
  SUPER_ADMIN_EMAIL,
} from '../../services/devpilotDb';

interface AdminPanelProps {
  language: Language;
  theme: ThemeMode;
  currentUser: UserProfile | null;
  onViewInvoice: (order: OrderRecord) => void;
  onAdminLoginRequested: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  language,
  theme,
  currentUser,
  onViewInvoice,
  onAdminLoginRequested,
}) => {
  const t = translations[language];
  const isDark = theme === 'dark';
  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'orders'
    | 'payments'
    | 'services'
    | 'expenses'
    | 'tickets'
    | 'users'
    | 'settings'
    | 'audit'
  >('overview');

  // Local state for dynamic updates
  const [orders, setOrders] = useState<OrderRecord[]>(() => getOrders());
  const [services, setServices] = useState<ServiceItem[]>(() => getServices());
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => getExpenses());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getAuditLogs());
  const [tickets, setTickets] = useState<SupportTicket[]>(() => getSupportTickets());
  const [users, setUsers] = useState<UserProfile[]>(() => getUsers());
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() =>
    getPlatformSettings()
  );

  // Filters, Search & Pagination
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | '7days' | 'month'>('all');
  const [orderPage, setOrderPage] = useState(1);
  const ordersPerPage = 8;

  // Modals inside admin
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  // Quotation form modal
  const [quoteOrderId, setQuoteOrderId] = useState<string | null>(null);
  const [quoteAmount, setQuoteAmount] = useState<string>('');
  const [quoteNote, setQuoteNote] = useState<string>('');

  // Delivery form modal
  const [deliveryOrderId, setDeliveryOrderId] = useState<string | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliveryFileUrl, setDeliveryFileUrl] = useState('');
  const [deliveryFileName, setDeliveryFileName] = useState('');

  // Refund modal
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null);
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [refundReason, setRefundReason] = useState<string>('');

  // Service modal
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [svcForm, setSvcForm] = useState<Partial<ServiceItem>>({});

  // Expense modal
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseRecord['category']>('tools');
  const [expDate, setExpDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expNotes, setExpNotes] = useState('');

  // Settings form
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Ticket reply in admin
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [adminTicketReply, setAdminTicketReply] = useState('');

  // Authorization check
  const isAdmin = currentUser?.role === 'admin';

  const refreshAllData = () => {
    setOrders(getOrders());
    setServices(getServices());
    setExpenses(getExpenses());
    setAuditLogs(getAuditLogs());
    setTickets(getSupportTickets());
    setUsers(getUsers());
  };

  const analytics = useMemo(() => getFinancialAnalytics(), [orders, expenses]);

  // Export orders to CSV
  const handleExportCsv = () => {
    const headers = [
      'OrderID',
      'Customer',
      'Email',
      'Phone',
      'Service',
      'Status',
      'PaymentStatus',
      'PriceBDT',
      'CreatedDate',
    ];
    const rows = orders.map((o) => [
      o.id,
      `"${o.customerName}"`,
      o.customerEmail,
      o.customerPhone,
      `"${o.serviceTitleEn}"`,
      o.status,
      o.paymentStatus,
      o.quotationAmountBdt || o.priceBdt,
      o.createdAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DevPilot_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Guard: If not admin
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 rounded-2xl border text-center space-y-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {isBn ? 'অ্যাডমিন অনুমোদন আবশ্যক' : 'Administrator Authorization Required'}
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
          {isBn
            ? 'এই সেকশনে শুধুমাত্র ভেরিফায়েড অ্যাডমিন বা প্ল্যাটফর্ম ওনার (ayanislam10000@gmail.com) প্রবেশ করতে পারেন।'
            : 'Access to the DevPilot administrative console is restricted to authenticated agency managers.'}
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={onAdminLoginRequested}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition inline-flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isBn ? 'অ্যাডমিন একাউন্টে লগইন করুন' : 'Authenticate as Admin'}</span>
          </button>
        </div>
      </div>
    );
  }

  // --- Handlers ---
  const handleVerifyPayment = (orderId: string) => {
    verifyOrderPayment(orderId, currentUser?.email || SUPER_ADMIN_EMAIL);
    refreshAllData();
  };

  const handleRejectPayment = (orderId: string) => {
    const reason = window.prompt(
      isBn ? 'প্রত্যাখ্যানের কারণ লিখুন:' : 'Enter payment rejection reason:'
    );
    if (!reason) return;
    rejectOrderPayment(orderId, reason, currentUser?.email || SUPER_ADMIN_EMAIL);
    refreshAllData();
  };

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteOrderId || !quoteAmount) return;
    sendOrderQuotation(
      quoteOrderId,
      Number(quoteAmount),
      quoteNote,
      currentUser?.email || SUPER_ADMIN_EMAIL
    );
    setQuoteOrderId(null);
    setQuoteAmount('');
    setQuoteNote('');
    refreshAllData();
  };

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status, currentUser?.email || SUPER_ADMIN_EMAIL);
    refreshAllData();
  };

  const handleSubmitDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryOrderId || !deliveryNotes) return;
    submitOrderDelivery(
      deliveryOrderId,
      deliveryNotes,
      deliveryFileUrl
        ? [
            {
              name: deliveryFileName || 'Production Deliverable Code & Files',
              url: deliveryFileUrl,
              sizeKb: 250,
            },
          ]
        : [],
      currentUser?.email || SUPER_ADMIN_EMAIL
    );
    setDeliveryOrderId(null);
    setDeliveryNotes('');
    setDeliveryFileUrl('');
    setDeliveryFileName('');
    refreshAllData();
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    const newSvc: ServiceItem = {
      id: editingService?.id || `svc-${Date.now()}`,
      titleBn: svcForm.titleBn || 'নতুন ডিজিটাল সার্ভিস',
      titleEn: svcForm.titleEn || 'New Digital Service',
      shortDescBn: svcForm.shortDescBn || '',
      shortDescEn: svcForm.shortDescEn || '',
      fullDescBn: svcForm.fullDescBn || '',
      fullDescEn: svcForm.fullDescEn || '',
      category: svcForm.category || 'web_dev',
      type: svcForm.type || 'fixed',
      priceBdt: Number(svcForm.priceBdt) || 2000,
      estimatedDays: Number(svcForm.estimatedDays) || 2,
      featuresBn: svcForm.featuresBn || ['ক্লিন কোড', 'ডেলিভারি সাপোর্ট'],
      featuresEn: svcForm.featuresEn || ['Clean code', 'Delivery warranty'],
      requirementsPromptBn: svcForm.requirementsPromptBn || 'প্রজেক্ট রিকোয়ারমেন্টস দিন',
      requirementsPromptEn: svcForm.requirementsPromptEn || 'Provide requirements',
      isPublished: svcForm.isPublished ?? true,
      iconName: svcForm.iconName || 'Layout',
      badgeBn: svcForm.badgeBn,
      badgeEn: svcForm.badgeEn,
    };

    saveService(newSvc);
    setServiceModalOpen(false);
    setEditingService(null);
    setSvcForm({});
    refreshAllData();
  };

  const handleDeleteService = (svcId: string) => {
    if (window.confirm(isBn ? 'সার্ভিসটি ডিলিট করতে চান?' : 'Delete this service?')) {
      deleteService(svcId);
      refreshAllData();
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || !expAmount) return;
    addExpense({
      title: expTitle,
      amountBdt: Number(expAmount),
      category: expCategory,
      date: expDate,
      notes: expNotes,
    });
    setExpenseModalOpen(false);
    setExpTitle('');
    setExpAmount('');
    setExpNotes('');
    refreshAllData();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    savePlatformSettings(platformSettings, currentUser?.email || SUPER_ADMIN_EMAIL);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
    refreshAllData();
  };

  const handleAdminTicketReply = (ticketId: string) => {
    if (!adminTicketReply.trim()) return;
    replySupportTicket(ticketId, {
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: 'admin',
      text: adminTicketReply.trim(),
    });
    setAdminTicketReply('');
    refreshAllData();
  };

  // Filtered orders for table
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase().trim();
      const match =
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.serviceTitleEn.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const pendingPaymentsList = orders.filter(
    (o) => o.paymentStatus === 'verification_pending' && o.payment
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t.admin.portalTitle}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase">
              Super Admin Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isBn
              ? 'বাস্তব সার্ভিস অর্ডার, পেমেন্ট ভেরিফিকেশন, ইনভয়েস, কোটেশন ও রেভিনিউ রিপোর্ট।'
              : 'End-to-end service marketplace administration & revenue ledger.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isBn ? 'CSV এক্সপোর্ট' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
        {[
          { id: 'overview', label: t.admin.overview, icon: LayoutDashboard },
          {
            id: 'orders',
            label: `${t.admin.ordersTab} (${orders.length})`,
            icon: ShoppingBag,
          },
          {
            id: 'payments',
            label: `${t.admin.paymentsTab} (${pendingPaymentsList.length})`,
            icon: CreditCard,
            badge: pendingPaymentsList.length > 0 ? pendingPaymentsList.length : undefined,
          },
          { id: 'services', label: t.admin.servicesTab, icon: Layers },
          { id: 'expenses', label: t.admin.expensesTab, icon: DollarSign },
          { id: 'tickets', label: t.admin.supportTab, icon: MessageSquare },
          { id: 'settings', label: t.admin.settingsTab, icon: Settings },
          { id: 'audit', label: t.admin.auditLogsTab, icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & REAL ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Real Metrics Cards (No Fake Statistics) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className={`p-5 rounded-2xl border transition ${
                isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <span className="text-xs font-semibold text-slate-500 block">
                {t.admin.confirmedSales}
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  ৳ {analytics.totalGrossConfirmedBdt.toLocaleString()}
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {isBn ? 'সরাসরি যাচাইকৃত ও প্রাপ্ত ক্যাশ' : 'Directly confirmed payments'}
              </p>
            </div>

            <div
              className={`p-5 rounded-2xl border transition ${
                isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <span className="text-xs font-semibold text-slate-500 block">
                {isBn ? 'পেমেন্ট যাচাই অপেক্ষমান' : 'Pending Verification'}
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
                  ৳ {analytics.totalPendingVerificationBdt.toLocaleString()}
                </span>
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {pendingPaymentsList.length} {isBn ? 'টি ট্রানজেকশন পেন্ডিং' : 'transactions pending'}
              </p>
            </div>

            <div
              className={`p-5 rounded-2xl border transition ${
                isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <span className="text-xs font-semibold text-slate-500 block">
                {isBn ? 'অপারেটিং খরচ (Expenses)' : 'Operating Expenses'}
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-red-600 dark:text-red-400">
                  ৳ {analytics.totalExpensesBdt.toLocaleString()}
                </span>
                <DollarSign className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {expenses.length} {isBn ? 'টি এন্ট্রি নথিভুক্ত' : 'recorded items'}
              </p>
            </div>

            <div
              className={`p-5 rounded-2xl border transition ${
                isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <span className="text-xs font-semibold text-slate-500 block">
                {t.admin.netProfit}
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span
                  className={`text-2xl sm:text-3xl font-black font-mono ${
                    analytics.estimatedNetProfitBdt >= 0
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-red-600'
                  }`}
                >
                  ৳ {analytics.estimatedNetProfitBdt.toLocaleString()}
                </span>
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {isBn ? 'নেট প্রফিট = সেলস - খরচ' : 'Net = Confirmed - Expenses'}
              </p>
            </div>
          </div>

          {/* Quick Action Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`p-5 rounded-2xl border ${
                isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                {isBn ? 'অর্ডার স্ট্যাটাস সারাংশ' : 'Orders Status Breakdown'}
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span>{isBn ? 'মোট অর্ডার' : 'Total Orders'}:</span>
                  <span className="font-mono font-bold">{analytics.totalOrdersCount}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span>{isBn ? 'চলমান / পেন্ডিং' : 'Active / Pending'}:</span>
                  <span className="font-mono font-bold text-amber-600">
                    {analytics.totalPendingOrdersCount}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-emerald-600 font-bold">
                  <span>{isBn ? 'সম্পন্ন প্রজেক্ট' : 'Completed'}:</span>
                  <span className="font-mono">{analytics.totalCompletedOrdersCount}</span>
                </div>
              </div>
            </div>

            <div
              className={`p-5 rounded-2xl border ${
                isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                {isBn ? 'জরুরি দৃষ্টি আকর্ষণ' : 'Action Required'}
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span>{isBn ? 'পেমেন্ট ভেরিফিকেশন বাকি' : 'Pending Payment Verifications'}:</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('payments')}
                    className="font-mono font-bold text-blue-600 underline"
                  >
                    {pendingPaymentsList.length}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>{isBn ? 'কোটেশন প্রেরণের অপেক্ষায়' : 'Waiting Quotation'}:</span>
                  <span className="font-mono font-bold">
                    {orders.filter((o) => o.status === 'pending').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{isBn ? 'রিভিশন রিকোয়েস্ট' : 'Revisions Requested'}:</span>
                  <span className="font-mono font-bold text-orange-600">
                    {orders.filter((o) => o.status === 'revision_requested').length}
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`p-5 rounded-2xl border ${
                isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                {isBn ? 'সার্ভিস ক্যাটালগ পরিসংখ্যান' : 'Catalog Stats'}
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span>{isBn ? 'লাইভ সার্ভিস' : 'Published Services'}:</span>
                  <span className="font-mono font-bold text-blue-600">
                    {services.filter((s) => s.isPublished).length}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>{isBn ? 'ওপেন সাপোর্ট টিকেট' : 'Open Support Tickets'}:</span>
                  <span className="font-mono font-bold text-purple-600">
                    {tickets.filter((t) => t.status === 'open').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ORDERS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850"
              >
                <option value="all">{isBn ? 'সকল স্ট্যাটাস' : 'All Statuses'}</option>
                <option value="pending">Pending</option>
                <option value="quotation_sent">Quotation Sent</option>
                <option value="awaiting_payment">Awaiting Payment</option>
                <option value="paid">Paid</option>
                <option value="in_progress">In Progress</option>
                <option value="revision_requested">Revision Requested</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="w-full sm:w-72 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder={isBn ? 'আইডি, নাম, ইমেইল খুঁজুন...' : 'Search ID, name, email...'}
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Orders Table */}
          <div
            className={`rounded-2xl border overflow-x-auto ${
              isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Price (BDT)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      {isBn ? 'কোনো অর্ডার পাওয়া যায়নি।' : 'No orders matching filter.'}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {ord.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold">{ord.customerName}</p>
                        <p className="text-[11px] text-slate-400">{ord.customerEmail}</p>
                        <p className="text-[10px] text-slate-400">{ord.customerPhone}</p>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate">
                        {isBn ? ord.serviceTitleBn : ord.serviceTitleEn}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                          className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-bold"
                        >
                          <option value="pending">Pending</option>
                          <option value="quotation_sent">Quotation Sent</option>
                          <option value="awaiting_payment">Awaiting Payment</option>
                          <option value="paid">Paid</option>
                          <option value="in_progress">In Progress</option>
                          <option value="revision_requested">Revision Requested</option>
                          <option value="delivered">Delivered</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ord.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : ord.paymentStatus === 'verification_pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        ৳ {(ord.quotationAmountBdt || ord.priceBdt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Send Quotation button if pending */}
                          <button
                            type="button"
                            onClick={() => {
                              setQuoteOrderId(ord.id);
                              setQuoteAmount(String(ord.priceBdt));
                            }}
                            className="p-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600"
                            title="Send Quote"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          {/* Submit Delivery */}
                          <button
                            type="button"
                            onClick={() => {
                              setDeliveryOrderId(ord.id);
                            }}
                            className="p-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-700 text-purple-600"
                            title="Submit Delivery"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Invoice */}
                          <button
                            type="button"
                            onClick={() => onViewInvoice(ord)}
                            className="p-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                            title="Invoice"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PAYMENTS VERIFICATION */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {isBn ? 'পেমেন্ট ট্রানজেকশন ভেরিফিকেশন' : 'Payment Transaction Verifications'}
            </h2>
            <span className="text-xs text-slate-500">
              {pendingPaymentsList.length} {isBn ? 'টি পেন্ডিং' : 'pending approval'}
            </span>
          </div>

          {pendingPaymentsList.length === 0 ? (
            <div
              className={`p-10 text-center rounded-2xl border ${
                isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs text-slate-500">
                {isBn
                  ? 'কোনো অনিষ্পন্ন পেমেন্ট নেই! সকল সাবমিশন যাচাই করা হয়েছে।'
                  : 'All payments verified. No pending transactions.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingPaymentsList.map((ord) => (
                <div
                  key={ord.id}
                  className={`p-5 rounded-2xl border space-y-4 ${
                    isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-600 block">
                        {ord.id}
                      </span>
                      <h4 className="text-sm font-bold">{ord.customerName}</h4>
                      <p className="text-[11px] text-slate-400">{ord.customerEmail}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                        Amount
                      </span>
                      <span className="font-mono text-lg font-black text-emerald-600 dark:text-emerald-400">
                        ৳ {ord.payment?.amountBdt.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gateway:</span>
                      <span className="font-mono uppercase font-bold text-pink-600">
                        {ord.payment?.method}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">TrxID:</span>
                      <span className="font-mono font-black text-slate-900 dark:text-white">
                        {ord.payment?.trxId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sender Account:</span>
                      <span className="font-mono">{ord.payment?.senderAccount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Submitted:</span>
                      <span>
                        {new Date(ord.payment?.submittedAt || '').toLocaleString('en-GB')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleRejectPayment(ord.id)}
                      className="px-4 py-2 rounded-xl border border-red-300 dark:border-red-900 text-red-600 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      {t.admin.rejectPayment}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerifyPayment(ord.id)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.admin.verifyPayment}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SERVICES CATALOG */}
      {/* ========================================================================= */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {isBn ? 'ডিজিটাল সার্ভিস ক্যাটালগ পরিচালনা' : 'Manage Service Offerings'}
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditingService(null);
                setSvcForm({
                  isPublished: true,
                  category: 'web_dev',
                  type: 'fixed',
                  priceBdt: 2500,
                  estimatedDays: 2,
                });
                setServiceModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.admin.addService}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((svc) => (
              <div
                key={svc.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                  isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {svc.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        svc.isPublished
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {svc.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {isBn ? svc.titleBn : svc.titleEn}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {isBn ? svc.shortDescBn : svc.shortDescEn}
                  </p>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {svc.type === 'fixed' ? `৳ ${svc.priceBdt}` : 'Quotation'}
                    </span>
                    <span className="text-slate-400">
                      {svc.estimatedDays} {t.services.daysUnit}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingService(svc);
                      setSvcForm(svc);
                      setServiceModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg border text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(svc.id)}
                    className="p-1.5 rounded-lg border text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: EXPENSES TRACKER */}
      {/* ========================================================================= */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isBn ? 'অপারেটিং ব্যয় ট্র্যাকার' : 'Operating Expenses Ledger'}
              </h2>
              <p className="text-xs text-slate-500">
                {isBn
                  ? 'হোস্টিং, টুলস, ডোমেন ও আনুষঙ্গিক খরচ যা নেট প্রফিট নির্ণয়ে সরাসরি সমন্বয় হয়।'
                  : 'Recorded infrastructure and software expenditures.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExpenseModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.admin.recordExpense}</span>
            </button>
          </div>

          <div
            className={`rounded-2xl border overflow-hidden ${
              isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td className="py-3.5 px-4 font-bold">{exp.title}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] uppercase text-slate-400">
                      {exp.category}
                    </td>
                    <td className="py-3.5 px-4 font-mono">{exp.date}</td>
                    <td className="py-3.5 px-4 text-slate-500">{exp.notes || '—'}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-red-600">
                      -৳ {exp.amountBdt.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: SUPPORT TICKETS DESK */}
      {/* ========================================================================= */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {isBn ? 'কাস্টমার সাপোর্ট ডেস্ক' : 'Customer Support Desk'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-1">
              {tickets.map((tkt) => (
                <button
                  key={tkt.id}
                  type="button"
                  onClick={() => setSelectedTicketId(tkt.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition ${
                    selectedTicketId === tkt.id
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-1 ring-blue-500'
                      : isDark
                      ? 'bg-slate-850 border-slate-800 text-slate-300'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold">{tkt.customerName}</span>
                    <span className="text-[10px] font-mono">{tkt.status}</span>
                  </div>
                  <h4 className="text-xs font-semibold truncate">{tkt.subject}</h4>
                </button>
              ))}
            </div>

            <div
              className={`p-5 rounded-2xl border md:col-span-2 flex flex-col justify-between min-h-[350px] ${
                isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              {selectedTicketId ? (
                (() => {
                  const activeTkt = tickets.find((t) => t.id === selectedTicketId);
                  if (!activeTkt) return null;

                  return (
                    <div className="space-y-4 flex flex-col h-full justify-between">
                      <div>
                        <div className="border-b pb-3 border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-bold">{activeTkt.subject}</h3>
                            <p className="text-[11px] text-slate-400">
                              Client: {activeTkt.customerName} ({activeTkt.customerEmail})
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 py-4 max-h-[300px] overflow-y-auto">
                          {activeTkt.messages.map((m) => (
                            <div
                              key={m.id}
                              className={`flex flex-col ${
                                m.senderRole === 'admin' ? 'items-end' : 'items-start'
                              }`}
                            >
                              <div
                                className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                                  m.senderRole === 'admin'
                                    ? 'bg-blue-600 text-white rounded-br-xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs'
                                }`}
                              >
                                <span className="text-[10px] font-bold block opacity-75 mb-0.5">
                                  {m.senderName} ({m.senderRole})
                                </span>
                                <span>{m.text}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                        <input
                          type="text"
                          value={adminTicketReply}
                          onChange={(e) => setAdminTicketReply(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAdminTicketReply(activeTkt.id);
                          }}
                          placeholder={isBn ? 'অ্যাডমিন রিপ্লাই লিখুন...' : 'Write reply...'}
                          className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => handleAdminTicketReply(activeTkt.id)}
                          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  {isBn ? 'টিকেট সিলেক্ট করুন।' : 'Select a ticket to review.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: PLATFORM SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <form
          onSubmit={handleSaveSettings}
          className={`p-6 rounded-2xl border max-w-2xl space-y-6 ${
            isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          {settingsSavedToast && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{isBn ? 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Settings saved successfully!'}</span>
            </div>
          )}

          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2">
              {isBn ? 'বিকাশ, নগদ ও রকেট পেমেন্ট কনফিগারেশন' : 'Bangladesh Gateway Settings'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-1">bKash Number</label>
                <input
                  type="text"
                  value={platformSettings.paymentConfig.bkashNumber}
                  onChange={(e) =>
                    setPlatformSettings({
                      ...platformSettings,
                      paymentConfig: {
                        ...platformSettings.paymentConfig,
                        bkashNumber: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Nagad Number</label>
                <input
                  type="text"
                  value={platformSettings.paymentConfig.nagadNumber}
                  onChange={(e) =>
                    setPlatformSettings({
                      ...platformSettings,
                      paymentConfig: {
                        ...platformSettings.paymentConfig,
                        nagadNumber: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Rocket Number</label>
                <input
                  type="text"
                  value={platformSettings.paymentConfig.rocketNumber}
                  onChange={(e) =>
                    setPlatformSettings({
                      ...platformSettings,
                      paymentConfig: {
                        ...platformSettings.paymentConfig,
                        rocketNumber: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">WhatsApp Support Number</label>
                <input
                  type="text"
                  value={platformSettings.whatsappNumber}
                  onChange={(e) =>
                    setPlatformSettings({ ...platformSettings, whatsappNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono"
                />
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2 pt-2">
              {isBn ? 'ব্যাংক ট্রান্সফার অ্যাকাউন্ট বিবরণ' : 'Bank Account Details'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={platformSettings.paymentConfig.bankName}
                  onChange={(e) =>
                    setPlatformSettings({
                      ...platformSettings,
                      paymentConfig: { ...platformSettings.paymentConfig, bankName: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Account Number</label>
                <input
                  type="text"
                  value={platformSettings.paymentConfig.accountNumber}
                  onChange={(e) =>
                    setPlatformSettings({
                      ...platformSettings,
                      paymentConfig: {
                        ...platformSettings.paymentConfig,
                        accountNumber: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
              >
                {t.admin.saveSettings}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {isBn ? 'নিরাপত্তা ও অডিট লগ' : 'Security & Action Audit Trail'}
          </h2>

          <div
            className={`rounded-2xl border divide-y divide-slate-100 dark:divide-slate-800 ${
              isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {log.action}
                    </span>
                    <span className="text-[11px] text-slate-400">by {log.actor}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{log.details}</p>
                </div>
                <span className="font-mono text-[11px] text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleString('en-GB')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quotation Sending Modal */}
      {quoteOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleSendQuote}
            className={`w-full max-w-md p-6 rounded-2xl border shadow-xl space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
            }`}
          >
            <h3 className="font-bold text-base">
              {isBn ? `কোটেশন প্রেরণ — ${quoteOrderId}` : `Send Quotation — ${quoteOrderId}`}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">
                  {isBn ? 'নির্ধারিত ফি (BDT)' : 'Quoted Amount (BDT)'} *
                </label>
                <input
                  type="number"
                  required
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  {isBn ? 'কাজের পরিধি ও নোট' : 'Scope & Terms Note'}
                </label>
                <textarea
                  rows={3}
                  value={quoteNote}
                  onChange={(e) => setQuoteNote(e.target.value)}
                  placeholder={
                    isBn
                      ? 'Ex: এপিআই এন্ডপয়েন্ট ও ৩ দিনের সাপোর্ট অন্তর্ভুক্ত...'
                      : 'Scope of work included in this milestone...'
                  }
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQuoteOrderId(null)}
                className="px-4 py-2 rounded-xl border text-slate-600 text-xs"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                {isBn ? 'কোটেশন পাঠিয়ে দিন' : 'Send Quote'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delivery Submission Modal */}
      {deliveryOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleSubmitDelivery}
            className={`w-full max-w-md p-6 rounded-2xl border shadow-xl space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
            }`}
          >
            <h3 className="font-bold text-base">
              {isBn ? `প্রজেক্ট ডেলিভারি — ${deliveryOrderId}` : `Deliver Project — ${deliveryOrderId}`}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">
                  {isBn ? 'ডেলিভারি নোট ও নির্দেশনা' : 'Delivery Notes & Handbook'} *
                </label>
                <textarea
                  rows={3}
                  required
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder={
                    isBn
                      ? 'কোড গিটহাব বা জিপে আপলোড করা হয়েছে। সেটআপ নিয়মাবলী...'
                      : 'Code deliverable notes & staging URL...'
                  }
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  {isBn ? 'ফাইল / গিটহাব / ড্রাইভ ডাউনলোড লিংক' : 'Deliverable Download URL'}
                </label>
                <input
                  type="text"
                  value={deliveryFileUrl}
                  onChange={(e) => setDeliveryFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/... বা https://github.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  {isBn ? 'ফাইলের লেবেল' : 'File Label'}
                </label>
                <input
                  type="text"
                  value={deliveryFileName}
                  onChange={(e) => setDeliveryFileName(e.target.value)}
                  placeholder="Ex: project-source-code-v1.zip"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeliveryOrderId(null)}
                className="px-4 py-2 rounded-xl border text-slate-600 text-xs"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
              >
                {isBn ? 'ডেলিভারি সম্পন্ন করুন' : 'Submit Delivery'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Service Add/Edit Modal */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <form
            onSubmit={handleSaveService}
            className={`w-full max-w-lg my-8 p-6 rounded-2xl border shadow-xl space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
            }`}
          >
            <h3 className="font-bold text-base">
              {editingService ? (isBn ? 'সার্ভিস এডিট' : 'Edit Service') : t.admin.addService}
            </h3>

            <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Title (বাংলা) *</label>
                  <input
                    type="text"
                    required
                    value={svcForm.titleBn || ''}
                    onChange={(e) => setSvcForm({ ...svcForm, titleBn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={svcForm.titleEn || ''}
                    onChange={(e) => setSvcForm({ ...svcForm, titleEn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={svcForm.category}
                    onChange={(e) => setSvcForm({ ...svcForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                  >
                    <option value="bug_fix">Bug Fix</option>
                    <option value="web_dev">Web Dev</option>
                    <option value="api">API Integration</option>
                    <option value="ui_ux">UI/UX Redesign</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="automation">Automation</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Pricing Model</label>
                  <select
                    value={svcForm.type}
                    onChange={(e) => setSvcForm({ ...svcForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="quotation">Quotation Based</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Price (BDT)</label>
                  <input
                    type="number"
                    value={svcForm.priceBdt || ''}
                    onChange={(e) => setSvcForm({ ...svcForm, priceBdt: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Estimated Days</label>
                  <input
                    type="number"
                    value={svcForm.estimatedDays || ''}
                    onChange={(e) =>
                      setSvcForm({ ...svcForm, estimatedDays: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Short Description (বাংলা)</label>
                <textarea
                  rows={2}
                  value={svcForm.shortDescBn || ''}
                  onChange={(e) => setSvcForm({ ...svcForm, shortDescBn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Short Description (English)</label>
                <textarea
                  rows={2}
                  value={svcForm.shortDescEn || ''}
                  onChange={(e) => setSvcForm({ ...svcForm, shortDescEn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  {isBn ? 'প্রজেক্ট রিকোয়ারমেন্টস প্রম্পট (বাংলা)' : 'Requirements Prompt (বাংলা)'}
                </label>
                <textarea
                  rows={2}
                  value={svcForm.requirementsPromptBn || ''}
                  onChange={(e) => setSvcForm({ ...svcForm, requirementsPromptBn: e.target.value })}
                  placeholder="অর্ডারের সময় ক্লায়েন্ট থেকে কী তথ্য চাওয়া হবে (যেমন: সাইটের লিংক, এক্সেস বা এরর বিবরণ)"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  {isBn ? 'Requirements Prompt (English)' : 'Requirements Prompt (English)'}
                </label>
                <textarea
                  rows={2}
                  value={svcForm.requirementsPromptEn || ''}
                  onChange={(e) => setSvcForm({ ...svcForm, requirementsPromptEn: e.target.value })}
                  placeholder="Specify what information the client must supply upon ordering"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  {isBn ? 'ফিচারসমূহ (কমা দিয়ে আলাদা করুন - বাংলা)' : 'Features Included (Comma-separated Bn)'}
                </label>
                <input
                  type="text"
                  value={Array.isArray(svcForm.featuresBn) ? svcForm.featuresBn.join(', ') : svcForm.featuresBn || ''}
                  onChange={(e) =>
                    setSvcForm({
                      ...svcForm,
                      featuresBn: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="২৪ ঘণ্টায় ফিক্স, ৩ দিনের সাপোর্ট, ক্লিন কোড"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  {isBn ? 'Features Included (Comma-separated En)' : 'Features Included (Comma-separated En)'}
                </label>
                <input
                  type="text"
                  value={Array.isArray(svcForm.featuresEn) ? svcForm.featuresEn.join(', ') : svcForm.featuresEn || ''}
                  onChange={(e) =>
                    setSvcForm({
                      ...svcForm,
                      featuresEn: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="24h turnaround, 3 days warranty, clean documentation"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="svc-published"
                  checked={svcForm.isPublished ?? true}
                  onChange={(e) => setSvcForm({ ...svcForm, isPublished: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <label htmlFor="svc-published" className="font-semibold cursor-pointer">
                  {isBn ? 'লাইভ ক্যাটালগে প্রকাশ করুন (Publish to Catalog)' : 'Publish to Live Catalog'}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setServiceModalOpen(false)}
                className="px-4 py-2 rounded-xl border text-slate-600 text-xs"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                {t.common.save}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expense Modal */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleAddExpense}
            className={`w-full max-w-md p-6 rounded-2xl border shadow-xl space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
            }`}
          >
            <h3 className="font-bold text-base">{t.admin.recordExpense}</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="Ex: Cloud VPS hosting renewal"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Amount (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                  >
                    <option value="hosting">Hosting &amp; Servers</option>
                    <option value="tools">Dev Tools &amp; SaaS</option>
                    <option value="domains">Domains &amp; SSL</option>
                    <option value="marketing">Marketing</option>
                    <option value="subcontractor">Subcontractor</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setExpenseModalOpen(false)}
                className="px-4 py-2 rounded-xl border text-slate-600 text-xs"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                {isBn ? 'খরচ সংরক্ষণ করুন' : 'Record Expense'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

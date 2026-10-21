import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Download,
  RotateCcw,
  ExternalLink,
  MessageSquare,
  Plus,
  Send,
  User,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  Receipt,
  Smartphone,
  ChevronDown,
  ChevronUp,
  FileCode,
  Check,
  Copy,
  Sparkles,
  X,
} from 'lucide-react';
import {
  Language,
  OrderRecord,
  OrderStatus,
  SupportTicket,
  ThemeMode,
  UserProfile,
} from '../../types/devpilot';
import { translations } from '../../locales/translations';
import {
  getOrders,
  getSupportTickets,
  createSupportTicket,
  replySupportTicket,
  requestOrderRevision,
  updateOrderStatus,
  setPreferredLanguage,
  executeOrderWithAI,
} from '../../services/devpilotDb';

interface CustomerDashboardProps {
  language: Language;
  theme: ThemeMode;
  currentUser: UserProfile;
  onSelectOrderForPayment: (order: OrderRecord) => void;
  onViewInvoice: (order: OrderRecord) => void;
  onOrderNewService: () => void;
  onLanguageChange: (lang: Language) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  language,
  theme,
  currentUser,
  onSelectOrderForPayment,
  onViewInvoice,
  onOrderNewService,
  onLanguageChange,
}) => {
  const t = translations[language];
  const isDark = theme === 'dark';
  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'orders' | 'tickets' | 'profile'>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'unpaid' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Revision state
  const [revisionOrderId, setRevisionOrderId] = useState<string | null>(null);
  const [revisionReason, setRevisionReason] = useState('');
  const [revisionSubmitting, setRevisionSubmitting] = useState(false);

  // Tickets state
  const [tickets, setTickets] = useState<SupportTicket[]>(() =>
    getSupportTickets(currentUser.email)
  );
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [newTicketOrderId, setNewTicketOrderId] = useState('');
  const [replyText, setReplyText] = useState('');

  // Orders state
  const [orders, setOrders] = useState<OrderRecord[]>(() =>
    getOrders().filter(
      (o) =>
        o.customerId === currentUser.id ||
        o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
    )
  );

  const [aiExecutingId, setAiExecutingId] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<{ name: string; content: string } | null>(null);
  const [copiedFileName, setCopiedFileName] = useState<string | null>(null);

  const refreshOrders = () => {
    setOrders(
      getOrders().filter(
        (o) =>
          o.customerId === currentUser.id ||
          o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
      )
    );
  };

  const handleRunAiDelivery = async (orderId: string) => {
    setAiExecutingId(orderId);
    try {
      await executeOrderWithAI(orderId);
      refreshOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setAiExecutingId(null);
    }
  };

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'completed' && o.status !== 'cancelled'
  ).length;
  const completedOrdersCount = orders.filter((o) => o.status === 'completed').length;
  const pendingPaymentAmount = orders
    .filter((o) => o.paymentStatus !== 'paid')
    .reduce((sum, o) => sum + (o.quotationAmountBdt || o.priceBdt), 0);

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'active' && (o.status === 'completed' || o.status === 'cancelled')) return false;
    if (orderFilter === 'unpaid' && o.paymentStatus === 'paid') return false;
    if (orderFilter === 'completed' && o.status !== 'completed') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = o.id.toLowerCase().includes(q);
      const matchTitle =
        o.serviceTitleBn.toLowerCase().includes(q) || o.serviceTitleEn.toLowerCase().includes(q);
      if (!matchId && !matchTitle) return false;
    }
    return true;
  });

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  // Handle quotation approval
  const handleApproveQuotation = (orderId: string) => {
    updateOrderStatus(orderId, 'awaiting_payment', currentUser.email);
    const updated = orders.find((o) => o.id === orderId);
    if (updated) {
      onSelectOrderForPayment(updated);
    }
  };

  // Handle revision request submission with immediate AI execution
  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionOrderId || !revisionReason.trim()) return;

    const revId = revisionOrderId;
    const revReason = revisionReason.trim();

    setRevisionSubmitting(true);
    requestOrderRevision(revId, revReason, currentUser.email);
    setRevisionReason('');
    setRevisionOrderId(null);

    // AI automatically fulfills the revision autonomously!
    setAiExecutingId(revId);
    try {
      await executeOrderWithAI(revId, revReason);
      refreshOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setAiExecutingId(null);
      setRevisionSubmitting(false);
    }
  };

  // Handle create new support ticket
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketMessage.trim()) return;

    const ticket = createSupportTicket({
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      orderId: newTicketOrderId || undefined,
      subject: newTicketSubject.trim(),
      priority: 'medium',
      initialMessage: newTicketMessage.trim(),
    });

    setTickets(getSupportTickets(currentUser.email));
    setSelectedTicketId(ticket.id);
    setNewTicketSubject('');
    setNewTicketMessage('');
    setNewTicketOrderId('');
    setNewTicketModalOpen(false);
  };

  // Handle reply to ticket
  const handleSendTicketReply = (ticketId: string) => {
    if (!replyText.trim()) return;
    replySupportTicket(ticketId, {
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text: replyText.trim(),
    });
    setTickets(getSupportTickets(currentUser.email));
    setReplyText('');
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {t.statuses[status]}
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {t.statuses[status]}
          </span>
        );
      case 'awaiting_payment':
      case 'quotation_sent':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {t.statuses[status]}
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {t.statuses[status]}
          </span>
        );
      case 'revision_requested':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            {t.statuses[status]}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {t.statuses[status]}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Banner & Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t.dashboard.welcome} {currentUser.name}
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 uppercase">
              {currentUser.role}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isBn
              ? 'আপনার সার্ভিস অর্ডার, কোটেশন পর্যালোচনা, পেমেন্ট ও ডেলিভারি ফাইল এখানে পাবেন।'
              : 'Track active projects, quotations, verify payments, and download deliverable source code.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onOrderNewService}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>{isBn ? 'নতুন সার্ভিস অর্ডার' : 'New Service Order'}</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            {t.dashboard.activeOrders}
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
              {activeOrdersCount}
            </span>
            <Clock className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            {t.dashboard.completedOrders}
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {completedOrdersCount}
            </span>
            <CheckCircle2 className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            {t.dashboard.pendingPayments}
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
              ৳ {pendingPaymentAmount.toLocaleString()}
            </span>
            <DollarSign className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            {t.dashboard.supportTickets}
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-purple-600 dark:text-purple-400">
              {tickets.length}
            </span>
            <MessageSquare className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-3 transition-colors relative ${
            activeTab === 'orders'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>{t.dashboard.myOrders}</span>
          {activeTab === 'orders' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tickets')}
          className={`pb-3 px-3 transition-colors relative ${
            activeTab === 'tickets'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>{t.dashboard.supportTickets}</span>
          {tickets.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700">
              {tickets.length}
            </span>
          )}
          {activeTab === 'tickets' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-3 transition-colors relative ${
            activeTab === 'profile'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>{isBn ? 'প্রোফাইল ও সেটিংস' : 'Profile & Settings'}</span>
          {activeTab === 'profile' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
          )}
        </button>
      </div>

      {/* TAB 1: ORDERS LIST */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setOrderFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  orderFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isBn ? 'সকল' : 'All'} ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('active')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  orderFilter === 'active'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isBn ? 'চলমান' : 'Active'} ({activeOrdersCount})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('unpaid')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  orderFilter === 'unpaid'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isBn ? 'পেমেন্ট বাকি' : 'Unpaid'}
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('completed')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  orderFilter === 'completed'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isBn ? 'সম্পন্ন' : 'Completed'} ({completedOrdersCount})
              </button>
            </div>

            <div className="w-full sm:w-64 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBn ? 'অর্ডার খুঁজুন...' : 'Search orders...'}
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Orders Table / Cards */}
          {filteredOrders.length === 0 ? (
            <div
              className={`p-12 text-center rounded-2xl border space-y-3 ${
                isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {t.dashboard.noOrdersFound}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t.dashboard.orderServicePrompt}
              </p>
              <button
                type="button"
                onClick={onOrderNewService}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
              >
                {isBn ? 'সার্ভিস ক্যাটালগে যান' : 'Browse Services'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((ord) => {
                const isExpanded = selectedOrderId === ord.id;
                const price = ord.quotationAmountBdt || ord.priceBdt;

                return (
                  <div
                    key={ord.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Order summary bar */}
                    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400">
                            {ord.id}
                          </span>
                          {getStatusBadge(ord.status)}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              ord.paymentStatus === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : ord.paymentStatus === 'verification_pending'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                            }`}
                          >
                            {t.paymentStatuses[ord.paymentStatus]}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {isBn ? ord.serviceTitleBn : ord.serviceTitleEn}
                        </h3>

                        <p className="text-xs text-slate-500 flex items-center gap-3">
                          <span>
                            {isBn ? 'অর্ডার তারিখ: ' : 'Ordered: '}
                            {new Date(ord.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          {ord.deadlineDate && (
                            <span>
                              {isBn ? 'ডেলিভারি কাঙ্ক্ষিত: ' : 'Deadline: '}
                              {ord.deadlineDate}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Price & Action Buttons */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-right pr-2">
                          <span className="text-[11px] text-slate-400 block font-medium">
                            {isBn ? 'মোট ফি' : 'Total Price'}
                          </span>
                          <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                            ৳ {price.toLocaleString()}
                          </span>
                        </div>

                        {ord.paymentStatus !== 'paid' && (
                          <button
                            type="button"
                            onClick={() => onSelectOrderForPayment(ord)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>{t.dashboard.payNow}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onViewInvoice(ord)}
                          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition flex items-center gap-1"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>{t.dashboard.viewInvoice}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedOrderId(isExpanded ? null : ord.id)}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
                          title="View Details"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details Drawer */}
                    {isExpanded && (
                      <div className="border-t border-slate-200 dark:border-slate-800 p-5 space-y-5 bg-slate-50/50 dark:bg-slate-900/50">
                        {/* Quotation Approval Box (If quotation sent) */}
                        {ord.status === 'quotation_sent' && ord.quotationAmountBdt && (
                          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
                                {isBn ? 'অ্যাডমিন কোটেশন প্রস্তাবনা' : 'Admin Quotation Proposal'}
                              </span>
                              <span className="font-mono font-extrabold text-blue-700 dark:text-blue-400 text-base">
                                ৳ {ord.quotationAmountBdt.toLocaleString()} BDT
                              </span>
                            </div>
                            {ord.quotationNote && (
                              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                {ord.quotationNote}
                              </p>
                            )}
                            <div className="pt-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleApproveQuotation(ord.id)}
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{isBn ? 'কোটেশন অনুমোদন করুন ও পেমেন্ট করুন' : 'Approve & Pay'}</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Visual Lifecycle Stepper */}
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-3">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                            {isBn ? 'প্রজেক্ট লাইফসাইকেল ট্র্যাকার' : 'Project Lifecycle Stepper'}
                          </span>

                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                            {/* Step 1 */}
                            <div className="p-2.5 rounded-xl border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                              <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                              <span className="font-bold block text-[11px]">{isBn ? '১. অর্ডার সাবমিট' : '1. Submitted'}</span>
                              <span className="text-[9px] text-emerald-600 block">Done</span>
                            </div>

                            {/* Step 2 */}
                            <div
                              className={`p-2.5 rounded-xl border ${
                                ord.paymentStatus === 'paid'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                                  : ord.status === 'quotation_sent' || ord.status === 'awaiting_payment'
                                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                              }`}
                            >
                              <DollarSign className="w-4 h-4 mx-auto mb-1" />
                              <span className="font-bold block text-[11px]">{isBn ? '২. কোটেশন ও পেমেন্ট' : '2. Payment'}</span>
                              <span className="text-[9px] block">
                                {ord.paymentStatus === 'paid'
                                  ? 'Paid'
                                  : ord.paymentStatus === 'verification_pending'
                                  ? 'Reviewing'
                                  : 'Due'}
                              </span>
                            </div>

                            {/* Step 3 */}
                            <div
                              className={`p-2.5 rounded-xl border ${
                                ord.status === 'in_progress' || ord.status === 'delivered' || ord.status === 'completed'
                                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                              }`}
                            >
                              <Clock className="w-4 h-4 mx-auto mb-1" />
                              <span className="font-bold block text-[11px]">{isBn ? '৩. কাজ চলমান' : '3. In Progress'}</span>
                              <span className="text-[9px] block">
                                {ord.status === 'in_progress' ? 'Active' : ord.status === 'delivered' || ord.status === 'completed' ? 'Done' : 'Pending'}
                              </span>
                            </div>

                            {/* Step 4 */}
                            <div
                              className={`p-2.5 rounded-xl border ${
                                ord.status === 'delivered' || ord.status === 'completed'
                                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-300'
                                  : ord.status === 'revision_requested'
                                  ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-orange-800 dark:text-orange-300'
                                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                              }`}
                            >
                              <FileText className="w-4 h-4 mx-auto mb-1" />
                              <span className="font-bold block text-[11px]">{isBn ? '৪. ডেলিভারি ও ফাইল' : '4. Delivered'}</span>
                              <span className="text-[9px] block">
                                {ord.status === 'delivered' ? 'Review Files' : ord.status === 'revision_requested' ? 'Revision' : ord.status === 'completed' ? 'Done' : 'Pending'}
                              </span>
                            </div>

                            {/* Step 5 */}
                            <div
                              className={`col-span-2 sm:col-span-1 p-2.5 rounded-xl border ${
                                ord.status === 'completed'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                              <span className="font-bold block text-[11px]">{isBn ? '৫. প্রজেক্ট সম্পন্ন' : '5. Completed'}</span>
                              <span className="text-[9px] block">
                                {ord.status === 'completed' ? 'Finished' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Recent Timeline Feed */}
                        {ord.progressTimeline && ord.progressTimeline.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                              {isBn ? 'কাজের অগ্রগতির ইতিহাস ও লাইভ আপডেট' : 'Progress Timeline & Updates'}
                            </span>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {ord.progressTimeline.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-850/80 text-xs flex items-start justify-between gap-3"
                                >
                                  <div className="space-y-0.5">
                                    <p className="font-bold text-slate-900 dark:text-slate-100">
                                      {isBn ? item.titleBn : item.titleEn}
                                    </p>
                                    {item.note && (
                                      <p className="text-[11px] text-slate-500">{item.note}</p>
                                    )}
                                  </div>
                                  <div className="text-right shrink-0 text-[10px] text-slate-400 font-mono">
                                    {new Date(item.timestamp).toLocaleString('en-GB', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Project Requirements & Brief */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              {isBn ? 'আপনার প্রকল্পের রিকোয়ারমেন্টস' : 'Project Requirements'}
                            </span>
                            {ord.attachments && ord.attachments.length > 0 && (
                              <div className="flex items-center gap-2">
                                {ord.attachments.map((att, aIdx) => (
                                  <a
                                    key={aIdx}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>{att.name}</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-800 whitespace-pre-line leading-relaxed">
                            {ord.projectRequirements}
                          </p>
                        </div>

                        {/* Autonomous AI Fulfillment Trigger Bar */}
                        {ord.status !== 'completed' && (
                          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span>{isBn ? 'এআই অটোমেটিক সলিউশন ও কোডিং ইঞ্জিন' : 'Autonomous AI Solution Engine'}</span>
                              </span>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                {isBn
                                  ? 'আপনার চাহিদা অনুযায়ী এআই স্বয়ংক্রিয়ভাবে কোড লিখে সম্পূর্ণ প্রজেক্ট ডেলিভারি সম্পন্ন করবে।'
                                  : 'AI autonomously codes and verifies complete project deliverables based on client requirements.'}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRunAiDelivery(ord.id)}
                              disabled={aiExecutingId === ord.id}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                            >
                              {aiExecutingId === ord.id ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  <span>{isBn ? 'এআই কোড তৈরি করছে...' : 'AI Coding In Progress...'}</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>
                                    {ord.deliveries && ord.deliveries.length > 0
                                      ? isBn
                                        ? 'এআই দিয়ে পুনরায় রি-জেনারেট করুন'
                                        : 'Re-generate with AI'
                                      : isBn
                                      ? 'এআই দিয়ে এখনি স্বয়ংক্রিয় ডেলিভারি নিন'
                                      : 'Execute AI Auto-Delivery Now'}
                                  </span>
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {/* Deliveries Section */}
                        {ord.deliveries && ord.deliveries.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              {isBn ? 'ডেলিভারি ফাইল ও কোড' : 'Delivered Source Code & Files'}
                            </span>
                            <div className="space-y-3">
                              {ord.deliveries.map((deliv: any, idx: number) => {
                                const hasHtml =
                                  deliv.livePreviewHtml ||
                                  deliv.files.some((f: any) => f.name.endsWith('.html'));

                                return (
                                  <div
                                    key={idx}
                                    className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3"
                                  >
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>{isBn ? `ডেলিভারি #${idx + 1}` : `Delivery #${idx + 1}`}</span>
                                        {deliv.aiGenerated && (
                                          <span className="text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <Sparkles className="w-2.5 h-2.5" />
                                            <span>AI Autonomous Build</span>
                                          </span>
                                        )}
                                      </span>
                                      <span className="text-[11px] text-slate-500 font-mono">
                                        {new Date(deliv.submittedAt).toLocaleString('en-GB')}
                                      </span>
                                    </div>

                                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                                      {deliv.notes}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40">
                                      {hasHtml && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const htmlContent =
                                              deliv.livePreviewHtml ||
                                              (deliv.files.find((f: any) => f.name.endsWith('.html'))?.code || '');
                                            setPreviewHtml(htmlContent);
                                          }}
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                                        >
                                          <ExternalLink className="w-3.5 h-3.5" />
                                          <span>{isBn ? 'লাইভ সাইট প্রিভিউ দেখুন' : 'Live Browser Preview'}</span>
                                        </button>
                                      )}

                                      {deliv.files.map((file: any, fIdx: number) => (
                                        <div key={fIdx} className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden text-xs">
                                          <a
                                            href={file.url}
                                            download={file.name}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                                            title="Download file"
                                          >
                                            <Download className="w-3.5 h-3.5 text-blue-600" />
                                            <span>{file.name}</span>
                                          </a>
                                          {file.code && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setViewingFile({ name: file.name, content: file.code })
                                              }
                                              className="px-2 py-1.5 border-l border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-750"
                                              title="Inspect code"
                                            >
                                              <FileText className="w-3.5 h-3.5" />
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Request Revision Option */}
                        {(ord.status === 'delivered' || ord.status === 'in_progress') && (
                          <div className="pt-2 flex items-center justify-between gap-3">
                            <span className="text-xs text-slate-500">
                              {isBn
                                ? 'কোনো বিষয় সংশোধন প্রয়োজন হলে রিভিশন রিকোয়েস্ট পাঠান।'
                                : 'Need adjustments? Submit a revision request.'}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setRevisionOrderId(revisionOrderId === ord.id ? null : ord.id)
                              }
                              className="px-3.5 py-1.5 rounded-xl border border-orange-300 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 text-xs font-bold transition flex items-center gap-1.5"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>{t.dashboard.requestRevision}</span>
                            </button>
                          </div>
                        )}

                        {/* Revision Request Form */}
                        {revisionOrderId === ord.id && (
                          <form
                            onSubmit={handleSubmitRevision}
                            className="p-4 rounded-xl border border-orange-200 dark:border-orange-900/60 bg-white dark:bg-slate-850 space-y-3"
                          >
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                              {isBn
                                ? 'সংশোধনের কারণ ও সুনির্দিষ্ট রিকোয়ারমেন্টস লিখুন:'
                                : 'Describe required adjustments & feedback:'}
                            </label>
                            <textarea
                              rows={3}
                              required
                              value={revisionReason}
                              onChange={(e) => setRevisionReason(e.target.value)}
                              placeholder={
                                isBn
                                  ? 'কী পরিবর্তন করা দরকার বিস্তারিত জানান...'
                                  : 'Specify exact feedback and adjustments needed...'
                              }
                              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setRevisionOrderId(null)}
                                className="px-3 py-1.5 rounded-lg border text-xs font-semibold text-slate-600"
                              >
                                {t.common.cancel}
                              </button>
                              <button
                                type="submit"
                                disabled={revisionSubmitting}
                                className="px-4 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-bold transition flex items-center gap-1.5"
                              >
                                <span>{isBn ? 'রিভিশন পাঠান' : 'Submit Revision'}</span>
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SUPPORT TICKETS */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.dashboard.supportTickets}
              </h2>
              <p className="text-xs text-slate-500">
                {isBn
                  ? 'আপনার অর্ডার বা কোনো প্রশ্ন থাকলে সার্বক্ষণিক সাপোর্ট সেন্টারে যোগাযোগ করুন।'
                  : 'Get help or query our technical engineering desk.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setNewTicketModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.dashboard.newTicket}</span>
            </button>
          </div>

          {tickets.length === 0 ? (
            <div
              className={`p-10 text-center rounded-2xl border space-y-2 ${
                isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500">
                {isBn ? 'আপনার কোনো সাপোর্ট টিকেট নেই।' : 'No support tickets found.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tickets list sidebar */}
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
                        ? 'bg-slate-850 border-slate-800 text-slate-300 hover:bg-slate-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono font-bold text-slate-400">{tkt.id}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                          tkt.status === 'open'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {tkt.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold truncate">{tkt.subject}</h4>
                    <p className="text-[11px] text-slate-500 truncate mt-1">
                      {tkt.messages[tkt.messages.length - 1]?.text}
                    </p>
                  </button>
                ))}
              </div>

              {/* Ticket Messages Thread */}
              <div
                className={`p-5 rounded-2xl border md:col-span-2 flex flex-col justify-between min-h-[350px] ${
                  isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                {selectedTicketId ? (
                  (() => {
                    const activeTicket = tickets.find((t) => t.id === selectedTicketId);
                    if (!activeTicket) return null;

                    return (
                      <div className="space-y-4 flex flex-col h-full justify-between">
                        <div>
                          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                {activeTicket.subject}
                              </h3>
                              {activeTicket.orderId && (
                                <span className="text-[11px] font-mono text-blue-500">
                                  Ref Order: {activeTicket.orderId}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-semibold text-slate-400">
                              {new Date(activeTicket.createdAt).toLocaleDateString('en-GB')}
                            </span>
                          </div>

                          {/* Chat messages */}
                          <div className="space-y-3 py-4 max-h-[300px] overflow-y-auto">
                            {activeTicket.messages.map((msg) => {
                              const isMe = msg.senderRole === 'customer';
                              return (
                                <div
                                  key={msg.id}
                                  className={`flex flex-col ${
                                    isMe ? 'items-end' : 'items-start'
                                  }`}
                                >
                                  <div
                                    className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                                      isMe
                                        ? 'bg-blue-600 text-white rounded-br-xs'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs'
                                    }`}
                                  >
                                    <span className="text-[10px] font-bold block opacity-75 mb-0.5">
                                      {msg.senderName} ({msg.senderRole})
                                    </span>
                                    <span>{msg.text}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Reply box */}
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSendTicketReply(activeTicket.id);
                            }}
                            placeholder={isBn ? 'মেসেজ লিখুন...' : 'Write reply...'}
                            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleSendTicketReply(activeTicket.id)}
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
                    {isBn ? 'বামে কোনো টিকেট নির্বাচন করুন।' : 'Select a ticket to view thread.'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROFILE & SETTINGS */}
      {activeTab === 'profile' && (
        <div
          className={`p-6 rounded-2xl border max-w-xl space-y-6 ${
            isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 font-bold text-lg">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {currentUser.name}
              </h3>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-500 block mb-1">
                {isBn ? 'ইউজার রোল' : 'Account Role'}
              </label>
              <span className="font-mono uppercase font-bold text-slate-800 dark:text-slate-200">
                {currentUser.role}
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-500 block mb-1">
                {isBn ? 'ভাষা পছন্দ (Language Preference)' : 'Preferred Interface Language'}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onLanguageChange('bn');
                    setPreferredLanguage('bn');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                    language === 'bn'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      : 'border-slate-300 text-slate-600'
                  }`}
                >
                  বাংলা (Bengali)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLanguageChange('en');
                    setPreferredLanguage('en');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                    language === 'en'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      : 'border-slate-300 text-slate-600'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-500 block mb-1">
                {isBn ? 'সেশন সিকিউরিটি' : 'Session Security'}
              </label>
              <p className="text-slate-600 dark:text-slate-400">
                {isBn
                  ? 'আপনার একাউন্ট তথ্য ও ব্রাউজার সেশন লোকাল এনক্রিপশনে সুরক্ষিত।'
                  : 'Your account session is client-verified with zero data leaking.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* New Support Ticket Modal */}
      {newTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-lg p-6 rounded-2xl border shadow-xl space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base">
                {isBn ? 'নতুন সাপোর্ট টিকেট খুলুন' : 'Open Support Ticket'}
              </h3>
              <button
                type="button"
                onClick={() => setNewTicketModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">{isBn ? 'বিষয়' : 'Subject'} *</label>
                <input
                  type="text"
                  required
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  placeholder={
                    isBn
                      ? 'Ex: অর্ডার DP-ORD-101 এর আপডেট প্রয়োজন'
                      : 'Ex: Need update on order DP-ORD-101'
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  {isBn ? 'সম্পর্কিত অর্ডার আইডি (ঐচ্ছিক)' : 'Related Order ID (Optional)'}
                </label>
                <select
                  value={newTicketOrderId}
                  onChange={(e) => setNewTicketOrderId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                >
                  <option value="">{isBn ? 'কোনো নির্দিষ্ট অর্ডার নেই' : 'No specific order'}</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id} - {isBn ? o.serviceTitleBn : o.serviceTitleEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  {isBn ? 'বিস্তারিত বার্তা' : 'Message'} *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newTicketMessage}
                  onChange={(e) => setNewTicketMessage(e.target.value)}
                  placeholder={isBn ? 'আপনার প্রশ্ন বা সমস্যা বিস্তারিত লিখুন...' : 'Describe your query...'}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewTicketModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-slate-600 text-xs"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  {isBn ? 'টিকেট সাবমিট করুন' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Browser Preview Modal */}
      {previewHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-5xl h-[85vh] flex flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="text-xs font-bold text-slate-300 ml-2">
                  {isBn ? '🌐 লাইভ রেসপন্সিভ প্রিভিউ (DevPilot AI Sandbox)' : '🌐 Live Preview Sandbox'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewHtml(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <iframe
              title="Live Project Preview"
              srcDoc={previewHtml}
              className="w-full flex-1 border-0 bg-white"
              sandbox="allow-scripts"
            />
          </div>
        </div>
      )}

      {/* Code Viewer & Inspector Modal */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-400" />
                <span className="font-mono text-xs font-bold text-slate-200">
                  {viewingFile.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(viewingFile.content);
                    setCopiedFileName(viewingFile.name);
                    setTimeout(() => setCopiedFileName(null), 2500);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  {copiedFileName === viewingFile.name ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isBn ? 'কপি হয়েছে!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isBn ? 'কোড কপি করুন' : 'Copy Code'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setViewingFile(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <pre className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-300 bg-slate-950/60 whitespace-pre-wrap leading-relaxed select-all">
              {viewingFile.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

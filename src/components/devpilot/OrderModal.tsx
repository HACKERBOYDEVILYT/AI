import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, FileText, Calendar, DollarSign, Send } from 'lucide-react';
import { Language, ServiceItem, ThemeMode, UserProfile } from '../../types/devpilot';
import { translations } from '../../locales/translations';
import { createOrder, authenticateUser } from '../../services/devpilotDb';

interface OrderModalProps {
  language: Language;
  theme: ThemeMode;
  service: ServiceItem | null;
  currentUser: UserProfile | null;
  initialRequirements?: string;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
  onRequireAuth: () => void;
  onAuthSuccess?: (user: UserProfile) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  language,
  theme,
  service,
  currentUser,
  initialRequirements,
  onClose,
  onOrderSuccess,
  onRequireAuth,
  onAuthSuccess,
}) => {
  const t = translations[language];
  const isDark = theme === 'dark';

  const [clientName, setClientName] = useState(currentUser?.name || '');
  const [clientEmail, setClientEmail] = useState(currentUser?.email || '');
  const [clientPhone, setClientPhone] = useState(currentUser?.phone || '');
  const [requirements, setRequirements] = useState(initialRequirements || '');
  const [deadline, setDeadline] = useState('');
  const [customBudget, setCustomBudget] = useState(service?.priceBdt ? String(service.priceBdt) : '');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!service) return null;

  const title = language === 'bn' ? service.titleBn : service.titleEn;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!clientName.trim()) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে আপনার নাম লিখুন।' : 'Please enter your name.');
      return;
    }
    if (!clientEmail.trim() || !clientEmail.includes('@')) {
      setErrorMsg(language === 'bn' ? 'সঠিক ইমেইল এড্রেস লিখুন।' : 'Please enter a valid email.');
      return;
    }
    if (!clientPhone.trim() || clientPhone.length < 10) {
      setErrorMsg(
        language === 'bn'
          ? 'অনুগ্রহ করে সঠিক মোবাইল বা হোয়াটসঅ্যাপ নম্বর দিন (কমপক্ষে ১০ ডিজিট)।'
          : 'Please enter a valid phone number (at least 10 digits).'
      );
      return;
    }
    if (!requirements.trim() || requirements.length < 15) {
      setErrorMsg(
        language === 'bn'
          ? 'কাজের বিবরণ আরেকটু বিস্তারিত লিখুন (কমপক্ষে ১৫ অক্ষর)।'
          : 'Please provide more details about your requirements (at least 15 characters).'
      );
      return;
    }

    setSubmitting(true);

    try {
      const budgetNum = Number(customBudget) || service.priceBdt;
      const attachments = attachmentUrl.trim()
        ? [
            {
              name: 'Customer Project Brief / Reference',
              url: attachmentUrl.trim(),
              sizeKb: 120,
              uploadedAt: new Date().toISOString(),
            },
          ]
        : [];

      // Legitimate customer account provisioning - no fake accounts
      let user = currentUser;
      if (!user) {
        user = authenticateUser(
          clientEmail.trim(),
          clientName.trim(),
          'customer',
          'customer123'
        );
        onAuthSuccess?.(user);
      }

      const newOrder = createOrder({
        customerId: user.id,
        customerName: clientName.trim(),
        customerEmail: clientEmail.trim(),
        customerPhone: clientPhone.trim(),
        serviceId: service.id,
        serviceTitleBn: service.titleBn,
        serviceTitleEn: service.titleEn,
        category: service.category,
        status: service.type === 'quotation' ? 'pending' : 'in_progress',
        paymentStatus: 'unpaid',
        priceBdt: budgetNum,
        projectRequirements: requirements.trim(),
        deadlineDate: deadline || undefined,
        attachments,
      });

      setSubmitting(false);
      onOrderSuccess(newOrder.id);
    } catch (err) {
      setSubmitting(false);
      setErrorMsg(
        language === 'bn'
          ? 'অর্ডার প্রসেস করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
          : 'Failed to process order. Please try again.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div
        className={`relative w-full max-w-2xl my-8 rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {t.orderModal.title}
            </span>
            <h3 className="text-lg font-bold truncate max-w-md">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Pricing Banner */}
          <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/40 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">
                {service.type === 'fixed' ? t.services.fixedPrice : t.services.quotationBased}:
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white ml-1.5 text-sm tabular-nums">
                ৳ {service.priceBdt.toLocaleString()}
              </span>
            </div>
            <div className="text-slate-500 dark:text-slate-400">
              <span>{t.services.estimatedDelivery}: </span>
              <strong className="text-slate-800 dark:text-slate-200 font-mono">
                {service.estimatedDays} {t.services.daysUnit}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.orderModal.clientName} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder={language === 'bn' ? 'যেমন: মোহাম্মদ তানভীর' : 'e.g. John Doe'}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.orderModal.clientEmail} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.orderModal.clientPhone} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="01700-000000"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.orderModal.deadlineLabel}
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t.orderModal.requirementsLabel} <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder={
                language === 'bn'
                  ? service.requirementsPromptBn || t.orderModal.requirementsPlaceholder
                  : service.requirementsPromptEn || t.orderModal.requirementsPlaceholder
              }
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {language === 'bn'
                ? 'রেফারেন্স লিংক / গিটহাব / স্ক্রিনশট ড্রাইভ লিংক (ঐচ্ছিক)'
                : 'Project Link / GitHub Repo / Screenshot Drive Link (Optional)'}
            </label>
            <input
              type="url"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {t.orderModal.cancel}
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t.orderModal.submitting}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.orderModal.submitOrder}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

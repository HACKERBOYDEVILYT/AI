import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Copy,
  Check,
  AlertCircle,
  Building2,
  Smartphone,
  ShieldCheck,
  Send,
} from 'lucide-react';
import {
  Language,
  OrderRecord,
  PaymentMethodType,
  PlatformPaymentConfig,
  ThemeMode,
} from '../../types/devpilot';
import { translations } from '../../locales/translations';
import { getPlatformSettings, submitOrderPayment } from '../../services/devpilotDb';

interface PaymentModalProps {
  language: Language;
  theme: ThemeMode;
  order: OrderRecord | null;
  onClose: () => void;
  onPaymentSuccess: (orderId: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  language,
  theme,
  order,
  onClose,
  onPaymentSuccess,
}) => {
  if (!order) return null;

  const t = translations[language];
  const isDark = theme === 'dark';
  const isBn = language === 'bn';

  const settings = getPlatformSettings();
  const paymentConfig: PlatformPaymentConfig = settings.paymentConfig;

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('bkash');
  const [trxId, setTrxId] = useState('');
  const [senderAccount, setSenderAccount] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const payableAmount = order.quotationAmountBdt || order.priceBdt;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!senderAccount.trim() || senderAccount.length < 5) {
      setErrorMessage(
        isBn
          ? 'অনুগ্রহ করে যে নম্বর বা ব্যাংক অ্যাকাউন্ট থেকে টাকা পাঠিয়েছেন তা উল্লেখ করুন।'
          : 'Please enter the sender phone or bank account number.'
      );
      return;
    }

    if (!trxId.trim() || trxId.length < 5) {
      setErrorMessage(
        isBn
          ? 'অনুগ্রহ করে সঠিক ট্রানজেকশন আইডি (TrxID) বা রেফারেন্স নম্বর দিন।'
          : 'Please enter a valid Transaction ID (TrxID) or deposit reference.'
      );
      return;
    }

    setSubmitting(true);
    try {
      submitOrderPayment(order.id, {
        method: selectedMethod,
        trxId: trxId.trim().toUpperCase(),
        senderAccount: senderAccount.trim(),
        amountBdt: payableAmount,
      });

      setSubmitting(false);
      onPaymentSuccess(order.id);
      onClose();
    } catch (err) {
      setSubmitting(false);
      setErrorMessage(String(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div
        className={`relative w-full max-w-xl my-8 rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 block mb-1">
              {order.id}
            </span>
            <h3 className="text-xl font-bold tracking-tight">{t.paymentModal.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isBn ? order.serviceTitleBn : order.serviceTitleEn}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Payable Amount Highlight */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs text-blue-100 block font-medium">
                {t.paymentModal.payableAmount}
              </span>
              <span className="text-2xl font-extrabold font-mono tracking-tight">
                ৳ {payableAmount.toLocaleString()} BDT
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] bg-white/20 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">
                {order.status === 'quotation_sent'
                  ? isBn
                    ? 'অনুমোদিত কোটেশন'
                    : 'Approved Quotation'
                  : isBn
                  ? 'ফিক্সড রেট'
                  : 'Fixed Price'}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              {t.paymentModal.chooseMethod}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('bkash')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                  selectedMethod === 'bkash'
                    ? 'border-pink-500 bg-pink-50/80 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 ring-2 ring-pink-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <Smartphone className="w-4 h-4 text-pink-600" />
                <span className="text-xs font-bold">{t.paymentModal.bkashLabel}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('nagad')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                  selectedMethod === 'nagad'
                    ? 'border-orange-500 bg-orange-50/80 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 ring-2 ring-orange-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <Smartphone className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-bold">{t.paymentModal.nagadLabel}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('rocket')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                  selectedMethod === 'rocket'
                    ? 'border-purple-500 bg-purple-50/80 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 ring-2 ring-purple-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <Smartphone className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold">{t.paymentModal.rocketLabel}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('bank')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                  selectedMethod === 'bank'
                    ? 'border-blue-500 bg-blue-50/80 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 ring-2 ring-blue-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold">{t.paymentModal.bankLabel}</span>
              </button>
            </div>
          </div>

          {/* Payment Method Details Box */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-3">
            {selectedMethod === 'bkash' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      bKash {paymentConfig.bkashType} Number
                    </span>
                    <span className="text-sm font-mono font-bold text-pink-600 dark:text-pink-400">
                      {paymentConfig.bkashNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(paymentConfig.bkashNumber, 'bkash')}
                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 text-xs flex items-center gap-1 font-semibold"
                  >
                    {copiedKey === 'bkash' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">{t.common.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t.common.copy}</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {isBn
                    ? paymentConfig.bkashInstructionsBn
                    : paymentConfig.bkashInstructionsEn}
                </p>
              </div>
            )}

            {selectedMethod === 'nagad' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Nagad {paymentConfig.nagadType} Number
                    </span>
                    <span className="text-sm font-mono font-bold text-orange-600 dark:text-orange-400">
                      {paymentConfig.nagadNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(paymentConfig.nagadNumber, 'nagad')}
                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 text-xs flex items-center gap-1 font-semibold"
                  >
                    {copiedKey === 'nagad' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">{t.common.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t.common.copy}</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {isBn
                    ? paymentConfig.nagadInstructionsBn
                    : paymentConfig.nagadInstructionsEn}
                </p>
              </div>
            )}

            {selectedMethod === 'rocket' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Rocket {paymentConfig.rocketType} Number
                    </span>
                    <span className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400">
                      {paymentConfig.rocketNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(paymentConfig.rocketNumber, 'rocket')}
                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 text-xs flex items-center gap-1 font-semibold"
                  >
                    {copiedKey === 'rocket' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">{t.common.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t.common.copy}</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {isBn
                    ? 'রকেট অ্যাপ বা ইউএসএসডি কোড ব্যবহার করে উপরের নম্বরে নির্ধারিত টাকা সেন্ড মানি করুন এবং ট্রানজেকশন আইডি নিচে প্রদান করুন।'
                    : 'Transfer payment to Rocket number above. Note TrxID for verification.'}
                </p>
              </div>
            )}

            {selectedMethod === 'bank' && (
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank Name:</span>
                    <span className="font-semibold">{paymentConfig.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account Name:</span>
                    <span className="font-semibold">{paymentConfig.accountName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Account No:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {paymentConfig.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(paymentConfig.accountNumber, 'bank_acc')}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        {copiedKey === 'bank_acc' ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Branch & Routing:</span>
                    <span className="font-mono text-[11px]">
                      {paymentConfig.branchName} ({paymentConfig.routingNumber})
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.paymentModal.enterSenderAccount} *
              </label>
              <input
                type="text"
                required
                value={senderAccount}
                onChange={(e) => setSenderAccount(e.target.value)}
                placeholder={
                  selectedMethod === 'bank'
                    ? 'Ex: City Bank Acc 123456789'
                    : 'Ex: 017xxxxxxxx বা 018xxxxxxxx'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.paymentModal.enterTrxId} *
              </label>
              <input
                type="text"
                required
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                placeholder="Ex: 9A8B7C6D5E বা ডিপোজিট স্লিপ রেফারেন্স"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono uppercase tracking-wider focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{t.paymentModal.paymentSubmittedNotice}</span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {t.paymentModal.close}
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>{isBn ? 'যাচাইয়ের জন্য পাঠানো হচ্ছে...' : 'Submitting...'}</span>
                ) : (
                  <>
                    <span>{t.paymentModal.submitPayment}</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

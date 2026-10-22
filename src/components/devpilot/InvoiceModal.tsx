import React from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Code2,
  Building,
  Sparkles,
} from 'lucide-react';
import { Language, OrderRecord, ThemeMode } from '../../types/devpilot';
import { translations } from '../../locales/translations';
import { getPlatformSettings } from '../../services/devpilotDb';

interface InvoiceModalProps {
  language: Language;
  theme: ThemeMode;
  order: OrderRecord | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  language,
  theme,
  order,
  onClose,
}) => {
  if (!order) return null;

  const t = translations[language];
  const isDark = theme === 'dark';
  const isBn = language === 'bn';
  const settings = getPlatformSettings();

  const invoiceNumber = `INV-${order.id.replace('DP-ORD-', '')}`;
  const totalAmount = order.quotationAmountBdt || order.priceBdt;
  const isPaid = order.paymentStatus === 'paid';
  const isPendingVerification = order.paymentStatus === 'verification_pending';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-fade-in print:p-0 print:bg-white">
      <div
        id="devpilot-invoice-printable"
        className={`relative w-full max-w-2xl my-8 rounded-2xl border shadow-2xl overflow-hidden transition-all print:shadow-none print:border-none print:m-0 print:max-w-full ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Controls (Hidden in print) */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between print:hidden bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {isBn ? 'অফিসিয়াল ইনভয়েস প্রিভিউ' : 'Official Invoice Preview'}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold">
              {invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isBn ? 'প্রিন্ট / PDF সেভ করুন' : 'Print / Save PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-8 sm:p-10 space-y-8 bg-white text-slate-900 print:p-8">
          {/* Top Brand Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950">DevPilot</h1>
                <p className="text-xs text-slate-500 font-medium">
                  {settings.taglineBn}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-0.5">
              <h2 className="text-xl font-extrabold uppercase tracking-widest text-slate-900">
                {isBn ? 'ইনভয়েস / চালান' : 'INVOICE'}
              </h2>
              <p className="text-xs font-mono font-semibold text-slate-600">
                #{invoiceNumber}
              </p>
              <p className="text-xs text-slate-500">
                {isBn ? 'তারিখ:' : 'Date:'}{' '}
                {new Date(order.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Parties: Billed By & Billed To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5">
              <span className="font-bold uppercase tracking-wider text-slate-400 block">
                {isBn ? 'সার্ভিস প্রদানকারী (Service Provider):' : 'Billed By:'}
              </span>
              <p className="font-bold text-sm text-slate-900">DevPilot Engineering Platform</p>
              <p className="text-slate-600">Email: {settings.contactEmail}</p>
              <p className="text-slate-600">Phone: {settings.contactPhone}</p>
              <p className="text-slate-600">Dhaka, Bangladesh</p>
            </div>

            <div className="space-y-1.5 sm:text-right">
              <span className="font-bold uppercase tracking-wider text-slate-400 block">
                {isBn ? 'ক্লায়েন্ট বিবরণ (Bill To):' : 'Billed To:'}
              </span>
              <p className="font-bold text-sm text-slate-900">{order.customerName}</p>
              <p className="text-slate-600">Email: {order.customerEmail}</p>
              <p className="text-slate-600">Phone: {order.customerPhone}</p>
              <p className="text-slate-500 font-mono">Ref Order: {order.id}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">{isBn ? 'সার্ভিস বিবরণ' : 'Description'}</th>
                  <th className="py-3 px-4 text-center">{isBn ? 'ক্যাটাগরি' : 'Category'}</th>
                  <th className="py-3 px-4 text-center">{isBn ? 'পরিমাণ' : 'Qty'}</th>
                  <th className="py-3 px-4 text-right">{isBn ? 'মোট মূল্য' : 'Amount (BDT)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                <tr>
                  <td className="py-4 px-4 space-y-1">
                    <p className="font-bold text-sm text-slate-950">
                      {isBn ? order.serviceTitleBn : order.serviceTitleEn}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-2 max-w-md">
                      {order.projectRequirements}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-[11px] uppercase">
                      {order.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-mono">1</td>
                  <td className="py-4 px-4 text-right font-mono font-bold text-sm">
                    ৳ {totalAmount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Calculation Summary & Payment Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start pt-2">
            {/* Status Stamp */}
            <div className="p-4 rounded-xl border space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                {isBn ? 'পেমেন্ট ও অর্ডার স্ট্যাটাস' : 'Payment Status'}
              </span>

              {isPaid ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{isBn ? 'পরিশোধিত (PAID)' : 'PAID IN FULL'}</span>
                </div>
              ) : isPendingVerification ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>{isBn ? 'যাচাইাধীন (PENDING VERIFICATION)' : 'PAYMENT UNDER REVIEW'}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-800 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>{isBn ? 'বকেয়া (UNPAID)' : 'PAYMENT DUE'}</span>
                </div>
              )}

              {order.payment && (
                <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                  <p>
                    <span className="font-semibold">{isBn ? 'পেমেন্ট মাধ্যম:' : 'Method:'}</span>{' '}
                    <span className="uppercase font-mono font-bold">{order.payment.method}</span>
                  </p>
                  <p>
                    <span className="font-semibold">{isBn ? 'ট্রানজেকশন আইডি:' : 'TrxID:'}</span>{' '}
                    <span className="font-mono font-bold text-slate-900">{order.payment.trxId}</span>
                  </p>
                  <p>
                    <span className="font-semibold">{isBn ? 'প্রেরক অ্যাকাউন্ট:' : 'Sender Acc:'}</span>{' '}
                    <span className="font-mono">{order.payment.senderAccount}</span>
                  </p>
                </div>
              )}

              {/* Visual Status Badge for AI Revenue Verification */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">AI Revenue Status:</span>
                {order.aiRevenueVerified || (order.paymentStatus === 'paid' && order.payment?.verifiedAt) ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-300 shadow-2xs">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Pending Review</span>
                  </span>
                )}
              </div>
            </div>

            {/* Total Math */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>{isBn ? 'সাবটোটাল' : 'Subtotal'}</span>
                <span className="font-mono font-bold">৳ {totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>{isBn ? 'ভ্যাট / ট্যাক্স (০%)' : 'VAT / Tax (0%)'}</span>
                <span className="font-mono">৳ 0</span>
              </div>
              <div className="flex justify-between py-2 border-b-2 border-slate-900 text-slate-900 font-bold text-base">
                <span>{isBn ? 'মোট পরিশোধযোগ্য' : 'Total Amount'}</span>
                <span className="font-mono text-lg font-extrabold text-blue-600">
                  ৳ {totalAmount.toLocaleString()} BDT
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Footer Note */}
          <div className="border-t border-slate-200 pt-6 text-[11px] text-slate-500 text-center space-y-1">
            <p>
              {isBn
                ? 'এটি DevPilot প্ল্যাটফর্ম কর্তৃক ইস্যুকৃত একটি স্বয়ংক্রিয় ডিজিটাল চালান।'
                : 'This is a computer-generated digital invoice from DevPilot Platform.'}
            </p>
            <p>
              Help &amp; Queries: {settings.contactEmail} | WhatsApp: {settings.whatsappNumber}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

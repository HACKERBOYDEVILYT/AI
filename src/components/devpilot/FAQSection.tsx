import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Language, ThemeMode } from '../../types/devpilot';

interface FAQSectionProps {
  language: Language;
  theme: ThemeMode;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ language, theme }) => {
  const isDark = theme === 'dark';
  const isBn = language === 'bn';

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = isBn
    ? [
        {
          q: 'অর্ডার করার পর কীভাবে অগ্রগতি ট্র্যাক করব?',
          a: 'অর্ডার সাবমিট করলেই একটি ইউনিক অর্ডার আইডি (যেমন DP-ORD-2026-101) তৈরি হবে। আপনি আপনার কাস্টমার ড্যাশবোর্ডে লগইন করে কাজের বর্তমান স্ট্যাটাস, কোটেশন, পেমেন্ট ও ডেলিভারি ফাইল রিয়েল-টাইম দেখতে পারবেন।',
        },
        {
          q: 'পেমেন্ট কোন মাধ্যমে করা যায়?',
          a: 'আমরা বাংলাদেশের সব প্রধান লোকাল পেমেন্ট মেথড যেমন বিকাশ (bKash), নগদ (Nagad), রকেট (Rocket) এবং সরাসরি ব্যাংক ট্রান্সফার গ্রহণ করি। পেমেন্ট করার পর ট্রানজেকশন আইডি (TrxID) দিলে তা অ্যাডমিন প্যানেল থেকে দ্রুত ভেরিফাই করে কনফার্ম করা হয়।',
        },
        {
          q: 'কাজের ডেলিভারিতে কোনো ভুল থাকলে রিভিশন কীভাবে পাব?',
          a: 'আমরা শতভাগ ক্লায়েন্ট সন্তুষ্টির নিশ্চয়তা দেই। ডেলিভারির পর যদি কোনো অ্যাডজাস্টমেন্ট বা সংশোধন দরকার হয়, আপনি ড্যাশবোর্ড থেকে সরাসরি "সংশোধন চান" (Request Revision) বাটনে ক্লিক করে কারণ লিখে পাঠাতে পারবেন। আমাদের টিম দ্রুত সংশোধন করে দিবে।',
        },
        {
          q: 'কোটেশন ভিত্তিক সার্ভিসের ক্ষেত্রে প্রক্রিয়া কী?',
          a: 'বড় প্রজেক্ট বা কাস্টম অটোমেশনের ক্ষেত্রে আপনি আপনার বিস্তারিত প্রয়োজনীয়তা লিখে অর্ডার সাবমিট করবেন। আমাদের সিনিয়র ডেভেলপার প্রজেক্ট বিশ্লেষণ করে উপযুক্ত কোটেশন ও সময়সীমা নির্ধারণ করবেন। আপনি কোটেশন অনুমোদন করার পরেই পেমেন্ট ও কাজ শুরু হবে।',
        },
        {
          q: 'মোবাইল থেকে অ্যাপ হিসেবে ব্যবহার করা যাবে কি?',
          a: 'হ্যাঁ! DevPilot একটি আধুনিক প্রগ্রেসিভ ওয়েব অ্যাপ (PWA)। অ্যান্ড্রয়েড মোবাইল থেকে "অ্যাপ ইনস্টল করুন" বাটনে ক্লিক করে সরাসরি ১-ক্লিকে ইনস্টল করতে পারবেন অথবা সরাসরি APK ডাউনলোড করতে পারবেন।',
        },
      ]
    : [
        {
          q: 'How do I track my service order after submission?',
          a: 'Once submitted, a unique Order ID (e.g., DP-ORD-2026-101) is issued. You can log into your Customer Dashboard at any time to monitor status, review quotations, verify payments, and download deliverable files.',
        },
        {
          q: 'What payment methods are supported in Bangladesh?',
          a: 'We support bKash, Nagad, Rocket, and direct Bangladesh Bank Transfer. Simply submit your Transaction ID (TrxID) for swift verification and automated invoicing.',
        },
        {
          q: 'What if adjustments are needed after delivery?',
          a: 'We provide free revision guarantees. If changes are needed, click "Request Revision" from your order drawer, explain the adjustments, and our team will patch it promptly.',
        },
        {
          q: 'How does the custom quotation workflow operate?',
          a: 'For complex custom requirements or automations, submit your project brief. An engineer analyzes the scope and issues a fixed quotation. Work commences only after your explicit approval.',
        },
        {
          q: 'Can DevPilot be installed on Android devices?',
          a: 'Yes. DevPilot is a PWA with full WebAPK installation support and direct APK download capabilities for offline-ready mobile workflow management.',
        },
      ];

  return (
    <section id="faq-section" className="py-12 md:py-20 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{isBn ? 'সাধারণ প্রশ্নোত্তর' : 'Frequently Asked Questions'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {isBn ? 'আপনার মনে থাকা সাধারণ প্রশ্নের উত্তর' : 'Common Inquiries & Answers'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            {isBn
              ? 'আমাদের কাজের ধারা, পেমেন্ট সিকিউরিটি ও সার্ভিস গ্যারান্টি সম্পর্কিত তথ্যাবলী।'
              : 'Essential details regarding project turnaround, payments, and revisions.'}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 font-normal">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Bug,
  Layout,
  Plug,
  Zap,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
} from 'lucide-react';
import { Language, ServiceItem, ThemeMode } from '../../types/devpilot';
import { translations } from '../../locales/translations';
import { getServices } from '../../services/devpilotDb';

interface AIDiagnosticModalProps {
  language: Language;
  theme: ThemeMode;
  onClose: () => void;
  onSelectRecommendedService: (service: ServiceItem) => void;
}

export const AIDiagnosticModal: React.FC<AIDiagnosticModalProps> = ({
  language,
  theme,
  onClose,
  onSelectRecommendedService,
}) => {
  const t = translations[language];
  const isDark = theme === 'dark';
  const isBn = language === 'bn';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [problemType, setProblemType] = useState<string>('bug_fix');
  const [techStack, setTechStack] = useState<string>('react');
  const [urgency, setUrgency] = useState<string>('fast');

  const services = getServices();

  const handleCalculate = () => {
    setStep(3);
  };

  const recommendedService = React.useMemo(() => {
    return (
      services.find((s) => s.category === problemType) ||
      services.find((s) => s.id === 'svc-bug-fix') ||
      services[0]
    );
  }, [services, problemType]);

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
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                {isBn ? 'প্রজেক্ট স্কোপ ও বাজেট ক্যালকুলেটর' : 'Project Scope & Diagnostic Estimator'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn
                  ? 'আপনার টেকনিক্যাল চাহিদা সিলেক্ট করে উপযুক্ত সার্ভিস ও বাজেট জানুন'
                  : 'Select your technical needs to generate an instant solution estimate.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                {isBn ? 'ধাপ ১: আপনার সাইট বা অ্যাপের বর্তমান প্রয়োজন কী?' : 'Step 1: What is your primary need?'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'bug_fix',
                    title: isBn ? 'সাইট এরর বা বাগ ফিক্সিং' : 'Fix Website / Code Bugs',
                    desc: isBn ? 'ক্র্যাশ, ফর্ম এরর, সিএসএস ভাঙা' : 'Crashes, form failure, layout bugs',
                    icon: Bug,
                  },
                  {
                    id: 'web_dev',
                    title: isBn ? 'নতুন ল্যান্ডিং পেজ তৈরি' : 'Build Custom Landing Page',
                    desc: isBn ? 'হাই-কনভার্টিং মডার্ন ওয়েব পেজ' : 'High-converting responsive landing page',
                    icon: Layout,
                  },
                  {
                    id: 'api',
                    title: isBn ? 'বিকাশ/এপিআই গেটওয়ে যুক্ত করা' : 'Payment / REST API Setup',
                    desc: isBn ? 'বিকাশ, নগদ, এসএমএস বা ডেটা এপিআই' : 'bKash, Nagad, Stripe, webhooks',
                    icon: Plug,
                  },
                  {
                    id: 'maintenance',
                    title: isBn ? 'স্পিড ও সিকিউরিটি অপটিমাইজেশন' : 'Speed & Performance Boost',
                    desc: isBn ? 'গুগল পেজস্পিড বৃদ্ধি ও ক্যাশিং' : 'PageSpeed 90+, caching & audits',
                    icon: Zap,
                  },
                  {
                    id: 'automation',
                    title: isBn ? 'প্রসেস অটোমেশন বা স্ক্র্যাপিং' : 'Process Automation Script',
                    desc: isBn ? 'পুনরাবৃত্তিমূলক কাজ স্বয়ংক্রিয়করণ' : 'Custom automation bot & scrapers',
                    icon: Cpu,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = problemType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setProblemType(item.id)}
                      className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-500'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <span>{isBn ? 'পরবর্তী ধাপ' : 'Next Step'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                {isBn ? 'ধাপ ২: প্ল্যাটফর্ম ও ডেলিভারির সময়সীমা' : 'Step 2: Platform & Urgency'}
              </span>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1.5 text-slate-700 dark:text-slate-300">
                    {isBn ? 'ওয়েবসাইটের বর্তমান টেকনোলজি / সিএমএস:' : 'Current Tech Stack:'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['react', 'wordpress', 'php', 'nextjs', 'html_css', 'other'].map((tech) => (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => setTechStack(tech)}
                        className={`p-2.5 rounded-xl border text-center font-bold uppercase text-[11px] transition ${
                          techStack === tech
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {tech.replace('_', ' / ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="font-semibold block mb-1.5 text-slate-700 dark:text-slate-300">
                    {isBn ? 'কত দ্রুত সম্পন্ন করতে চান?' : 'Required Delivery Urgency:'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'urgent', label: isBn ? '২৪ ঘণ্টার মধ্যে' : 'Within 24 Hours' },
                      { id: 'fast', label: isBn ? '২-৩ দিন' : '2-3 Days' },
                      { id: 'standard', label: isBn ? '১ সপ্তাহ' : '1 Week' },
                    ].map((urg) => (
                      <button
                        key={urg.id}
                        type="button"
                        onClick={() => setUrgency(urg.id)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition ${
                          urgency === urg.id
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {urg.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl border text-xs text-slate-600 font-semibold"
                >
                  {isBn ? 'পেছনে' : 'Back'}
                </button>
                <button
                  type="button"
                  onClick={handleCalculate}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ফলাফল ও এস্টিমেট দেখুন' : 'Generate Estimate'}</span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && recommendedService && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded">
                  {isBn ? 'সেরা প্রস্তাবনা' : 'Best Matching Solution'}
                </span>
                <h4 className="text-base font-bold">
                  {isBn ? recommendedService.titleBn : recommendedService.titleEn}
                </h4>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
                  {isBn ? recommendedService.shortDescBn : recommendedService.shortDescEn}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
                  <span className="text-[11px] text-slate-500 block">
                    {isBn ? 'আনুমানিক বাজেট' : 'Estimated Investment'}
                  </span>
                  <span className="text-xl font-black font-mono text-blue-600 dark:text-blue-400">
                    ৳ {recommendedService.priceBdt.toLocaleString()} BDT
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
                  <span className="text-[11px] text-slate-500 block">
                    {isBn ? 'প্রত্যাশিত ডেলিভারি' : 'Estimated Delivery'}
                  </span>
                  <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {recommendedService.estimatedDays} {t.services.daysUnit}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl border text-xs text-slate-600 font-semibold"
                >
                  {isBn ? 'পুনরায় গণনা' : 'Recalculate'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectRecommendedService(recommendedService);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition flex items-center gap-1.5"
                >
                  <span>{isBn ? 'এই সার্ভিসটি অর্ডার করুন' : 'Order This Service'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

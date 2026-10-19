import React from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  FileCode,
  ShieldCheck,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Language, ServiceItem, ThemeMode } from '../../types/devpilot';
import { translations } from '../../locales/translations';

interface ServiceDetailsModalProps {
  language: Language;
  theme: ThemeMode;
  service: ServiceItem | null;
  onClose: () => void;
  onOrderService: (service: ServiceItem) => void;
}

export const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({
  language,
  theme,
  service,
  onClose,
  onOrderService,
}) => {
  if (!service) return null;

  const t = translations[language];
  const isDark = theme === 'dark';
  const isBn = language === 'bn';

  const title = isBn ? service.titleBn : service.titleEn;
  const fullDesc = isBn ? service.fullDescBn : service.fullDescEn;
  const features = isBn ? service.featuresBn : service.featuresEn;
  const requirementsPrompt = isBn ? service.requirementsPromptBn : service.requirementsPromptEn;
  const badge = isBn ? service.badgeBn : service.badgeEn;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div
        className={`relative w-full max-w-2xl my-8 rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1.5 pr-6">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {service.category.replace('_', ' ')}
              </span>
              {badge && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                  {badge}
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Price & Delivery pill bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                {t.services.startingAt}
              </span>
              <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                {service.type === 'fixed'
                  ? `৳ ${service.priceBdt.toLocaleString()}`
                  : isBn
                  ? 'কাস্টম কোটেশন'
                  : 'Custom Quote'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                {t.services.estimatedDelivery}
              </span>
              <div className="flex items-center gap-1.5 text-base font-bold text-slate-800 dark:text-slate-200">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>
                  {service.estimatedDays} {t.services.daysUnit}
                </span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                {isBn ? 'মূল্য নির্ধারণ ধরন' : 'Pricing Model'}
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {service.type === 'fixed' ? t.services.fixedPrice : t.services.quotationBased}
              </span>
            </div>
          </div>

          {/* Full Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isBn ? 'সার্ভিসের পূর্ণ বিবরণ' : 'Full Service Overview'}
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-line">
              {fullDesc}
            </p>
          </div>

          {/* Features Included */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isBn ? 'কী কী অন্তর্ভুক্ত রয়েছে' : 'What is Included'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-850/60 text-xs text-slate-700 dark:text-slate-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Required details from client */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-800 dark:text-blue-300">
              <FileCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{isBn ? 'অর্ডারের সময় কী কী তথ্য প্রয়োজন' : 'Required Project Information'}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {requirementsPrompt}
            </p>
          </div>

          {/* Trust strip */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              {isBn
                ? '১০০% কোড কোয়ালিটি নিশ্চয়তা এবং ফ্রি রিভিশন গ্যারান্টি।'
                : '100% Code Quality Assurance & Free Revision Warranty.'}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-850">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOrderService(service);
            }}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition flex items-center gap-2"
          >
            <span>{t.services.orderNow}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

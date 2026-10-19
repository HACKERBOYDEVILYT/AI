import React from 'react';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  Sparkles,
  Award,
  Layers,
  Wrench,
  CheckCircle2,
} from 'lucide-react';
import { Language, ThemeMode } from '../../types/devpilot';
import { translations } from '../../locales/translations';

interface LandingHeroProps {
  language: Language;
  theme: ThemeMode;
  onExploreServices: () => void;
  onOrderCustom: () => void;
  onOpenAIDiagnostic: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  language,
  theme,
  onExploreServices,
  onOrderCustom,
  onOpenAIDiagnostic,
}) => {
  const t = translations[language];
  const isDark = theme === 'dark';

  return (
    <div className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24">
      {/* Background radial atmosphere */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40 blur-3xl -z-10 ${
          isDark
            ? 'bg-gradient-to-b from-blue-600/30 via-indigo-600/10 to-transparent'
            : 'bg-gradient-to-b from-blue-400/25 via-sky-200/20 to-transparent'
        }`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Top Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-900 bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-sm animate-fade-in">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{t.hero.badge}</span>
          </div>

          {/* Primary Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.18] text-slate-900 dark:text-white">
            {t.hero.headline}
          </h1>

          {/* Subheadline description */}
          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal">
            {t.hero.subheadline}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={onExploreServices}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 group"
            >
              <span>{t.hero.exploreServicesBtn}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={onOrderCustom}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold text-sm shadow-sm transition-all"
            >
              {t.hero.orderCustomBtn}
            </button>

            <button
              type="button"
              onClick={onOpenAIDiagnostic}
              className="w-full sm:w-auto px-4 py-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t.nav.aiDiagnostic}</span>
            </button>
          </div>

          {/* Guarantee pill */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t.hero.guarantee}</span>
          </div>

          {/* Key Metrics Strip */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-850/70 backdrop-blur-sm text-center">
              <div className="font-extrabold text-2xl lg:text-3xl font-mono text-blue-600 dark:text-blue-400 tabular-nums">
                100%
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                {language === 'bn' ? 'সরাসরি কাজের নিশ্চয়তা' : 'Verified Direct Work'}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-850/70 backdrop-blur-sm text-center">
              <div className="font-extrabold text-2xl lg:text-3xl font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                24-48h
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                {language === 'bn' ? 'দ্রুত সমাধান ও ডেলিভারি' : 'Rapid Delivery Time'}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-850/70 backdrop-blur-sm text-center">
              <div className="font-extrabold text-2xl lg:text-3xl font-mono text-purple-600 dark:text-purple-400 tabular-nums">
                bKash / Bank
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                {language === 'bn' ? 'সহজ ম্যানুয়াল পেমেন্ট' : 'Direct Bangladesh Payout'}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-850/70 backdrop-blur-sm text-center">
              <div className="font-extrabold text-2xl lg:text-3xl font-mono text-amber-600 dark:text-amber-400 tabular-nums">
                24/7
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                {language === 'bn' ? 'লাইভ সাপোর্ট ও ট্র্যাকিং' : 'Ticket Support & Tracking'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

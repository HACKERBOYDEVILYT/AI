import React from 'react';
import { FileEdit, Receipt, Clock3, CheckCircle, ArrowRight } from 'lucide-react';
import { Language, ThemeMode } from '../../types/devpilot';
import { translations } from '../../locales/translations';

interface HowItWorksProps {
  language: Language;
  theme: ThemeMode;
  onExploreServices: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ language, theme, onExploreServices }) => {
  const t = translations[language];
  const isDark = theme === 'dark';

  const steps = [
    {
      num: '01',
      icon: <FileEdit className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      title: t.howItWorks.step1Title,
      desc: t.howItWorks.step1Desc,
    },
    {
      num: '02',
      icon: <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      title: t.howItWorks.step2Title,
      desc: t.howItWorks.step2Desc,
    },
    {
      num: '03',
      icon: <Clock3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      title: t.howItWorks.step3Title,
      desc: t.howItWorks.step3Desc,
    },
    {
      num: '04',
      icon: <CheckCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      title: t.howItWorks.step4Title,
      desc: t.howItWorks.step4Desc,
    },
  ];

  return (
    <section className="py-12 md:py-20 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t.howItWorks.heading}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            {t.howItWorks.subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 border relative flex flex-col justify-between ${
                isDark
                  ? 'bg-slate-850 border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700/60">
                    {step.icon}
                  </div>
                  <span className="font-mono text-2xl font-black text-slate-300 dark:text-slate-700">
                    {step.num}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onExploreServices}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md transition"
          >
            <span>{language === 'bn' ? 'সার্ভিস বেছে নিন এবং শুরু করুন' : 'Select a Service to Get Started'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};

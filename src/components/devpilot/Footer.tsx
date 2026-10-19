import React from 'react';
import {
  Code2,
  ShieldCheck,
  Smartphone,
  Mail,
  Phone,
  Heart,
  MessageCircle,
} from 'lucide-react';
import { Language, ThemeMode } from '../../types/devpilot';
import { translations } from '../../locales/translations';
import { getPlatformSettings } from '../../services/devpilotDb';

interface FooterProps {
  language: Language;
  theme: ThemeMode;
  onNavigate: (view: 'landing' | 'services' | 'dashboard' | 'admin') => void;
  onOpenPolicy: (type: 'privacy' | 'terms') => void;
  onOpenPWAInstall: () => void;
  onAdminSecretTrigger?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  theme,
  onNavigate,
  onOpenPolicy,
  onOpenPWAInstall,
  onAdminSecretTrigger,
}) => {
  const t = translations[language];
  const isDark = theme === 'dark';
  const isBn = language === 'bn';
  const settings = getPlatformSettings();
  const [clickCount, setClickCount] = React.useState(0);

  const handleSecretClick = () => {
    const next = clickCount + 1;
    if (next >= 5) {
      setClickCount(0);
      onAdminSecretTrigger?.();
    } else {
      setClickCount(next);
      setTimeout(() => setClickCount(0), 3000);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`border-t transition-colors ${
        isDark
          ? 'bg-slate-950 border-slate-800 text-slate-400'
          : 'bg-white border-slate-200 text-slate-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                <Code2 className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                DevPilot
              </span>
            </div>

            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {isBn
                ? 'বাংলাদেশের নির্ভরযোগ্য ডিজিটাল সার্ভিস ও সফটওয়্যার ইঞ্জিনিয়ারিং প্ল্যাটফর্ম। দ্রুত ডেলিভারি ও শতভাগ কোড কোয়ালিটি নিশ্চয়তা।'
                : 'Bangladesh premier digital engineering and website troubleshooting studio.'}
            </p>

            <div className="pt-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[11px] font-semibold text-slate-500">
                {isBn ? 'নিরাপদ লোকাল পেমেন্ট ও ভেরিফিকেশন' : 'Verified Local Payment Processing'}
              </span>
            </div>
          </div>

          {/* Services Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {isBn ? 'সার্ভিস ক্যাটালগ' : 'Service Offerings'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  {isBn ? 'ওয়েবসাইট বাগ ফিক্সিং' : 'Website Bug Fixing'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  {isBn ? 'ল্যান্ডিং পেজ ডেভেলপমেন্ট' : 'Landing Page Development'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  {isBn ? 'বিকাশ ও এপিআই ইন্টিগ্রেশন' : 'bKash & REST API Setup'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  {isBn ? 'স্পিড অপটিমাইজেশন' : 'Speed & Core Web Vitals'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  {isBn ? 'কাস্টম প্রসেস অটোমেশন' : 'Custom Automation Script'}
                </button>
              </li>
            </ul>
          </div>

          {/* Quick links & Client Desk */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {isBn ? 'কাস্টমার ও পোর্টাল' : 'Platform & Portal'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  {t.nav.customerDashboard}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenPWAInstall}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t.nav.installApp} (Android)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy('terms')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  {isBn ? 'সেবার শর্তাবলী' : 'Terms of Service'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy('privacy')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  {isBn ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
                </button>
              </li>
            </ul>
          </div>

          {/* Payment Badges & WhatsApp */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {isBn ? 'সমর্থিত পেমেন্ট মেথড' : 'Supported Gateways'}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-lg font-mono font-bold text-[10px] bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300">
                bKash
              </span>
              <span className="px-2.5 py-1 rounded-lg font-mono font-bold text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                Nagad
              </span>
              <span className="px-2.5 py-1 rounded-lg font-mono font-bold text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                Rocket
              </span>
              <span className="px-2.5 py-1 rounded-lg font-mono font-bold text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                Bank Wire
              </span>
            </div>

            <div className="pt-2 text-xs space-y-1">
              <p className="text-slate-500">Contact: {settings.contactEmail}</p>
              <p className="text-slate-500">Phone: {settings.contactPhone}</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            &copy; {currentYear} DevPilot Platform. {isBn ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
          </p>
          <div className="flex items-center gap-2">
            <span>
              {isBn ? 'বাংলা ও ইংরেজি দ্বৈত ভাষা সমর্থিত' : 'Bengali & English Dual Support'}
            </span>
            <span
              onClick={handleSecretClick}
              className="cursor-pointer select-none px-1 text-slate-400 hover:text-slate-300 transition-colors"
              title=""
            >
              ·
            </span>
            <span className="font-mono text-[11px]">v1.0.0 Production Release</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

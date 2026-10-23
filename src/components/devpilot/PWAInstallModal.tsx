import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Download,
  CheckCircle2,
  Share2,
  PlusSquare,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { Language, ThemeMode } from '../../types/devpilot';

interface PWAInstallModalProps {
  language: Language;
  theme: ThemeMode;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  language,
  theme,
  onClose,
}) => {
  const isDark = theme === 'dark';
  const isBn = language === 'bn';

  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const outcome = await installPrompt.userChoice;
      if (outcome.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    } else {
      // Prompt direct download or show manual step
      alert(
        isBn
          ? 'ব্রাউজারের মেন্যু (⋮) থেকে "Install App" বা "Add to Home screen" নির্বাচন করুন।'
          : 'Tap your browser menu (⋮) and select "Install app" or "Add to Home Screen".'
      );
    }
  };

  const handleApkDownload = () => {
    setDownloadStarted(true);
    try {
      const a = document.createElement('a');
      a.href = '/devpilot.apk';
      a.download = 'devpilot-v1.0.0.apk';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.location.href = '/devpilot.apk';
    }
    setTimeout(() => setDownloadStarted(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div
        className={`relative w-full max-w-lg my-8 rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                {isBn ? 'Android ও মোবাইল অ্যাপ ইনস্টলেশন' : 'Install DevPilot on Android'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn
                  ? 'ওয়েব ও মোবাইল ডিভাইসে ইনস্টল করে যেকোনো সময় সহজে ব্যবহার করুন'
                  : 'Installable Progressive Web App (WebAPK) & Direct APK'}
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
          {/* Method 1: 1-Click Install WebAPK */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
                {isBn ? 'পদ্ধতি ১: ১-ক্লিক WebAPK ইনস্টল (রেকমেন্ডেড)' : 'Option 1: 1-Click WebAPK (Recommended)'}
              </span>
              <span className="text-[10px] bg-blue-200 dark:bg-blue-900 px-2 py-0.5 rounded-full font-bold uppercase">
                Instant
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {isBn
                ? 'ফোনের কোনো স্টোরেজ নষ্ট না করেই হোম স্ক্রিনে অফিসিয়াল নেটিভ অ্যাপের মতো যুক্ত হবে এবং অফলাইনে কাজ করবে।'
                : 'Installs directly to your home screen with zero storage bloat, instant launch, and offline caching.'}
            </p>

            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>
                {isInstalled
                  ? isBn
                    ? 'অ্যাপ ইতিমধ্যে ইনস্টল রয়েছে'
                    : 'App Already Installed'
                  : isBn
                  ? 'ডিভাইসে অ্যাপ ইনস্টল করুন'
                  : 'Install WebAPK Now'}
              </span>
            </button>
          </div>

          {/* Method 2: Direct APK Download */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isBn ? 'পদ্ধতি ২: সরাসরি APK ডাউনলোড (Android)' : 'Option 2: Direct Android APK (1.3 MB)'}
              </span>
              <span className="text-[10px] font-mono text-slate-500 font-bold">v1.0.0</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isBn
                ? 'সরাসরি প্যাকেজ করা Android APK ফাইল ডাউনলোড করে নিজের ফোনে ম্যানুয়ালি ইনস্টল করতে পারেন।'
                : 'Download standalone compiled Android package (.apk) for offline sideloading.'}
            </p>

            <button
              type="button"
              onClick={handleApkDownload}
              className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>
                {downloadStarted
                  ? isBn
                    ? 'ডাউনলোড শুরু হয়েছে...'
                    : 'Downloading APK...'
                  : isBn
                  ? 'APK ডাউনলোড করুন (1.3 MB)'
                  : 'Download DevPilot APK (1.3 MB)'}
              </span>
            </button>
          </div>

          {/* Quick Step Guide */}
          <div className="space-y-2 text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
              {isBn ? 'ইনস্টলেশন সহায়িকা' : 'Manual Install Steps'}
            </span>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  {isBn
                    ? 'গুগল ক্রোম বা স্যামসাং ব্রাউজারের উপরে ডানদিকের তিনটি ডট (⋮) মেন্যুতে চাপুন।'
                    : 'Tap Chrome or browser three dots (⋮) top right.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  {isBn
                    ? '"Install app" অথবা "Add to Home screen" নির্বাচন করুন।'
                    : 'Select "Install App" or "Add to Home screen".'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  {isBn
                    ? 'কনফার্ম করলেই আপনার ফোনের অ্যাপ ড্রয়ারে DevPilot আইকন দেখা যাবে।'
                    : 'Confirm and launch DevPilot directly like any native Android app.'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

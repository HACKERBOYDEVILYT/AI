import React, { useState } from 'react';
import {
  Code2,
  Globe,
  Moon,
  Sun,
  User,
  ShieldCheck,
  Menu,
  X,
  Smartphone,
  Sparkles,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { Language, ThemeMode, UserProfile } from '../../types/devpilot';
import { translations } from '../../locales/translations';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
  currentUser: UserProfile | null;
  activeView: 'landing' | 'services' | 'dashboard' | 'admin' | 'support';
  onNavigate: (view: 'landing' | 'services' | 'dashboard' | 'admin' | 'support') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAIDiagnostic: () => void;
  onOpenPWAInstall: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  theme,
  onThemeToggle,
  currentUser,
  activeView,
  onNavigate,
  onOpenAuth,
  onLogout,
  onOpenAIDiagnostic,
  onOpenPWAInstall,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[language];
  const isDark = theme === 'dark';

  const isAdmin = currentUser?.role === 'admin';

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-colors ${
        isDark
          ? 'bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-md'
          : 'bg-white/95 border-slate-200 text-slate-900 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              onNavigate('landing');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-blue-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight">DevPilot</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  Platform
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block truncate max-w-[200px]">
                {t.tagline}
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className={`px-3 py-2 rounded-lg transition-colors ${
              activeView === 'landing'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.nav.home}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('services')}
            className={`px-3 py-2 rounded-lg transition-colors ${
              activeView === 'services'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.nav.services}
          </button>

          <button
            type="button"
            onClick={onOpenAIDiagnostic}
            className="px-3 py-2 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors flex items-center gap-1.5 font-bold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t.nav.aiDiagnostic}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('support')}
            className={`px-3 py-2 rounded-lg transition-colors ${
              activeView === 'support'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.nav.contact}
          </button>

          {currentUser && (
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeView === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              {t.nav.customerDashboard}
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 border border-purple-200 dark:border-purple-800 ${
                activeView === 'admin'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 hover:bg-purple-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {t.nav.adminPanel}
            </button>
          )}
        </nav>

        {/* Right Action Island */}
        <div className="flex items-center gap-2">
          {/* PWA / App Install Trigger */}
          <button
            type="button"
            onClick={onOpenPWAInstall}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Install DevPilot Android App / PWA"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden lg:inline">{t.nav.installApp}</span>
            <span className="lg:hidden">App</span>
          </button>

          {/* Language Switcher */}
          <button
            type="button"
            onClick={() => onLanguageChange(language === 'bn' ? 'en' : 'bn')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Switch Language / ভাষা পরিবর্তন"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{language === 'bn' ? 'EN' : 'বাং'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onThemeToggle}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User Profile / Auth Button */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onNavigate(currentUser.role === 'admin' ? 'admin' : 'dashboard')}
                className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold hover:border-blue-400 transition"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="max-w-[90px] truncate hidden sm:inline">{currentUser.name}</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="p-2 text-slate-500 hover:text-red-600 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
                title={t.nav.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t.nav.login}</span>
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2 text-sm font-semibold shadow-xl">
          <button
            type="button"
            onClick={() => {
              onNavigate('landing');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {t.nav.home}
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigate('services');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {t.nav.services}
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenAIDiagnostic();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {t.nav.aiDiagnostic}
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigate('support');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {t.nav.contact}
          </button>

          {currentUser ? (
            <>
              <button
                type="button"
                onClick={() => {
                  onNavigate('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                {t.nav.customerDashboard}
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {t.nav.adminPanel}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {t.nav.logout}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="w-full text-center py-2.5 bg-blue-600 text-white rounded-lg mt-2"
            >
              {t.nav.login}
            </button>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onOpenPWAInstall();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5"
            >
              <Smartphone className="w-4 h-4" />
              {t.nav.installApp}
            </button>

            <span className="text-xs text-slate-400">
              {language === 'bn' ? 'বাংলা সংস্করণ' : 'English Edition'}
            </span>
          </div>
        </div>
      )}
    </header>
  );
};

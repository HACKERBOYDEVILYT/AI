import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { Language, ThemeMode, UserProfile } from '../../types/devpilot';
import { translations } from '../../locales/translations';
import { authenticateUser, SUPER_ADMIN_EMAIL } from '../../services/devpilotDb';

interface AuthModalProps {
  language: Language;
  theme: ThemeMode;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'register' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  language,
  theme,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const t = translations[language];
  const isDark = theme === 'dark';
  const isBn = language === 'bn';

  const [mode, setMode] = useState<'login' | 'register' | 'admin' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (mode === 'forgot') {
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg(isBn ? 'সঠিক ইমেইল এড্রেস প্রদান করুন।' : 'Please enter a valid email.');
        return;
      }
      setSuccessMsg(
        isBn
          ? `পাসওয়ার্ড রিকভারি নির্দেশনাবলী ${email} এ পাঠানো হয়েছে।`
          : `Password reset instructions sent to ${email}.`
      );
      return;
    }

    if (!email.trim()) {
      setErrorMsg(isBn ? 'ইমেইল বা ইউজারনেম আবশ্যক।' : 'Email or username is required.');
      return;
    }

    if (!password) {
      setErrorMsg(isBn ? 'পাসওয়ার্ড প্রদান করুন।' : 'Password is required.');
      return;
    }

    setSubmitting(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const isAdminAccount =
        mode === 'admin' ||
        trimmedEmail === SUPER_ADMIN_EMAIL.toLowerCase() ||
        trimmedEmail === 'robiul' ||
        trimmedEmail === 'robiul@devpilot.app' ||
        trimmedEmail === 'admin' ||
        trimmedEmail === 'admin@devpilot.app';

      if (isAdminAccount) {
        // Strict Admin Authentication: Requires password 'robiul1000'
        if (password !== 'robiul1000') {
          setSubmitting(false);
          setErrorMsg(
            isBn
              ? 'ভুল অ্যাডমিন পাসওয়ার্ড। অ্যাডমিন অ্যাক্সেসের জন্য সঠিক পাসওয়ার্ড (robiul1000) প্রদান করুন।'
              : 'Invalid admin password. Please enter the correct admin password (robiul1000).'
          );
          return;
        }

        const adminName =
          trimmedEmail.includes('robiul') ? 'Robiul (Platform Admin)' : 'Ayan Islam (Owner & Admin)';

        const adminUser = authenticateUser(
          trimmedEmail.includes('@') ? trimmedEmail : 'robiul@devpilot.app',
          adminName,
          'admin',
          'robiul1000'
        );

        setSubmitting(false);
        onAuthSuccess(adminUser);
        onClose();
        return;
      }

      // Customer Registration / Login
      if (mode === 'register') {
        if (!name.trim()) {
          setSubmitting(false);
          setErrorMsg(isBn ? 'আপনার নাম প্রদান করুন।' : 'Please enter your name.');
          return;
        }
        if (password.length < 6) {
          setSubmitting(false);
          setErrorMsg(isBn ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.');
          return;
        }
      }

      const displayName = name.trim() || email.split('@')[0];
      const user = authenticateUser(email.trim(), displayName, 'customer', password);

      setSubmitting(false);
      onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setSubmitting(false);
      setErrorMsg(err.message || String(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div
        className={`relative w-full max-w-md my-8 rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              {mode === 'admin' && (
                <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
              <span className="text-xl font-bold tracking-tight">
                {mode === 'admin'
                  ? isBn
                    ? 'গোপন অ্যাডমিন পোর্টাল'
                    : 'Confidential Admin Portal'
                  : mode === 'login'
                  ? isBn
                    ? 'গ্রাহক লগইন'
                    : 'Client Sign In'
                  : mode === 'register'
                  ? isBn
                    ? 'নতুন গ্রাহক একাউন্ট'
                    : 'Create Client Account'
                  : isBn
                  ? 'পাসওয়ার্ড পুনরুদ্ধার'
                  : 'Recover Password'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'admin'
                ? isBn
                  ? 'মালিকানা ও এজেন্সি পরিচালনার জন্য অ্যাডমিন পাসওয়ার্ড প্রদান করুন।'
                  : 'Restricted console. Requires admin authorization.'
                : mode === 'login'
                ? isBn
                  ? 'আপনার সার্ভিস অর্ডার ও ডেলিভারি দেখতে লগইন করুন।'
                  : 'Sign in to access your orders and deliverable source code.'
                : mode === 'register'
                ? isBn
                  ? 'সার্ভিস অর্ডার ও লাইভ ট্র্যাকিংয়ের জন্য রেজিস্টার করুন।'
                  : 'Register to place orders and track project milestones.'
                : isBn
                ? 'আপনার রেজিস্টার্ড ইমেইল প্রবেশ করান।'
                : 'Enter your registered email.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  {isBn ? 'আপনার পূর্ণ নাম' : 'Full Name'} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isBn ? 'যেমন: তানভীর আহমেদ' : 'Ex: Tanvir Ahmed'}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                {mode === 'admin'
                  ? isBn
                    ? 'অ্যাডমিন ইমেইল বা আইডি'
                    : 'Admin Email or ID'
                  : isBn
                  ? 'ইমেইল এড্রেস'
                  : 'Email Address'} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={mode === 'admin' ? 'text' : 'email'}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === 'admin' ? 'ayanislam10000@gmail.com / robiul' : 'name@example.com'}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    {mode === 'admin'
                      ? isBn
                        ? 'অ্যাডমিন পাসওয়ার্ড'
                        : 'Admin Password'
                      : isBn
                      ? 'পাসওয়ার্ড'
                      : 'Password'} *
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 rounded-xl text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 ${
                mode === 'admin'
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
              }`}
            >
              <span>
                {mode === 'admin'
                  ? isBn
                    ? 'অ্যাডমিন প্যানেলে প্রবেশ করুন'
                    : 'Access Admin Console'
                  : mode === 'login'
                  ? t.nav.login
                  : mode === 'register'
                  ? t.nav.register
                  : isBn
                  ? 'রিসেট লিংক পাঠান'
                  : 'Send Reset Link'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Toggle mode footer */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex items-center justify-between text-xs">
            {mode === 'admin' ? (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 font-medium"
              >
                <span>← {isBn ? 'গ্রাহক লগইনে ফিরে যান' : 'Back to Client Login'}</span>
              </button>
            ) : mode === 'login' ? (
              <p className="text-slate-500">
                {isBn ? 'নতুন ব্যবহারকারী?' : "New user?"}{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline ml-1"
                >
                  {isBn ? 'রেজিস্ট্রেশন করুন' : 'Register'}
                </button>
              </p>
            ) : (
              <p className="text-slate-500">
                {isBn ? 'ইতিমধ্যে একাউন্ট আছে?' : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline ml-1"
                >
                  {isBn ? 'লগইন করুন' : 'Sign In'}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

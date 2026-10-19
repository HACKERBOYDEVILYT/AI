import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MessageCircle,
  Send,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Language, ThemeMode } from '../../types/devpilot';
import { getPlatformSettings } from '../../services/devpilotDb';

interface ContactSectionProps {
  language: Language;
  theme: ThemeMode;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ language, theme }) => {
  const isDark = theme === 'dark';
  const isBn = language === 'bn';
  const settings = getPlatformSettings();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
    }, 1500);
  };

  const whatsappClean = settings.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <section id="contact-section" className="py-12 md:py-20 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300">
            <Mail className="w-3.5 h-3.5" />
            <span>{isBn ? 'সরাসরি যোগাযোগ' : 'Get In Touch'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {isBn ? 'যেকোনো প্রজেক্ট নিয়ে আলোচনা করুন' : 'Discuss Your Digital Project'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {isBn
              ? 'আমাদের ইঞ্জিনিয়ারিং টিম আপনার যেকোনো টেকনিক্যাল প্রশ্নের উত্তর দিতে প্রস্তুত।'
              : 'Direct communication channels for consultations and emergency technical triage.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Contact Card */}
          <div
            className={`p-6 sm:p-8 rounded-2xl border space-y-6 ${
              isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isBn ? 'সরাসরি যোগাযোগের ঠিকানা' : 'Communication Channels'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isBn
                  ? 'জরুরি বাগ ফিক্সিং বা কাস্টম প্রজেক্ট কনসাল্টেশনের জন্য সরাসরি হোয়াটসঅ্যাপে মেসেজ পাঠাতে পারেন।'
                  : 'For rapid turnaround bug patching or enterprise custom developments, connect via WhatsApp or email.'}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    {isBn ? 'অফিসিয়াল ইমেইল' : 'Support Email'}
                  </span>
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 transition"
                  >
                    {settings.contactEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    {isBn ? 'হটলাইন / মোবাইল' : 'Direct Helpline'}
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {settings.contactPhone}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    {isBn ? 'সাপোর্ট সময়' : 'Working Hours'}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {isBn ? 'সকাল ৯:০০ — রাত ১১:০০ (প্রতিদিন)' : '9:00 AM — 11:00 PM (Daily)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp CTA */}
            <div className="pt-2">
              <a
                href={`https://wa.me/${whatsappClean}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {isBn ? 'হোয়াটসঅ্যাপে সরাসরি কথা বলুন' : 'Instant WhatsApp Consultation'}
                </span>
              </a>
            </div>
          </div>

          {/* Right Inquiry Form */}
          <div
            className={`p-6 sm:p-8 rounded-2xl border ${
              isDark ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {isBn ? 'আপনার বার্তা সফলভাবে গৃহীত হয়েছে!' : 'Inquiry Received!'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {isBn
                    ? 'আমাদের একজন প্রতিনিধি দ্রুত আপনার ইমেইলে যোগাযোগ করবেন।'
                    : 'Our engineering lead will review your message and reply promptly.'}
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
                >
                  {isBn ? 'আরেকটি বার্তা পাঠান' : 'Send Another Message'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {isBn ? 'মেসেজ পাঠিয়ে প্রজেক্ট নিয়ে আলোচনা করুন' : 'Send Project Inquiry'}
                </h3>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                    {isBn ? 'আপনার নাম' : 'Your Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Tanvir Ahmed"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                    {isBn ? 'ইমেইল এড্রেস' : 'Email Address'} *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tanvir@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                    {isBn ? 'আপনার বার্তা বা প্রকল্পের বিষয়' : 'Project Message'} *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      isBn
                        ? 'আপনার ওয়েবসাইটের কী সমস্যা বা কী বানাতে চান লিখুন...'
                        : 'Describe your requirements or questions...'
                    }
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isBn ? 'বার্তা প্রেরণ করুন' : 'Send Inquiry Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

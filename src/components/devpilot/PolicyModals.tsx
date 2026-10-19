import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';
import { Language, ThemeMode } from '../../types/devpilot';

interface PolicyModalProps {
  language: Language;
  theme: ThemeMode;
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const PolicyModals: React.FC<PolicyModalProps> = ({
  language,
  theme,
  type,
  onClose,
}) => {
  if (!type) return null;

  const isDark = theme === 'dark';
  const isBn = language === 'bn';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div
        className={`relative w-full max-w-2xl my-8 rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {type === 'privacy' ? (
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            ) : (
              <FileText className="w-5 h-5 text-purple-600" />
            )}
            <h3 className="text-lg font-bold">
              {type === 'privacy'
                ? isBn
                  ? 'গোপনীয়তা নীতি (Privacy Policy)'
                  : 'Privacy Policy'
                : isBn
                ? 'সেবার শর্তাবলী (Terms of Service)'
                : 'Terms of Service'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-600 dark:text-slate-300 max-h-[65vh] overflow-y-auto leading-relaxed">
          {type === 'privacy' ? (
            isBn ? (
              <>
                <p>
                  <strong>১. তথ্যের গোপনীয়তা:</strong> DevPilot ক্লায়েন্টের প্রজেক্ট কোড, ডেটাবেস ক্রেডেনশিয়াল এবং ব্যক্তিগত যোগাযোগের তথ্যের সর্বোচ্চ সুরক্ষা বজায় রাখে। কোনো থার্ড পার্টির সাথে আপনার ডেটা বা প্রজেক্ট ফাইল শেয়ার করা হয় না।
                </p>
                <p>
                  <strong>২. পেমেন্ট ভেরিফিকেশন:</strong> বিকাশ, নগদ ও ব্যাংকের মাধ্যমে প্রেরিত ট্রানজেকশন আইডি শুধুমাত্র পেমেন্ট কনফার্মেশনের জন্য অ্যাডমিন প্যানেলে যাচাই করা হয়। কোনো গোপন পিন বা পাসওয়ার্ড কখনোই চাওয়া হয় না।
                </p>
                <p>
                  <strong>৩. ডেটা সংরক্ষণ:</strong> প্রজেক্ট ডেলিভারি ও রিকোয়েস্ট ফাইলগুলো এনক্রিপ্টেড ক্লাউড স্টোরেজে ক্লায়েন্টের ড্যাশবোর্ডে নিরাপদে অ্যাক্সেসযোগ্য থাকে।
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong>1. Data Confidentiality:</strong> DevPilot maintains rigorous zero-trust confidentiality over your source repositories, credentials, and business specifications.
                </p>
                <p>
                  <strong>2. Payment Integrity:</strong> Transaction identifiers submitted for bKash, Nagad, and Bank wires are verified solely for invoice settlement. We never request private PINs.
                </p>
                <p>
                  <strong>3. Deliverable Security:</strong> Project deliverables and revisions are isolated per client session with encrypted access tokens.
                </p>
              </>
            )
          ) : isBn ? (
            <>
              <p>
                <strong>১. কাজের পরিধি ও কোটেশন:</strong> ফিক্সড সার্ভিসের ক্ষেত্রে প্রদর্শিত ফিচারসমূহ অন্তর্ভুক্ত থাকবে। কাস্টম কাজের ক্ষেত্রে প্রদত্ত কোটেশন অনুমোদনের পর কাজ শুরু হবে।
              </p>
              <p>
                <strong>২. ডেলিভারি ও রিভিশন:</strong> প্রতিটি সার্ভিসের জন্য নির্ধারিত সময়সীমার মধ্যে প্রজেক্ট সরবরাহ করা হবে। ক্লায়েন্ট অসন্তুষ্ট হলে ৩ দিনের মধ্যে ফ্রি রিভিশন সুবিধা পাবেন।
              </p>
              <p>
                <strong>৩. দায়বদ্ধতা:</strong> কোড ডেলিভারির পর গ্রাহকের নিজস্ব হোস্টিং বা সার্ভারে থার্ড-পার্টি পরিবর্তন দ্বারা সৃষ্ট সমস্যার জন্য অতিরিক্ত মেইন্টেন্যান্স ফি প্রযোজ্য হতে পারে।
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>1. Scope of Work:</strong> Fixed offerings include listed features. Custom scopes proceed upon mutual quote confirmation.
              </p>
              <p>
                <strong>2. Free Revisions:</strong> Clients receive a 3-day post-delivery warranty window for revisions adhering to the original brief.
              </p>
              <p>
                <strong>3. Service Continuity:</strong> Production verification is completed upon deployment; ongoing retainer maintenance is available on request.
              </p>
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-850">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
          >
            {isBn ? 'বুঝেছি' : 'Understood'}
          </button>
        </div>
      </div>
    </div>
  );
};

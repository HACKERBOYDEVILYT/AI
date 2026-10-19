import React, { useState } from 'react';
import { Check, Copy, Download, ExternalLink, FileCode, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onOpenWorkflowsTab?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ onOpenWorkflowsTab }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [repoName, setRepoName] = useState(() => {
    return localStorage.getItem('lifegraph_github_repo') || 'ayanislam10000/lifegraph-finops';
  });

  const handleSaveRepo = (val: string) => {
    setRepoName(val);
    localStorage.setItem('lifegraph_github_repo', val);
  };

  const cleanRepo = repoName.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
  const githubReleaseUrl = `https://github.com/${cleanRepo}/releases`;
  const githubActionsUrl = `https://github.com/${cleanRepo}/actions`;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (isInstallable) {
            install();
          } else {
            setShowInstallModal(true);
          }
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
      >
        <Smartphone className="h-3.5 w-3.5" />
        {isInstalled ? 'App / APK Info' : 'Install App / APK'}
      </button>

      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-slate-900" />
                <h3 className="text-base font-semibold text-slate-900">
                  Install LIFEGRAPH App &amp; Android APK
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                className="text-slate-500 hover:text-slate-900"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              {/* Method 1: Instant 1-Click PWA / WebAPK Install */}
              <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Smartphone className="h-4 w-4 text-emerald-700" />
                    উপায় ১: এক ক্লিকে WebAPK ইন্সটল (সবচেয়ে সুবিধাজনক)
                  </p>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    WebAPK
                  </span>
                </div>
                <p className="text-emerald-950 text-xs leading-relaxed">
                  Android Chrome / Edge থেকে সরাসরি আপনার ফোনের হোম স্ক্রিনে নেটিভ অ্যাপ আকারে যোগ করুন। কোনো আননোন সোর্স অনুমতি লাগবে না এবং অ্যাপ ড্রয়ারে আইকন তৈরি হবে।
                </p>
                {isInstallable ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await install();
                      setShowInstallModal(false);
                    }}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-700 rounded-md hover:bg-emerald-800 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <Smartphone className="h-4 w-4" />
                    Install App on Device Now (WebAPK)
                  </button>
                ) : isIOS ? (
                  <p className="text-[11px] text-emerald-900 bg-white/70 p-2.5 rounded border border-emerald-200">
                    iPhone / iPad-এ: Safari ব্রাউজারের নিচে <strong>Share</strong> আইকনে চাপ দিয়ে <strong>Add to Home Screen</strong> সিলেক্ট করুন।
                  </p>
                ) : (
                  <p className="text-[11px] text-emerald-900 bg-white/70 p-2.5 rounded border border-emerald-200">
                    ব্রাউজারের ৩-ডট মেনু (<strong>⋮</strong>) চাপ দিয়ে <strong>&ldquo;Install App&rdquo;</strong> বা <strong>&ldquo;Add to Home screen&rdquo;</strong> সিলেক্ট করলেই অ্যাপ তৈরি হয়ে যাবে।
                  </p>
                )}
              </div>

              {/* Method 2: Direct APK Download */}
              <div className="p-4 rounded-md bg-blue-50 border border-blue-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-blue-950 flex items-center gap-1.5">
                    <Download className="h-4 w-4 text-blue-700" />
                    উপায় ২: সরাসরি Android APK ফাইল ডাউনলোড
                  </p>
                  <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    Direct APK
                  </span>
                </div>
                <p className="text-blue-900 leading-relaxed text-xs">
                  সার্ভার থেকে সরাসরি তৈরি করা <strong className="font-mono">lifegraph-finops-v1.0.0.apk</strong> (1.3 MB) প্যাকেজটি ডাউনলোড করুন। সরাসরি ডাউনলোড শুরু করতে নিচের বাটনে চাপ দিন:
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <a
                    href="/lifegraph-finops.apk"
                    target="_blank"
                    rel="noopener noreferrer"
                    download="lifegraph-finops-v1.0.0.apk"
                    className="inline-flex items-center justify-center gap-2 flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors shadow-sm text-center"
                  >
                    <Download className="h-4 w-4 shrink-0" />
                    Download APK (1.3 MB)
                  </a>
                  <a
                    href="/lifegraph-finops-release.zip"
                    target="_blank"
                    rel="noopener noreferrer"
                    download="lifegraph-finops-release.zip"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-blue-900 bg-blue-100 hover:bg-blue-200 border border-blue-200 rounded-md transition-colors text-center"
                  >
                    <FileCode className="h-3.5 w-3.5 text-blue-700 shrink-0" />
                    সম্পূর্ণ রিলিজ প্যাকেজ (.ZIP 3.0 MB)
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const downloadUrl = window.location.origin + '/lifegraph-finops.apk';
                      navigator.clipboard.writeText(downloadUrl);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2500);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                        লিংক কপি হয়েছে!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 shrink-0" />
                        APK লিংক
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Method 3: GitHub Actions & Releases Compiled APK */}
              <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900">
                    উপায় ৩: GitHub Actions CI/CD অটো-রিলিজ
                  </p>
                  <span className="text-[10px] font-medium bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                    CI/CD Release
                  </span>
                </div>
                <p>
                  প্রজেক্টটি GitHub-এ এক্সপোর্ট/পুশ করলে <span className="font-mono text-slate-900 font-semibold">.github/workflows/release.yml</span> স্বয়ংক্রিয়ভাবে Gradle ও Java 21 দিয়ে ফ্রেশ রিলিজ বিল্ড করে এবং আপনার রিপোজিটরির Releases ট্যাবে যোগ করে।
                </p>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-medium text-slate-700">
                    আপনার GitHub Repo (username/repo):
                  </label>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => handleSaveRepo(e.target.value)}
                    placeholder="e.g. ayanislam10000/lifegraph"
                    className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs font-mono text-slate-900"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={githubReleaseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    GitHub Releases পৃষ্ঠা
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  <a
                    href={githubActionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                  >
                    GitHub Actions Artifacts
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  {onOpenWorkflowsTab && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowInstallModal(false);
                        onOpenWorkflowsTab();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200"
                    >
                      <FileCode className="h-3.5 w-3.5" />
                      Workflows গাইড
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

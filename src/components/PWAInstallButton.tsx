import React, { useState } from 'react';
import { Download, ExternalLink, FileCode, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onOpenWorkflowsTab?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ onOpenWorkflowsTab }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
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
              {/* Method 1: Instant 1-Click Install on Android & Desktop */}
              <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-emerald-900">
                    উপায় ১: সরাসরি ইন্সটল (APK ডাউনলোড ঝামেলা ছাড়াই)
                  </p>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    সুপারিশকৃত
                  </span>
                </div>
                <p className="text-emerald-950">
                  Android Chrome / Edge ব্রাউজার থেকে সরাসরি আপনার মোবাইলের হোম স্ক্রিনে অ্যাপ আকারে ইন্সটল করে নিন। কোনো আননোন সোর্স পারমিশন লাগবে না।
                </p>
                {isInstallable ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await install();
                      setShowInstallModal(false);
                    }}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-700 rounded-md hover:bg-emerald-800 transition-colors"
                  >
                    Install App on Mobile / Desktop
                  </button>
                ) : isIOS ? (
                  <p className="text-[11px] text-emerald-900">
                    iPhone / iPad-এ: Safari ব্রাউজারের নিচে <strong>Share</strong> আইকনে চাপ দিয়ে <strong>Add to Home Screen</strong> সিলেক্ট করুন।
                  </p>
                ) : (
                  <p className="text-[11px] text-emerald-900">
                    Chrome মেনু (<strong>⋮</strong>) খুলে <strong>&ldquo;Install App&rdquo;</strong> বা <strong>&ldquo;Add to Home screen&rdquo;</strong> সিলেক্ট করুন।
                  </p>
                )}
              </div>

              {/* Method 2: GitHub Actions & Releases Compiled APK */}
              <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-3">
                <p className="font-bold text-slate-900">
                  উপায় ২: GitHub Releases ও Actions থেকে APK ডাউনলোড
                </p>
                <p>
                  আপনার রিপোজিটরিতে কোড পুশ করলে <span className="font-mono text-slate-900 font-semibold">release.yml</span> স্বয়ংক্রিয়ভাবে <span className="font-mono text-slate-900 font-semibold">lifegraph-finops-v1.0.0.apk</span> বিল্ড করে GitHub-এ যুক্ত করে।
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    GitHub Releases-এ APK দেখুন
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
                      Workflows সেটিংস গাইড
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

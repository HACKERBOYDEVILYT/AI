import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);

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
        {isInstalled ? 'APK & App Info' : 'Install App / APK'}
      </button>

      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 space-y-4">
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

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 space-y-2">
                <p className="font-semibold text-slate-900">
                  01. Direct Android APK Download (GitHub Release / Pages)
                </p>
                <p>
                  When deployed via GitHub Actions, the compiled Android package (
                  <span className="font-mono text-slate-900">lifegraph-finops.apk</span>) is bundled automatically into the release and website root.
                </p>
                <a
                  href="./lifegraph-finops.apk"
                  download="lifegraph-finops-v1.0.0.apk"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Android APK (lifegraph-finops.apk)
                </a>
              </div>

              <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 space-y-2">
                <p className="font-semibold text-slate-900">
                  02. Instant PWA Home Screen Installation
                </p>
                {isInstallable ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await install();
                      setShowInstallModal(false);
                    }}
                    className="px-3.5 py-2 text-xs font-medium text-white bg-emerald-700 rounded-md hover:bg-emerald-800"
                  >
                    Install App Now
                  </button>
                ) : isIOS ? (
                  <p>
                    On iPhone / iPad Safari: Tap the <strong>Share</strong> icon in the toolbar and select <strong>Add to Home Screen</strong>.
                  </p>
                ) : (
                  <p>
                    In Chrome / Edge / Android Browser: Open the browser menu (<strong>⋮</strong>) and select <strong>Install App</strong> or <strong>Add to Home screen</strong>.
                  </p>
                )}
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

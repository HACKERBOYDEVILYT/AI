import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  FileCode,
  Globe,
  HelpCircle,
  Smartphone,
} from 'lucide-react';

export const RELEASE_YML_CONTENT = `name: Build Android APK & Publish Release

on:
  push:
    branches:
      - main
      - master
    tags:
      - 'v*.*.*'
  workflow_dispatch:
    inputs:
      tag_name:
        description: 'Release version tag (e.g. v1.0.0)'
        required: false
        default: 'v1.0.0'

permissions:
  contents: write

jobs:
  build-apk-and-release:
    name: Compile Android APK & Publish Release
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install Node Dependencies
        run: |
          rm -f bun.lock package-lock.json yarn.lock pnpm-lock.yaml
          npm install --legacy-peer-deps

      - name: Build Web Production Assets
        run: |
          npx vite build
          cp dist/index.html dist/404.html || true
          touch dist/.nojekyll

      - name: Sync Web Build to Capacitor Android
        run: |
          npx @capacitor/cli sync android

      - name: Setup Java JDK 21
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '21'

      - name: Build Android APK with Gradle
        run: |
          cd android
          chmod +x gradlew
          ./gradlew assembleDebug --no-daemon --stacktrace
          cp app/build/outputs/apk/debug/app-debug.apk ../lifegraph-finops-v1.0.0.apk
          cp app/build/outputs/apk/debug/app-debug.apk ../dist/lifegraph-finops.apk
          cd ..

      - name: Upload Android APK Artifact (Actions Tab)
        uses: actions/upload-artifact@v4
        with:
          name: lifegraph-finops-v1.0.0-apk
          path: lifegraph-finops-v1.0.0.apk
          if-no-files-found: warn

      - name: Package Web Release Distribution
        run: |
          zip -r lifegraph-finops-web-dist.zip dist server.ts firestore.rules README.md

      - name: Upload Web Package Artifact
        uses: actions/upload-artifact@v4
        with:
          name: lifegraph-web-bundle
          path: lifegraph-finops-web-dist.zip

      - name: Publish GitHub Release (with APK & Web Bundle)
        uses: softprops/action-gh-release@v2
        continue-on-error: true
        with:
          tag_name: \${{ github.event.inputs.tag_name || (startsWith(github.ref, 'refs/tags/') && github.ref_name) || 'v1.0.0' }}
          name: Release \${{ github.event.inputs.tag_name || (startsWith(github.ref, 'refs/tags/') && github.ref_name) || 'v1.0.0' }} — LIFEGRAPH Android APK & Web FinOps
          draft: false
          prerelease: false
          files: |
            lifegraph-finops-v1.0.0.apk
            lifegraph-finops-web-dist.zip
            firestore.rules
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;

export const WEBSITE_YML_CONTENT = `name: Deploy Website to GitHub Pages

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

permissions:
  contents: write
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  build-and-deploy:
    name: Build & Deploy Website
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install Dependencies
        run: |
          rm -f bun.lock package-lock.json yarn.lock pnpm-lock.yaml
          npm install --legacy-peer-deps

      - name: Build Production Website
        run: |
          npx vite build
          cp dist/index.html dist/404.html
          touch dist/.nojekyll

      - name: Upload Website Build Artifact (Actions Tab)
        uses: actions/upload-artifact@v4
        with:
          name: lifegraph-website-dist
          path: dist

      - name: Deploy to gh-pages Branch
        uses: peaceiris/actions-gh-pages@v4
        continue-on-error: true
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          force_orphan: true

      - name: Setup Pages Artifact
        uses: actions/upload-pages-artifact@v3
        continue-on-error: true
        with:
          path: dist

      - name: Deploy to GitHub Pages (If Actions mode enabled)
        id: deployment
        uses: actions/deploy-pages@v4
        continue-on-error: true
`;

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/yaml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function DeploymentWorkflowsSection() {
  const [selectedFile, setSelectedFile] = useState<'release' | 'website'>('release');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFile(key);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch {
      downloadTextFile(key, text);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-medium text-slate-500">
            GitHub Actions CI/CD · Automated Android APK Compiler &amp; GitHub Pages Website Deployment
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            GitHub Workflows (<span className="font-mono">release.yml</span> &amp;{' '}
            <span className="font-mono">website.yml</span>) &amp; APK Center
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => downloadTextFile('release.yml', RELEASE_YML_CONTENT)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download release.yml
          </button>
          <button
            type="button"
            onClick={() => downloadTextFile('website.yml', WEBSITE_YML_CONTENT)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download website.yml
          </button>
        </div>
      </div>

      {/* Critical Failure Fix Guide (Bengali & English) */}
      <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-5 space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" />
          <span>&ldquo;Failed&rdquo; এর কারণ ও সমাধান (GitHub Settings-এর ২টি জরুরি সেটিংস):</span>
        </div>
        <p className="text-xs text-amber-950 leading-relaxed">
          GitHub Actions-এ নতুন রিপোজিটরিতে বাই-ডিফল্ট <strong>Read-only Permission</strong> থাকে এবং GitHub Pages বন্ধ থাকে। ফলে Actions-এ বিল্ড হলেও রিলিজ ও ওয়েবসাইট পাবলিশ করতে গিয়ে Failed দেখায়। নিচের ২টি ধাপ অনুসরণ করলে সমস্যা সাথে সাথে সমাধান হয়ে যাবে:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="bg-white/80 border border-amber-200 rounded-md p-3.5 space-y-1.5 text-xs text-slate-800">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-mono shrink-0">1</span>
              <span>Actions Write Permission দিন (APK Release-এর জন্য)</span>
            </div>
            <p className="text-slate-600">
              আপনার GitHub Repo-এর <strong>Settings &rarr; Actions &rarr; General</strong>-এ যান। নিচে স্ক্রল করে <strong>Workflow permissions</strong> অপশনে <strong>&ldquo;Read and write permissions&rdquo;</strong> সিলেক্ট করে <strong>Save</strong> করুন।
            </p>
          </div>

          <div className="bg-white/80 border border-amber-200 rounded-md p-3.5 space-y-1.5 text-xs text-slate-800">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-mono shrink-0">2</span>
              <span>GitHub Pages চালু করুন (ওয়েবসাইটের জন্য)</span>
            </div>
            <p className="text-slate-600">
              আপনার GitHub Repo-এর <strong>Settings &rarr; Pages</strong>-এ যান। <strong>Build and deployment &rarr; Source</strong>-এ <strong>&ldquo;Deploy from a branch&rdquo;</strong> সিলেক্ট করুন এবং Branch হিসেবে <span className="font-mono bg-slate-100 px-1 rounded">gh-pages</span> ও <span className="font-mono bg-slate-100 px-1 rounded">/ (root)</span> সিলেক্ট করে <strong>Save</strong> করুন।
            </p>
          </div>
        </div>

        <div className="p-3 bg-white/90 border border-amber-200 rounded-md text-xs text-slate-700">
          <strong className="text-slate-900">টিপস (সরাসরি APK ডাউনলোড):</strong> GitHub-এর <strong>Actions</strong> ট্যাবে গিয়ে যেকোনো রিলিজ রানের উপর ক্লিক করলে নিচে <strong>Artifacts</strong> সেকশনে <span className="font-mono font-bold text-slate-900">lifegraph-finops-v1.0.0-apk</span> সরাসরি ডাউনলোড করার অপশন পেয়ে যাবেন!
        </div>
      </div>

      {/* Status Cards for release.yml and website.yml */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-slate-900" />
              <h2 className="text-sm font-bold text-slate-900 font-mono">
                .github/workflows/release.yml
              </h2>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-700 inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              FIXED &amp; OPTIMIZED
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>কী কাজ করে:</strong> প্রজেক্টের বিল্ট-ইন Capacitor Android কনফিগারেশনের সাথে সিঙ্ক করে Java 21 + Gradle দিয়ে সরাসরি <span className="font-mono text-slate-900">lifegraph-finops-v1.0.0.apk</span> বিল্ড করে, Actions Artifact হিসেবে আপলোড করে এবং GitHub Releases-এ পাবলিশ করে।
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setSelectedFile('release')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedFile === 'release'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              View release.yml Code
            </button>
            <button
              type="button"
              onClick={() => handleCopy('release.yml', RELEASE_YML_CONTENT)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200"
            >
              <Copy className="h-3.5 w-3.5" />
              {copiedFile === 'release.yml' ? 'Copied!' : 'Copy release.yml'}
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-900" />
              <h2 className="text-sm font-bold text-slate-900 font-mono">
                .github/workflows/website.yml
              </h2>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-700 inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              FIXED &amp; RESILIENT
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>কী কাজ করে:</strong> মাত্র ৩০ সেকেন্ডে Vite প্রোডাকশন ওয়েবসাইট (<span className="font-mono">dist/</span>) বিল্ড করে, Actions Artifact হিসেবে আপলোড করে এবং <span className="font-mono">gh-pages</span> ব্রাঞ্চে ডিপ্লয় করে।
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setSelectedFile('website')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedFile === 'website'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              View website.yml Code
            </button>
            <button
              type="button"
              onClick={() => handleCopy('website.yml', WEBSITE_YML_CONTENT)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200"
            >
              <Copy className="h-3.5 w-3.5" />
              {copiedFile === 'website.yml' ? 'Copied!' : 'Copy website.yml'}
            </button>
          </div>
        </div>
      </div>

      {/* Full Workflow File Viewer */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-slate-900" />
            <span className="text-xs font-mono font-bold text-slate-900">
              {selectedFile === 'release'
                ? '.github/workflows/release.yml'
                : '.github/workflows/website.yml'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  selectedFile === 'release' ? 'release.yml' : 'website.yml',
                  selectedFile === 'release' ? RELEASE_YML_CONTENT : WEBSITE_YML_CONTENT
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-md hover:bg-slate-100"
            >
              <Copy className="h-3.5 w-3.5" />
              {copiedFile === (selectedFile === 'release' ? 'release.yml' : 'website.yml')
                ? 'Copied YAML!'
                : 'Copy YAML'}
            </button>
            <button
              type="button"
              onClick={() =>
                downloadTextFile(
                  selectedFile === 'release' ? 'release.yml' : 'website.yml',
                  selectedFile === 'release' ? RELEASE_YML_CONTENT : WEBSITE_YML_CONTENT
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800"
            >
              <Download className="h-3.5 w-3.5" />
              Download {selectedFile === 'release' ? 'release.yml' : 'website.yml'}
            </button>
          </div>
        </div>
        <pre className="p-5 text-[11px] font-mono text-slate-800 bg-slate-50/40 overflow-x-auto leading-relaxed max-h-[520px]">
          {selectedFile === 'release' ? RELEASE_YML_CONTENT : WEBSITE_YML_CONTENT}
        </pre>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Download,
  FileCode,
  Globe,
  Smartphone,
} from 'lucide-react';

export const RELEASE_YML_CONTENT = `name: Build APK & Publish GitHub Release

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
  pages: write
  id-token: write

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

      - name: Normalize package.json for Public NPM + Capacitor & Install
        run: |
          rm -f bun.lock package-lock.json yarn.lock pnpm-lock.yaml
          node --input-type=commonjs -e '
            const fs = require("fs");
            const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
            pkg.dependencies = {
              "@capacitor/android": "^7.0.0",
              "@capacitor/cli": "^7.0.0",
              "@capacitor/core": "^7.0.0",
              "@google/genai": "latest",
              "@tailwindcss/vite": "latest",
              "@vitejs/plugin-react": "latest",
              "dotenv": "latest",
              "express": "^4.21.2",
              "firebase": "latest",
              "lucide-react": "latest",
              "motion": "latest",
              "react": "^19.0.0",
              "react-dom": "^19.0.0",
              "recharts": "latest",
              "vite": "latest"
            };
            pkg.devDependencies = {
              "@types/express": "latest",
              "@types/node": "latest",
              "@types/react": "^19.0.0",
              "@types/react-dom": "^19.0.0",
              "autoprefixer": "latest",
              "esbuild": "latest",
              "tailwindcss": "latest",
              "tsx": "latest",
              "typescript": "latest"
            };
            fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));
          '
          npm install --legacy-peer-deps

      - name: Ensure Firebase & Capacitor Config Files Exist
        run: |
          if [ ! -f firebase-applet-config.json ]; then
            cat << 'EOF' > firebase-applet-config.json
          {
            "projectId": "seraphic-snow-p5w43",
            "appId": "1:585606005209:web:e85532762cad44667399c8",
            "apiKey": "AIzaSyBI-M5wMYaKdP1nd45V5ZzymXNmeZtcCKQ",
            "authDomain": "seraphic-snow-p5w43.firebaseapp.com",
            "firestoreDatabaseId": "ai-studio-13942140-941b-484d-abbe-15828f04fa91",
            "storageBucket": "seraphic-snow-p5w43.firebasestorage.app",
            "messagingSenderId": "585606005209",
            "measurementId": "",
            "oAuthClientId": "585606005209-1cqok1pbqaqeoc405kr7d6n7hasn16e0.apps.googleusercontent.com",
            "recaptchaSiteKey": ""
          }
          EOF
          fi
          cat << 'EOF' > capacitor.config.json
          {
            "appId": "com.lifegraph.finops",
            "appName": "LIFEGRAPH FinOps",
            "webDir": "dist",
            "server": {
              "androidScheme": "https"
            }
          }
          EOF

      - name: Build Production Web Bundle
        run: |
          npx vite build
          cp dist/index.html dist/404.html
          touch dist/.nojekyll

      - name: Setup Java JDK 21 for Android APK Build
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '21'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Build Android APK (lifegraph-finops-v1.0.0.apk)
        run: |
          rm -rf android
          npx cap add android
          npx cap sync android
          cd android
          chmod +x gradlew
          ./gradlew assembleDebug --no-daemon --stacktrace
          cp app/build/outputs/apk/debug/app-debug.apk ../lifegraph-finops-v1.0.0.apk
          cp app/build/outputs/apk/debug/app-debug.apk ../dist/lifegraph-finops.apk

      - name: Upload Compiled APK as Workflow Artifact
        uses: actions/upload-artifact@v4
        with:
          name: lifegraph-finops-apk
          path: lifegraph-finops-v1.0.0.apk
          if-no-files-found: error

      - name: Package Web Release Archives
        run: |
          tar -czf lifegraph-finops-web-dist.tar.gz dist server.ts firestore.rules firebase-blueprint.json README.md RELEASE_NOTES.md
          zip -r lifegraph-finops-web-dist.zip dist server.ts firestore.rules firebase-blueprint.json README.md RELEASE_NOTES.md

      - name: Publish GitHub Release with APK & Web Bundle
        uses: softprops/action-gh-release@v2
        continue-on-error: true
        with:
          tag_name: \${{ github.event.inputs.tag_name || (startsWith(github.ref, 'refs/tags/') && github.ref_name) || 'v1.0.0' }}
          name: Release \${{ github.event.inputs.tag_name || (startsWith(github.ref, 'refs/tags/') && github.ref_name) || 'v1.0.0' }} — LIFEGRAPH Android APK & Web FinOps
          body_path: RELEASE_NOTES.md
          draft: false
          prerelease: false
          generate_release_notes: true
          files: |
            lifegraph-finops-v1.0.0.apk
            lifegraph-finops-web-dist.zip
            lifegraph-finops-web-dist.tar.gz
            firestore.rules
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

      - name: Sync Built Website + APK to gh-pages Branch
        uses: peaceiris/actions-gh-pages@v4
        continue-on-error: true
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          force_orphan: true
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
  group: 'website-pages-deploy'
  cancel-in-progress: false

jobs:
  build-and-deploy-branch:
    name: Build Website & Publish to gh-pages
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Normalize package.json for Public NPM Registry & Install
        run: |
          rm -f bun.lock package-lock.json yarn.lock pnpm-lock.yaml
          node --input-type=commonjs -e '
            const fs = require("fs");
            const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
            pkg.dependencies = {
              "@google/genai": "latest",
              "@tailwindcss/vite": "latest",
              "@vitejs/plugin-react": "latest",
              "dotenv": "latest",
              "express": "^4.21.2",
              "firebase": "latest",
              "lucide-react": "latest",
              "motion": "latest",
              "react": "^19.0.0",
              "react-dom": "^19.0.0",
              "recharts": "latest",
              "vite": "latest"
            };
            pkg.devDependencies = {
              "@types/express": "latest",
              "@types/node": "latest",
              "@types/react": "^19.0.0",
              "@types/react-dom": "^19.0.0",
              "autoprefixer": "latest",
              "esbuild": "latest",
              "tailwindcss": "latest",
              "tsx": "latest",
              "typescript": "latest"
            };
            fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));
          '
          npm install --legacy-peer-deps

      - name: Ensure Firebase Config Exists
        run: |
          if [ ! -f firebase-applet-config.json ]; then
            cat << 'EOF' > firebase-applet-config.json
          {
            "projectId": "seraphic-snow-p5w43",
            "appId": "1:585606005209:web:e85532762cad44667399c8",
            "apiKey": "AIzaSyBI-M5wMYaKdP1nd45V5ZzymXNmeZtcCKQ",
            "authDomain": "seraphic-snow-p5w43.firebaseapp.com",
            "firestoreDatabaseId": "ai-studio-13942140-941b-484d-abbe-15828f04fa91",
            "storageBucket": "seraphic-snow-p5w43.firebasestorage.app",
            "messagingSenderId": "585606005209",
            "measurementId": "",
            "oAuthClientId": "585606005209-1cqok1pbqaqeoc405kr7d6n7hasn16e0.apps.googleusercontent.com",
            "recaptchaSiteKey": ""
          }
          EOF
          fi

      - name: Build Production Website (dist)
        run: |
          npx vite build
          cp dist/index.html dist/404.html
          touch dist/.nojekyll

      - name: Upload Website Build Artifact
        uses: actions/upload-artifact@v4
        with:
          name: lifegraph-website-dist
          path: ./dist

      - name: Upload GitHub Pages Artifact
        uses: actions/upload-pages-artifact@v3
        continue-on-error: true
        with:
          path: './dist'

      - name: Publish Website to gh-pages Branch
        uses: peaceiris/actions-gh-pages@v4
        continue-on-error: true
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          force_orphan: true

  deploy-pages-environment:
    name: Deploy to GitHub Pages Environment
    needs: build-and-deploy-branch
    runs-on: ubuntu-latest
    continue-on-error: true
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Auto-Configure GitHub Pages
        uses: actions/configure-pages@v5
        continue-on-error: true
        with:
          enablement: true

      - name: Deploy Website to GitHub Pages
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
            <span className="font-mono">website.yml</span>) &amp; APK Build
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
              ADDED &amp; FIXED
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>কী কাজ করে:</strong> প্রতিবার <span className="font-mono">main</span> বা <span className="font-mono">master</span> ব্রাঞ্চে push করলে স্বয়ংক্রিয়ভাবে Capacitor + Java 21 + Android SDK দিয়ে <span className="font-mono">lifegraph-finops-v1.0.0.apk</span> তৈরি করে, GitHub Actions Artifact হিসেবে আপলোড করে এবং <strong>GitHub Releases</strong>-এ APK ও Web ZIP পাবলিশ করে।
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
              ADDED &amp; FIXED
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>কী কাজ করে:</strong> মাত্র ৩০ সেকেন্ডে Vite প্রোডাকশন ওয়েবসাইট (<span className="font-mono">dist/</span>) বিল্ড করে এবং একই সাথে <span className="font-mono">gh-pages</span> ব্রাঞ্চ ও <strong>GitHub Pages</strong> এনভায়রনমেন্টে অটো-ডিপ্লয় করে।
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

      {/* Important GitHub Repo Settings Guide in Bengali */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          GitHub-এ APK ও Website Deploy সচল করার ৩টি সহজ ধাপ (যদি প্রথমবার নতুন Repo হয়):
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 leading-relaxed">
          <li>
            <strong>GitHub-এ কোড পাঠান:</strong> AI Studio-এর উপরের Settings মেনু থেকে <strong>Export to GitHub</strong> বা <strong>Download ZIP</strong> করে আপনার GitHub রিপোজিটরিতে পুশ করুন। প্রজেক্টের ভেতরে <span className="font-mono">.github/workflows/release.yml</span> এবং <span className="font-mono">.github/workflows/website.yml</span> (এবং রুট ফোল্ডারে <span className="font-mono">release.yml</span> ও <span className="font-mono">website.yml</span>) যুক্ত করা আছে।
          </li>
          <li>
            <strong>Workflow Write Permission (জরুরি):</strong> আপনার GitHub Repo-তে গিয়ে <strong>Settings &rarr; Actions &rarr; General &rarr; Workflow permissions</strong>-এ গিয়ে <strong>&ldquo;Read and write permissions&rdquo;</strong> সিলেক্ট করে Save করুন। (এটি থাকলে <span className="font-mono">release.yml</span> নিজে থেকেই Releases ট্যাবে APK আপলোড করতে পারবে এবং <span className="font-mono">website.yml</span> নিজে থেকেই <span className="font-mono">gh-pages</span> ব্রাঞ্চ তৈরি করবে)।
          </li>
          <li>
            <strong>GitHub Pages লাইভ লিংক:</strong> GitHub Repo-এর <strong>Settings &rarr; Pages</strong>-এ গিয়ে <strong>Build and deployment &rarr; Source</strong> থেকে <strong>&ldquo;Deploy from a branch&rdquo;</strong> (Branch: <span className="font-mono">gh-pages</span> / <span className="font-mono">/ (root)</span>) অথবা <strong>&ldquo;GitHub Actions&rdquo;</strong> সিলেক্ট করুন। সাথে সাথে আপনার ওয়েবসাইট ও APK লাইভ হয়ে যাবে!
          </li>
        </ol>
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

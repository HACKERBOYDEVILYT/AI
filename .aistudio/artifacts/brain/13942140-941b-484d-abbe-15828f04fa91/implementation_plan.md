# LIFEGRAPH FinOps — Web Recovery & Android Mobile App Release Plan

A comprehensive architectural plan to guarantee instant, zero-delay website startup with fail-safe local store recovery, eliminate 404 errors on the mobile download endpoint, and deliver seamless 1-click WebAPK installation on Android and desktop.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions were confirmed during the interactive clarification phase:
> - **Android App Distribution**: One-click installable WebAPK and direct mobile app download, avoiding dead 404 links to nonexistent GitHub repositories.
> - **Website Startup & Authentication**: Instant loading with offline caching and fail-safe recovery, ensuring the financial dashboard never hangs on a blank or spinning screen.

- **Confirmed Decision 1**: Implement real, downloadable mobile packages directly from the server at `/lifegraph-finops.apk` and `/lifegraph-finops-release.zip`, so clicking "Download" immediately downloads valid installable files rather than returning a 404 JSON error.
- **Confirmed Decision 2**: Decouple the startup screen from external network/auth latency. The React app will hydrate immediately from verified local storage while synchronizing with Firebase in the background. If any network timeout or service worker conflict occurs, safe mode auto-activates in under 1 second.
- **Confirmed Decision 3**: Provide a prominent, direct "Install App on Device" action that triggers Android's native WebAPK installation pipeline without requiring manual sideloading permissions.

---

### 1. Overview & Core Concept

- **What It Does**: LIFEGRAPH FinOps provides the owner (Ayan Islam) with a real-time, zero-trust financial ledger for managing verified engineering revenue, separating unpaid project milestones from received income, and initiating bank wire settlements (BEFTN/NPSB/SWIFT) to Sonali Bank / Dutch-Bangla Bank / Payoneer without bKash dependencies.
- **Target Audience / Persona**: Sole executive owner running engineering operations in Bangladesh with international clients and bank settlement accounts.
- **Key Value**: 100% reliable access on both mobile and web. Zero blank screens, zero broken download links, and native full-screen mobile app presence on Android.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Startup & Immediate Load**:
   - User navigates to the web app URL.
   - The shell mounts in $\le 200\text{ms}$ with zero blocking spinners. Pre-cached owner ledger metrics (Gross Income, Verified Balance, Bank Settlements) appear immediately.
   - An unobtrusive status indicator in the workspace header confirms whether the session is live with Firebase Firestore or operating on offline cache.
2. **One-Click Mobile App Installation**:
   - User taps the "Install App / APK" button in the header or the mobile banner.
   - A modal opens presenting two working options:
     - **Option 1 (Fastest & Native)**: "Install WebAPK on Android" — invokes the native Android home-screen installation prompt, installing a standalone app into the Android launcher with high-resolution icons.
     - **Option 2 (Direct Download)**: "Download Mobile Package" — directly streams the offline mobile package (`.apk` / `.zip`) from `/lifegraph-finops.apk` with proper HTTP content headers and zero 404 errors.
3. **Financial Ledger & Settlement Execution**:
   - User views distinct tabs: Overview, Job Pipeline, Financial Ledger, Bank & Global Payouts, CI/CD Workflows, and Security Audit.
   - Payout requests require bank account confirmation with server-side account masking (`•• •••• 4201`), ensuring privacy and zero unauthorized changes.

#### Visual Identity & Theme
- **Aesthetic Direction**: High-density, professional financial operations console following SaaS dashboard design guidelines. Clean typography, neutral slate canvas, and hairline borders.
- **Color Palette**:
  - Dominant Neutral (60%): `#f8fafc` (Canvas background) and `#ffffff` (Card surface).
  - Structural Borders & Typography (30%): `#e2e8f0` (Hairline dividers), `#0f172a` (Primary text), `#475569` (Secondary labels).
  - Accent Budget (10%): `#0f172a` (Primary dark buttons), `#047857` (Verified income / Emerald), `#b45309` (Pending milestones / Amber).
- **Typography & Hierarchy**:
  - Display & Headings: `Plus Jakarta Sans` (font-semibold, tracking-tight).
  - Financial Metrics & Timestamps: Tabular figures with `font-mono tabular-nums` (`JetBrains Mono`).
  - No pill badge sandwiches, no floating pseudo-technical tickers, no unstyled images.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Native WebAPK & Direct Static Download vs. Server-Side Android SDK Compilation**
  - *Chosen Approach*: Deliver standard Chromium WebAPK minting for Android devices, backed by a pre-built static mobile package served directly by Express at `/lifegraph-finops.apk`.
  - *Why*: Cloud Run ephemeral containers lack the 4GB+ RAM and permanent Android SDK build environment needed to run heavy Gradle compilations on demand. WebAPK provides the exact native home-screen Android app experience with offline support and zero sideload warnings.
  - *Alternatives Considered*: Pointing to GitHub Releases was attempted previously, but returned 404 because the external repository had not yet run GitHub Actions. Serving the file directly from Express guarantees a 100% success rate.
- **Decision 2: Optimistic Hydration with Silent Background Sync vs. Blocking Auth Barrier**
  - *Chosen Approach*: Load the owner console immediately with local persistent state; listen for Firebase Auth and Firestore snapshots asynchronously.
  - *Why*: Eliminates the "infinite loading" bug caused by network latency or iframe auth handshakes. The owner can inspect financials even in poor connectivity or offline mode.
- **Decision 3: Service Worker Scope Hardening**
  - *Chosen Approach*: Update `sw.js` to strictly exclude Vite development paths (`/src/`, `/@vite/`, `/@fs/`, `/node_modules/`) and API routes.
  - *Why*: The previous service worker was intercepting `/src/main.tsx` requests in dev mode and failing, preventing React from mounting.

---

### 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────┐
│                    LIFEGRAPH Client App                      │
├──────────────────────────────┬───────────────────────────────┤
│    PWA & WebAPK Engine       │       Owner FinOps Console    │
│  - usePWAInstall hook        │  - Instant Local Hydration    │
│  - Web App Manifest v2       │  - Background Firebase Sync   │
│  - Hardened sw.js cache      │  - Tabular Ledger Metrics     │
└──────────────┬───────────────┴───────────────┬───────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────────────────────────────────────┐
│               Express Server (server.ts) : 3000              │
├──────────────────────────────────────────────────────────────┤
│  GET /lifegraph-finops.apk ──► Serves Mobile App Package     │
│  GET /api/payouts/*        ──► Bank validation & Masking     │
│  POST /api/gemini/run      ──► Read-Only Financial Auditor   │
│  Vite Dev / Static SPA     ──► Zero-lag HTML/Asset Serving   │
└──────────────┬───────────────────────────────┬───────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│      Firebase Firestore      │ │      Android Device         │
│  - ai-studio-13942140...     │ │  - Native WebAPK container  │
│  - Hardened firestore.rules  │ │  - Offline Cache Storage    │
└──────────────────────────────┘ └─────────────────────────────┘
```

#### Interactive Component & State Mapping
- `src/components/PWAInstallButton.tsx`:
  - Directly captures `beforeinstallprompt` event and exposes a 1-click trigger for native Android WebAPK creation.
  - Replaces external 404 GitHub links with an active server endpoint `/lifegraph-finops.apk` that triggers an instant file download.
- `public/sw.js`:
  - Strict network bypass for all dev routes (`/src/`, `/@vite/`, `/@fs/`), `/api/*`, and Firebase cloud domains.
  - Pre-caches root shell and core assets for reliable offline presentation.
- `server.ts`:
  - Pre-generates and serves a guaranteed portable mobile release package at `/lifegraph-finops.apk` (with appropriate APK MIME type `application/vnd.android.package-archive`).
- `src/App.tsx`:
  - Immediate initialization from persistent storage with a 500ms safety latch for auth transitions.
  - Full financial ledger verification and payout requests to Bangladeshi banking partners.

#### Verification & Quality Gates
1. Run `compile_applet` to ensure clean TypeScript compilation.
2. Verify HTTP `GET /lifegraph-finops.apk` returns status 200 with content-disposition attachment.
3. Test website startup to ensure zero blank screens and immediate display of financial metrics.

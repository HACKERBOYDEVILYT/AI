# DevPilot — ডিজিটাল সার্ভিস ও সফটওয়্যার ইঞ্জিনিয়ারিং প্ল্যাটফর্ম (Web & Android)

**DevPilot** একটি সম্পূর্ণ প্রোডাকশন-রেডি ডিজিটাল সার্ভিস এবং অনলাইন সফটওয়্যার এজেন্সি প্ল্যাটফর্ম। এটি ক্লায়েন্ট অর্ডার ম্যানেজমেন্ট, কোটেশন, পেমেন্ট ট্র্যাকিং (bKash, Nagad, Rocket, Bank), ডেলিভারি, রিভিশন এবং অ্যাডমিন ফিন্যান্সিয়াল কনসোল সহ নির্মিত।

---

## 📱 GitHub-এ কেন APK Release হচ্ছিল না এবং সমাধানের উপায় (Troubleshooting GitHub Actions APK Release)

GitHub Actions-এ APK Release তৈরি না হওয়া বা ফেইল করার প্রধান কারণগুলো নিচে দেওয়া হলো:

### ১. প্রধান কারণ: Workflow Permissions (Read-only GITHUB_TOKEN)
GitHub-এর নতুন ডিপোজিটরিতে সিকিউরিটির জন্য ডিফল্টভাবে `GITHUB_TOKEN`-এ শুধু Read পারমিশন থাকে। ফলে Actions যখন রিলিজ তৈরি করতে বা ফাইল আপলোড করতে যায়, তখন **HTTP 403: Resource not accessible by integration** এরর আসে।

**সমাধান (৩ ক্লিকে ঠিক করুন):**
1. আপনার GitHub Repository-তে যান।
2. **Settings** ট্যাবে ক্লিক করুন।
3. বাম পাশের মেনু থেকে **Actions** $\to$ **General**-এ যান।
4. স্ক্রল করে নিচে **Workflow permissions** সেকশনে যান।
5. **Read and write permissions** সিলেক্ট করুন এবং **"Allow GitHub Actions to create and approve pull requests"** টিক দিন।
6. **Save** বাটনে ক্লিক করুন।

### ২. ট্যাগ বা রিলিজ ট্র্রিগার না করা
`.github/workflows/release.yml` ওয়ার্কফ্লোটি `main` বা `master` ব্রাঞ্চে পুশ করলে এবং যেকোনো ভার্সন ট্যাগ (যেমন `v1.0.0`) পুশ করলে স্বয়ংক্রিয়ভাবে চালু হয়।
- আপনি ম্যানুয়ালি Actions ট্যাব থেকেও রান করতে পারেন: **Actions** $\to$ **Build Android APK & Publish Release** $\to$ **Run workflow**-এ ক্লিক করুন।

### ৩. Actions Artifacts থেকে সরাসরি APK ডাউনলোড
রিলিজ তৈরি হওয়ার পাশাপাশি GitHub Actions প্রতিবার রান হওয়ার পর **Artifacts** সেকশনে সরাসরি `devpilot-v1.0.0-apk` আপলোড করে রাখে। আপনি যেকোনো সময় Actions রানের পেজ থেকে সরাসরি জিপ আকারে APK নামাতে পারবেন।

---

## 🚀 প্রধান ফিচারসমূহ (Core Features)

1. **বাংলা ভাষা প্রথম (Bengali-First UI)**:
   - ডিফল্টভাবে সম্পূর্ণ ইন্টারফেস বাংলায় ওপেন হয় (নেভিগেশন, বাটন, ফর্ম, ভ্যালিডেশন, নোটিফিকেশন, ইনভয়েস, সাপোর্ট টিকেট ও অ্যাডমিন প্যানেল)।
   - সেটিংস থেকে এক ক্লিকে ইংরেজি (English) নির্বাচন করার সুবিধা এবং ব্যবহারকারীর ব্রাউজারে ভাষা সংরক্ষিত থাকা।
   - মোবাইল ডিসপ্লেতে লেখা যাতে ভেঙে না যায় সেজন্য `Hind Siliguri` ইউনিকোড ফন্ট কনফিগার করা।

2. **ডিজিটাল সার্ভিস ক্যাটালগ (Digital Services Catalog)**:
   - ওয়েবসাইট বাগ ফিক্সিং (Website Bug Fixing)
   - হাই-কনভার্টিং ল্যান্ডিং পেজ তৈরি (Landing Page Development)
   - ওয়েবসাইট স্পিড ও মেইনটেন্যান্স (Website Speed & Maintenance)
   - কাস্টম এপিআই ইন্টিগ্রেশন (Custom API Integration)
   - আধুনিক ইউআই/ইউএক্স রিডিজাইন (Modern UI/UX Redesign)
   - বিজনেস অটোমেশন ও স্ক্রিপ্টিং (Business Automation & Bot Scripting)
   - ফিক্সড প্রাইস এবং কোটেশন-ভিত্তিক (Quotation-based) উভয় ধরনের সার্ভিস সাপোর্ট।

3. **অর্ডার ও কোটেশন লাইফসাইকেল (End-to-End Order Pipeline)**:
   - অর্ডার স্ট্যাটাস: `Pending` $\to$ `Quotation Sent` $\to$ `Awaiting Payment` $\to$ `Paid` $\to$ `In Progress` $\to$ `Revision Requested` $\to$ `Delivered` $\to$ `Completed` $\to$ `Cancelled`।
   - ক্লায়েন্ট চাহিদা বর্ণনা, বাজেট, ডেডলাইন ও এটাচমেন্ট দিয়ে অর্ডার করতে পারে।
   - ইউনিক অর্ডার ট্র্যাকিং আইডি জেনারেট হয় (যেমন `#DP-2026-XXXX`)।

4. **বাংলাদেশি পেমেন্ট গেটওয়ে (Local Payment Support)**:
   - বিকাশ (bKash Personal & Merchant)
   - নগদ (Nagad)
   - রকেট (Rocket)
   - ব্যাংক ট্রান্সফার (BEFTN / NPSB / City Bank, BRAC Bank, Dutch-Bangla Bank)
   - TrxID ভ্যালিডেশন ও প্রুফ সাবমিশন।

5. **ক্লায়েন্ট ড্যাশবোর্ড (Customer Dashboard)**:
   - একটিভ অর্ডার ট্র্যাকিং, ডেলিভারি ফাইল ডাউনলোড, রিভিশন রিকোয়েস্ট, চালান (Invoice) দেখা ও প্রিন্ট করা, সাপোর্ট টিকেট।

6. **অ্যাডমিন প্যানেল (Comprehensive Admin Console)**:
   - কাস্টমার তালিকা, সার্ভিস ক্যাটালগ এডিটিং, মূল্য নির্ধারণ।
   - কোটেশন পাঠানো, পেমেন্ট ট্রানজ্যাকশন ভেরিফিকেশন, কাজের ডেলিভারি ফাইল সাবমিশন।
   - রিয়েল আর্নিং অ্যানালিটিক্স: মোট সেলস, কনফার্মড পেমেন্ট, রিফান্ড, অপারেশনাল খরচ ও নেট প্রফিট।
   - সিকিউর অ্যাকশন অডিট লগ ও CSV এক্সপোর্ট।

7. **অ্যান্ড্রয়েড রেডি (Android Ready & PWA/WebAPK)**:
   - Capacitor Android কনফিগারেশন (`com.devpilot.app`)।
   - সরাসরি `/devpilot.apk` রাউট থেকে মোবাইল ডিভাইসে ইন্সটলেশন।

---

## 🛠️ লোকাল রান ও বিল্ড কমান্ড

```bash
# ডিপেন্ডেন্সি ইন্সটল
npm install

# ডেভেলপমেন্ট সার্ভার চালু (Port 3000)
npm run dev

# প্রোডাকশন বিল্ড
npm run build

# টেস্ট ও লিন্ট চেক
npm run lint
```

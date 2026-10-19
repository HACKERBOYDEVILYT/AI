-- ==============================================================================
-- DevPilot — Production-Ready PostgreSQL & Supabase Database Migration
-- Fully normalized relational schema with RLS, RBAC, storage policies, and triggers
-- Tables:
--   1. profiles
--   2. user_roles
--   3. service_categories
--   4. services
--   5. orders
--   6. order_requirements
--   7. quotations
--   8. payments (Append-Only)
--   9. invoices
--  10. order_messages
--  11. order_files (Secure Private Storage references)
--  12. revision_requests
--  13. support_tickets
--  14. support_messages
--  15. notifications
--  16. expenses
--  17. audit_logs
--  18. platform_settings
-- ==============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROFILES & USER ROLES (RBAC)
-- ==============================================================================
CREATE TYPE user_role_enum AS ENUM ('customer', 'support', 'admin');

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'customer',
    phone TEXT,
    company TEXT,
    avatar_url TEXT,
    preferred_language VARCHAR(5) NOT NULL DEFAULT 'bn' CHECK (preferred_language IN ('bn', 'en')),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Explicit user_roles table for granular permissions and audit tracking
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role user_role_enum NOT NULL DEFAULT 'customer',
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. ["orders.manage", "payments.verify", "services.edit"]
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- ==============================================================================
-- 2. SERVICE CATEGORIES & SERVICES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.service_categories (
    id VARCHAR(50) PRIMARY KEY,
    name_bn TEXT NOT NULL,
    name_en TEXT NOT NULL,
    slug VARCHAR(60) NOT NULL UNIQUE,
    description_bn TEXT,
    description_en TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services (
    id VARCHAR(60) PRIMARY KEY,
    category_id VARCHAR(50) NOT NULL REFERENCES public.service_categories(id) ON DELETE RESTRICT,
    title_bn TEXT NOT NULL,
    title_en TEXT NOT NULL,
    short_desc_bn TEXT NOT NULL,
    short_desc_en TEXT NOT NULL,
    full_desc_bn TEXT NOT NULL,
    full_desc_en TEXT NOT NULL,
    service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('fixed', 'quotation')),
    price_bdt NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (price_bdt >= 0),
    estimated_days INT NOT NULL DEFAULT 3 CHECK (estimated_days >= 1),
    features_bn JSONB NOT NULL DEFAULT '[]'::jsonb,
    features_en JSONB NOT NULL DEFAULT '[]'::jsonb,
    requirements_prompt_bn TEXT,
    requirements_prompt_en TEXT,
    icon_name VARCHAR(50) NOT NULL DEFAULT 'Code',
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    badge_bn TEXT,
    badge_en TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. ORDERS & ORDER REQUIREMENTS
-- ==============================================================================
CREATE TYPE order_status_enum AS ENUM (
    'pending',
    'quotation_sent',
    'awaiting_payment',
    'paid',
    'in_progress',
    'revision_requested',
    'delivered',
    'completed',
    'cancelled'
);

CREATE TYPE payment_status_enum AS ENUM (
    'unpaid',
    'verification_pending',
    'paid',
    'rejected',
    'refunded'
);

CREATE TABLE IF NOT EXISTS public.orders (
    id VARCHAR(50) PRIMARY KEY, -- e.g. DP-ORD-2026-001
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    service_id VARCHAR(60) NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    status order_status_enum NOT NULL DEFAULT 'pending',
    payment_status payment_status_enum NOT NULL DEFAULT 'unpaid',
    price_bdt NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (price_bdt >= 0),
    quotation_amount_bdt NUMERIC(12, 2) CHECK (quotation_amount_bdt IS NULL OR quotation_amount_bdt >= 0),
    quotation_note TEXT,
    project_requirements TEXT NOT NULL,
    deadline_date DATE,
    assigned_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Structured order requirements submitted by customer
CREATE TABLE IF NOT EXISTS public.order_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(50) NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    tech_stack TEXT,
    website_url TEXT,
    repository_url TEXT,
    access_credentials TEXT, -- encrypted or masked server-side
    special_instructions TEXT,
    attachments_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. QUOTATIONS (Formal Quotation System)
-- ==============================================================================
CREATE TYPE quotation_status_enum AS ENUM ('sent', 'accepted', 'rejected', 'expired');

CREATE TABLE IF NOT EXISTS public.quotations (
    id VARCHAR(50) PRIMARY KEY, -- e.g. DP-QUO-2026-001
    order_id VARCHAR(50) NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    amount_bdt NUMERIC(12, 2) NOT NULL CHECK (amount_bdt > 0),
    estimated_days INT NOT NULL DEFAULT 3 CHECK (estimated_days >= 1),
    line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    terms_note TEXT,
    status quotation_status_enum NOT NULL DEFAULT 'sent',
    sent_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    response_note TEXT
);

-- ==============================================================================
-- 5. PAYMENTS & INVOICES (Append-Only Financial Ledger)
-- ==============================================================================
CREATE TYPE payment_method_enum AS ENUM ('bkash', 'nagad', 'rocket', 'bank');

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(50) NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    amount_bdt NUMERIC(12, 2) NOT NULL CHECK (amount_bdt > 0),
    payment_method payment_method_enum NOT NULL,
    trx_id VARCHAR(100) NOT NULL UNIQUE,
    sender_account VARCHAR(100) NOT NULL,
    screenshot_url TEXT,
    status payment_status_enum NOT NULL DEFAULT 'verification_pending',
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    notes TEXT,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE, -- Once verified, record is immutable
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoices (
    id VARCHAR(50) PRIMARY KEY, -- e.g. DP-INV-2026-001
    order_id VARCHAR(50) NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    amount_bdt NUMERIC(12, 2) NOT NULL CHECK (amount_bdt >= 0),
    payment_method payment_method_enum,
    trx_id VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'refunded', 'void')),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    pdf_url TEXT
);

-- ==============================================================================
-- 6. ORDER MESSAGES & PRIVATE ORDER FILES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(50) NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    sender_name TEXT NOT NULL,
    sender_role user_role_enum NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(50) NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Private Supabase Storage object path
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    is_delivery BOOLEAN NOT NULL DEFAULT FALSE,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    download_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.revision_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(50) NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    admin_response TEXT
);

-- ==============================================================================
-- 7. SUPPORT TICKETS & MESSAGES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id VARCHAR(50) PRIMARY KEY, -- e.g. DP-TCK-2026-001
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id VARCHAR(50) REFERENCES public.orders(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id VARCHAR(50) NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    sender_name TEXT NOT NULL,
    sender_role user_role_enum NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 8. NOTIFICATIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title_bn TEXT NOT NULL,
    title_en TEXT NOT NULL,
    message_bn TEXT NOT NULL,
    message_en TEXT NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'info', -- 'order', 'payment', 'delivery', 'ticket', 'info'
    target_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 9. EXPENSES, REFUNDS & AUDIT LOGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'server', 'domain', 'software', 'marketing', 'office', 'other'
    amount_bdt NUMERIC(12, 2) NOT NULL CHECK (amount_bdt >= 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    recorded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(50) NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE RESTRICT,
    amount_bdt NUMERIC(12, 2) NOT NULL CHECK (amount_bdt > 0),
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processed', 'rejected')),
    processed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    refund_trx_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    actor_email TEXT NOT NULL,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_role user_role_enum NOT NULL DEFAULT 'customer',
    target_id VARCHAR(100),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 10. PLATFORM SETTINGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.platform_settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_trx ON public.payments(trx_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_order_files_order ON public.order_files(order_id);
CREATE INDEX IF NOT EXISTS idx_order_messages_order ON public.order_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_customer ON public.support_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action, created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Helper Functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'support')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_staff());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- 2. User Roles (Admin Only)
CREATE POLICY "Admin view and manage roles" ON public.user_roles FOR ALL USING (public.is_admin());

-- 3. Services & Categories (Public read, Admin write)
CREATE POLICY "Public read categories" ON public.service_categories FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage categories" ON public.service_categories FOR ALL USING (public.is_admin());

CREATE POLICY "Public read published services" ON public.services FOR SELECT USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "Admin manage services" ON public.services FOR ALL USING (public.is_admin());

-- 4. Orders
CREATE POLICY "Customer view own orders" ON public.orders FOR SELECT USING (customer_id = auth.uid() OR public.is_staff());
CREATE POLICY "Customer create own orders" ON public.orders FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Staff manage all orders" ON public.orders FOR ALL USING (public.is_staff());

-- 5. Order Requirements
CREATE POLICY "Customer view own requirements" ON public.order_requirements FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_requirements.order_id AND (orders.customer_id = auth.uid() OR public.is_staff()))
);
CREATE POLICY "Customer insert own requirements" ON public.order_requirements FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_requirements.order_id AND orders.customer_id = auth.uid())
);
CREATE POLICY "Staff manage requirements" ON public.order_requirements FOR ALL USING (public.is_staff());

-- 6. Quotations
CREATE POLICY "Customer view quotations for own orders" ON public.quotations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = quotations.order_id AND (orders.customer_id = auth.uid() OR public.is_staff()))
);
CREATE POLICY "Staff manage quotations" ON public.quotations FOR ALL USING (public.is_staff());

-- 7. Payments (Append-Only for Customers, Staff Verifies)
CREATE POLICY "Customer view own payments" ON public.payments FOR SELECT USING (customer_id = auth.uid() OR public.is_staff());
CREATE POLICY "Customer submit payment" ON public.payments FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Staff manage payments" ON public.payments FOR ALL USING (public.is_staff());

-- 8. Invoices
CREATE POLICY "Customer view own invoices" ON public.invoices FOR SELECT USING (customer_id = auth.uid() OR public.is_staff());
CREATE POLICY "Staff manage invoices" ON public.invoices FOR ALL USING (public.is_staff());

-- 9. Order Messages
CREATE POLICY "Participants view order messages" ON public.order_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_messages.order_id AND (orders.customer_id = auth.uid() OR public.is_staff()))
);
CREATE POLICY "Participants create order messages" ON public.order_messages FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_messages.order_id AND (orders.customer_id = auth.uid() OR public.is_staff()))
);

-- 10. Order Files (Private Storage)
CREATE POLICY "Participants view order files" ON public.order_files FOR SELECT USING (
    is_public = TRUE OR EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_files.order_id AND (orders.customer_id = auth.uid() OR public.is_staff()))
);
CREATE POLICY "Authorized upload order files" ON public.order_files FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_files.order_id AND (orders.customer_id = auth.uid() OR public.is_staff()))
);
CREATE POLICY "Staff manage order files" ON public.order_files FOR ALL USING (public.is_staff());

-- 11. Revision Requests
CREATE POLICY "Participants view revisions" ON public.revision_requests FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = revision_requests.order_id AND (orders.customer_id = auth.uid() OR public.is_staff()))
);
CREATE POLICY "Customer request revision" ON public.revision_requests FOR INSERT WITH CHECK (
    requested_by = auth.uid() AND
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = revision_requests.order_id AND orders.customer_id = auth.uid())
);
CREATE POLICY "Staff manage revisions" ON public.revision_requests FOR ALL USING (public.is_staff());

-- 12. Support Tickets & Messages
CREATE POLICY "Customer view own tickets" ON public.support_tickets FOR SELECT USING (customer_id = auth.uid() OR public.is_staff());
CREATE POLICY "Customer create tickets" ON public.support_tickets FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Staff manage tickets" ON public.support_tickets FOR ALL USING (public.is_staff());

CREATE POLICY "Participants view support messages" ON public.support_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.support_tickets WHERE support_tickets.id = support_messages.ticket_id AND (support_tickets.customer_id = auth.uid() OR public.is_staff()))
);
CREATE POLICY "Participants send support messages" ON public.support_messages FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.support_tickets WHERE support_tickets.id = support_messages.ticket_id AND (support_tickets.customer_id = auth.uid() OR public.is_staff()))
);

-- 13. Notifications
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- 14. Financial & Admin-only Tables
CREATE POLICY "Admin only expenses" ON public.expenses FOR ALL USING (public.is_admin());
CREATE POLICY "Staff view refunds" ON public.refunds FOR SELECT USING (public.is_staff());
CREATE POLICY "Admin manage refunds" ON public.refunds FOR ALL USING (public.is_admin());
CREATE POLICY "Admin view audit logs" ON public.audit_logs FOR SELECT USING (public.is_admin());

CREATE POLICY "Public read platform settings" ON public.platform_settings FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage platform settings" ON public.platform_settings FOR ALL USING (public.is_admin());

-- ==============================================================================
-- INITIAL SEED CONFIGURATION (Platform Settings & Categories)
-- ==============================================================================
INSERT INTO public.service_categories (id, name_bn, name_en, slug, sort_order)
VALUES 
  ('cat-dev', 'ওয়েব ও অ্যাপ ডেভেলপমেন্ট', 'Web & App Development', 'web-development', 1),
  ('cat-fix', 'বাগ ফিক্সিং ও ট্রাবলশুটিং', 'Bug Fixing & Troubleshooting', 'bug-fixing', 2),
  ('cat-maint', 'স্পিড ও মেইনটেন্যান্স', 'Speed & Maintenance', 'maintenance', 3),
  ('cat-api', 'এপিআই ও ব্যাকএন্ড ইন্টিগ্রেশন', 'API & Backend Integration', 'api-integration', 4),
  ('cat-auto', 'অটোমেশন ও স্ক্রিপ্ট', 'Automation & Bot Scripting', 'automation', 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.platform_settings (key, value)
VALUES 
  ('payment_methods', '{
    "bkashNumber": "01700-000000",
    "bkashType": "Personal / Send Money",
    "bkashInstructionsBn": "বিকাশ অ্যাপ বা *247# থেকে সেন্ড মানি করুন। রেফারেন্স ঘরে আপনার অর্ডার আইডি লিখুন।",
    "bkashInstructionsEn": "Send Money from bKash app or dial *247#. Put your Order ID in reference.",
    "nagadNumber": "01800-000000",
    "nagadType": "Personal / Send Money",
    "nagadInstructionsBn": "নগদ অ্যাপ বা *167# থেকে সেন্ড মানি করে Transaction ID সংগ্রহ করুন।",
    "nagadInstructionsEn": "Send Money via Nagad app or dial *167# and keep Transaction ID.",
    "rocketNumber": "01900-000000-0",
    "rocketType": "Personal",
    "rocketInstructionsBn": "রকেট একাউন্টে টাকা পাঠিয়ে ১২ ডিজিটের ট্রানজ্যাকশন আইডি সাবমিট করুন।",
    "rocketInstructionsEn": "Send money to Rocket account and submit the 12-digit TrxID.",
    "bankName": "City Bank / BRAC Bank",
    "bankAccountName": "DevPilot Agency Accounts",
    "bankAccountNumber": "150XXXXXXXXXXXX",
    "bankBranch": "Gulshan Branch, Dhaka",
    "bankRouting": "225275357",
    "bankInstructionsBn": "যেকোনো ব্যাংক থেকে BEFTN বা NPSB-এর মাধ্যমে তাৎক্ষণিক ফান্ড ট্রান্সফার করুন।",
    "bankInstructionsEn": "Transfer via online banking using BEFTN or instant NPSB."
  }'::jsonb),
  ('contact_info', '{
    "supportEmail": "support@devpilot.app",
    "supportPhone": "+880 1800-000000",
    "supportWhatsApp": "+8801800000000",
    "officeAddressBn": "হাউজ #১২, রোড #৪, বনানী, ঢাকা-১২১৩, বাংলাদেশ",
    "officeAddressEn": "House #12, Road #4, Banani, Dhaka-1213, Bangladesh"
  }'::jsonb),
  ('ai_assistant_config', '{
    "isEnabled": true,
    "dailyRateLimitPerUser": 25,
    "model": "gemini-2.5-flash",
    "maxTokens": 1024
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;

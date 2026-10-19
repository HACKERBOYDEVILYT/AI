import React, { useState, useEffect } from 'react';
import {
  Language,
  OrderRecord,
  ServiceItem,
  ThemeMode,
  UserProfile,
} from './types/devpilot';
import { translations } from './locales/translations';
import {
  getCurrentUser,
  getPreferredLanguage,
  setPreferredLanguage,
  getServices,
  getOrders,
  logoutUser,
  authenticateUser,
  SUPER_ADMIN_EMAIL,
} from './services/devpilotDb';

// Components
import { Navbar } from './components/devpilot/Navbar';
import { LandingHero } from './components/devpilot/LandingHero';
import { ServiceGrid } from './components/devpilot/ServiceGrid';
import { HowItWorks } from './components/devpilot/HowItWorks';
import { FAQSection } from './components/devpilot/FAQSection';
import { ContactSection } from './components/devpilot/ContactSection';
import { Footer } from './components/devpilot/Footer';

// Modals
import { OrderModal } from './components/devpilot/OrderModal';
import { ServiceDetailsModal } from './components/devpilot/ServiceDetailsModal';
import { PaymentModal } from './components/devpilot/PaymentModal';
import { InvoiceModal } from './components/devpilot/InvoiceModal';
import { AuthModal } from './components/devpilot/AuthModal';
import { AIDiagnosticModal } from './components/devpilot/AIDiagnosticModal';
import { PWAInstallModal } from './components/devpilot/PWAInstallModal';
import { PolicyModals } from './components/devpilot/PolicyModals';

// Portals
import { CustomerDashboard } from './components/devpilot/CustomerDashboard';
import { AdminPanel } from './components/devpilot/AdminPanel';

export default function App() {
  // Language state - defaults to 'bn' (Bangla)
  const [language, setLanguage] = useState<Language>(() => getPreferredLanguage());

  // Theme state - defaults to dark for premium modern SaaS look
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('devpilot_theme_pref_v1');
    return (saved as ThemeMode) || 'dark';
  });

  // Current user state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());

  // Navigation view state
  const [activeView, setActiveView] = useState<'landing' | 'services' | 'dashboard' | 'admin' | 'support'>('landing');

  // Modal states
  const [selectedServiceForOrder, setSelectedServiceForOrder] = useState<ServiceItem | null>(null);
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState<ServiceItem | null>(null);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<OrderRecord | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<OrderRecord | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register' | 'admin'>('login');
  const [aiDiagnosticOpen, setAiDiagnosticOpen] = useState(false);
  const [pwaInstallOpen, setPwaInstallOpen] = useState(false);
  const [policyType, setPolicyType] = useState<'privacy' | 'terms' | null>(null);

  // Success Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync theme class to document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('devpilot_theme_pref_v1', theme);
  }, [theme]);

  // Confidential Admin Entrance Listeners (#admin, ?admin=robiul, Ctrl+Shift+A)
  useEffect(() => {
    const checkAdminTrigger = () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (
        hash === '#admin' ||
        hash === '#secret-admin' ||
        params.get('admin') === 'robiul' ||
        params.get('admin') === 'true'
      ) {
        setAuthInitialMode('admin');
        setAuthModalOpen(true);
      }
    };
    checkAdminTrigger();
    window.addEventListener('hashchange', checkAdminTrigger);

    const handleKeyShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setAuthInitialMode('admin');
        setAuthModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyShortcut);

    return () => {
      window.removeEventListener('hashchange', checkAdminTrigger);
      window.removeEventListener('keydown', handleKeyShortcut);
    };
  }, []);

  // Toast trigger helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setPreferredLanguage(lang);
  };

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setActiveView('landing');
    showToast(language === 'bn' ? 'সফলভাবে লগআউট হয়েছেন।' : 'Successfully logged out.');
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveView('admin');
      showToast(
        language === 'bn'
          ? `স্বাগতম অ্যাডমিন ${user.name}!`
          : `Welcome Admin ${user.name}!`
      );
    } else {
      setActiveView('dashboard');
      showToast(
        language === 'bn'
          ? `স্বাগতম ${user.name}! আপনার ড্যাশবোর্ড প্রস্তুত।`
          : `Welcome ${user.name}! Client portal ready.`
      );
    }
  };

  const handleOrderSuccess = (orderId: string) => {
    showToast(
      language === 'bn'
        ? `অর্ডার #${orderId} সফলভাবে জমা হয়েছে!`
        : `Order #${orderId} created successfully!`
    );
    // Switch to customer dashboard to view order
    setActiveView('dashboard');
  };

  const handlePaymentSuccess = (orderId: string) => {
    showToast(
      language === 'bn'
        ? `অর্ডার #${orderId} এর পেমেন্ট তথ্য সফলভাবে জমা হয়েছে!`
        : `Payment details for #${orderId} submitted for review!`
    );
  };

  // Safe navigation with real authentication (NO fake guest login)
  const handleNavigate = (view: 'landing' | 'services' | 'dashboard' | 'admin' | 'support') => {
    if (view === 'dashboard' && !currentUser) {
      setAuthInitialMode('login');
      setAuthModalOpen(true);
      return;
    }

    if (view === 'admin' && currentUser?.role !== 'admin') {
      setAuthInitialMode('admin');
      setAuthModalOpen(true);
      return;
    }

    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const services = getServices();

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-slate-900 text-slate-100'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-blue-600 text-white shadow-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Responsive Navbar */}
      <Navbar
        language={language}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        currentUser={currentUser}
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenAIDiagnostic={() => setAiDiagnosticOpen(true)}
        onOpenPWAInstall={() => setPwaInstallOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'landing' && (
          <>
            <LandingHero
              language={language}
              theme={theme}
              onExploreServices={() => {
                const el = document.getElementById('services-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else setActiveView('services');
              }}
              onOrderCustom={() => {
                // Open order modal for custom quotation service
                const customSvc =
                  services.find((s) => s.type === 'quotation') || services[0];
                setSelectedServiceForOrder(customSvc);
              }}
              onOpenAIDiagnostic={() => setAiDiagnosticOpen(true)}
            />

            <ServiceGrid
              language={language}
              theme={theme}
              services={services}
              onSelectService={(svc) => setSelectedServiceForOrder(svc)}
              onViewServiceDetails={(svc) => setSelectedServiceForDetails(svc)}
            />

            <HowItWorks
              language={language}
              theme={theme}
              onExploreServices={() => {
                const el = document.getElementById('services-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <FAQSection language={language} theme={theme} />

            <ContactSection language={language} theme={theme} />
          </>
        )}

        {activeView === 'services' && (
          <div className="py-6">
            <ServiceGrid
              language={language}
              theme={theme}
              services={services}
              onSelectService={(svc) => setSelectedServiceForOrder(svc)}
              onViewServiceDetails={(svc) => setSelectedServiceForDetails(svc)}
            />
          </div>
        )}

        {activeView === 'dashboard' && currentUser && (
          <CustomerDashboard
            language={language}
            theme={theme}
            currentUser={currentUser}
            onSelectOrderForPayment={(ord) => setSelectedOrderForPayment(ord)}
            onViewInvoice={(ord) => setSelectedOrderForInvoice(ord)}
            onOrderNewService={() => setActiveView('services')}
            onLanguageChange={handleLanguageChange}
          />
        )}

        {activeView === 'admin' && (
          <AdminPanel
            language={language}
            theme={theme}
            currentUser={currentUser}
            onViewInvoice={(ord) => setSelectedOrderForInvoice(ord)}
            onAdminLoginRequested={() => {
              setAuthInitialMode('admin');
              setAuthModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Global Footer (Confidential admin easter egg attached) */}
      <Footer
        language={language}
        theme={theme}
        onNavigate={handleNavigate}
        onOpenPolicy={(type) => setPolicyType(type)}
        onOpenPWAInstall={() => setPwaInstallOpen(true)}
        onAdminSecretTrigger={() => {
          setAuthInitialMode('admin');
          setAuthModalOpen(true);
        }}
      />

      {/* MODALS */}

      {/* 1. Order Creation Modal */}
      {selectedServiceForOrder && (
        <OrderModal
          language={language}
          theme={theme}
          service={selectedServiceForOrder}
          currentUser={currentUser}
          onClose={() => setSelectedServiceForOrder(null)}
          onOrderSuccess={(orderId) => {
            setSelectedServiceForOrder(null);
            handleOrderSuccess(orderId);
          }}
          onRequireAuth={() => {
            setAuthInitialMode('login');
            setAuthModalOpen(true);
          }}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* 2. Service Details Modal */}
      {selectedServiceForDetails && (
        <ServiceDetailsModal
          language={language}
          theme={theme}
          service={selectedServiceForDetails}
          onClose={() => setSelectedServiceForDetails(null)}
          onOrderService={(svc) => {
            setSelectedServiceForDetails(null);
            setSelectedServiceForOrder(svc);
          }}
        />
      )}

      {/* 3. Local Bangladesh Payment Modal (bKash / Nagad / Rocket / Bank) */}
      {selectedOrderForPayment && (
        <PaymentModal
          language={language}
          theme={theme}
          order={selectedOrderForPayment}
          onClose={() => setSelectedOrderForPayment(null)}
          onPaymentSuccess={(orderId) => {
            setSelectedOrderForPayment(null);
            handlePaymentSuccess(orderId);
          }}
        />
      )}

      {/* 4. Official Printable Invoice Modal */}
      {selectedOrderForInvoice && (
        <InvoiceModal
          language={language}
          theme={theme}
          order={selectedOrderForInvoice}
          onClose={() => setSelectedOrderForInvoice(null)}
        />
      )}

      {/* 5. User Authentication & Registration Modal */}
      {authModalOpen && (
        <AuthModal
          language={language}
          theme={theme}
          initialMode={authInitialMode}
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* 6. AI Diagnostic & Cost Estimator Modal */}
      {aiDiagnosticOpen && (
        <AIDiagnosticModal
          language={language}
          theme={theme}
          onClose={() => setAiDiagnosticOpen(false)}
          onSelectRecommendedService={(svc) => {
            setAiDiagnosticOpen(false);
            setSelectedServiceForOrder(svc);
          }}
        />
      )}

      {/* 7. Android PWA & APK Download Modal */}
      {pwaInstallOpen && (
        <PWAInstallModal
          language={language}
          theme={theme}
          onClose={() => setPwaInstallOpen(false)}
        />
      )}

      {/* 8. Privacy & Terms Modals */}
      {policyType && (
        <PolicyModals
          language={language}
          theme={theme}
          type={policyType}
          onClose={() => setPolicyType(null)}
        />
      )}
    </div>
  );
}

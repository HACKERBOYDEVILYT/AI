import React, { useState, useMemo } from 'react';
import {
  Bug,
  Layout,
  Plug,
  Zap,
  Palette,
  Cpu,
  Clock,
  ArrowRight,
  Check,
  Search,
  Sparkles,
} from 'lucide-react';
import { Language, ServiceItem, ThemeMode } from '../../types/devpilot';
import { translations } from '../../locales/translations';

interface ServiceGridProps {
  language: Language;
  theme: ThemeMode;
  services: ServiceItem[];
  onSelectService: (service: ServiceItem) => void;
  onViewServiceDetails: (service: ServiceItem) => void;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({
  language,
  theme,
  services,
  onSelectService,
  onViewServiceDetails,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const t = translations[language];
  const isDark = theme === 'dark';

  const categoryFilters = [
    { id: 'all', label: t.services.filterAll },
    { id: 'bug_fix', label: t.services.filterBugFix },
    { id: 'web_dev', label: t.services.filterWebDev },
    { id: 'api', label: t.services.filterApi },
    { id: 'ui_ux', label: t.services.filterUiUx },
    { id: 'maintenance', label: t.services.filterMaintenance },
    { id: 'automation', label: t.services.filterAutomation },
  ];

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bug':
        return <Bug className="w-5 h-5 text-red-500" />;
      case 'Layout':
        return <Layout className="w-5 h-5 text-blue-500" />;
      case 'Plug':
        return <Plug className="w-5 h-5 text-emerald-500" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Palette':
        return <Palette className="w-5 h-5 text-purple-500" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-cyan-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-blue-500" />;
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter((svc) => {
      if (!svc.isPublished) return false;
      const matchesCategory = selectedCategory === 'all' || svc.category === selectedCategory;
      const searchLower = searchQuery.toLowerCase().trim();
      if (!searchLower) return matchesCategory;

      const title = language === 'bn' ? svc.titleBn : svc.titleEn;
      const desc = language === 'bn' ? svc.shortDescBn : svc.shortDescEn;
      const matchesSearch =
        title.toLowerCase().includes(searchLower) || desc.toLowerCase().includes(searchLower);

      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery, language]);

  return (
    <section id="services-section" className="py-12 md:py-20 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t.services.heading}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            {t.services.subheading}
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 max-w-full overflow-x-auto">
            {categoryFilters.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'সার্ভিস খুঁজুন...' : 'Search services...'}
              className="w-full pl-9 pr-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Service Cards Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8 space-y-3">
            <p className="text-sm font-semibold text-slate-500">
              {language === 'bn' ? 'কোনো সার্ভিস পাওয়া যায়নি।' : 'No services matched your filter.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {language === 'bn' ? 'সকল ফিল্টার রিসেট করুন' : 'Reset filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((svc) => {
              const title = language === 'bn' ? svc.titleBn : svc.titleEn;
              const shortDesc = language === 'bn' ? svc.shortDescBn : svc.shortDescEn;
              const features = language === 'bn' ? svc.featuresBn : svc.featuresEn;
              const badge = language === 'bn' ? svc.badgeBn : svc.badgeEn;

              return (
                <div
                  key={svc.id}
                  className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between p-6 ${
                    isDark
                      ? 'bg-slate-850 border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-blue-950/20'
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Card Header with Icon and Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700/60">
                        {getServiceIcon(svc.iconName)}
                      </div>

                      {badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                          {badge}
                        </span>
                      )}
                    </div>

                    {/* Title & Short Description */}
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                        {title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {shortDesc}
                      </p>
                    </div>

                    {/* Feature bullets */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer: Pricing and Action */}
                  <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {svc.type === 'fixed' ? t.services.startingAt : t.services.quotationBased}
                        </div>
                        <div className="font-extrabold text-xl font-mono text-slate-900 dark:text-white tabular-nums">
                          ৳ {svc.priceBdt.toLocaleString()}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-medium text-slate-400">
                          {t.services.estimatedDelivery}
                        </div>
                        <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {svc.estimatedDays} {t.services.daysUnit}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onViewServiceDetails(svc)}
                        className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors text-center"
                      >
                        {t.services.viewDetails}
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectService(svc)}
                        className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors text-center flex items-center justify-center gap-1"
                      >
                        <span>{t.services.orderNow}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

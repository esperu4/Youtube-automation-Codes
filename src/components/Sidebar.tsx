import React from 'react';
import {
  LayoutDashboard,
  Kanban,
  Tv2,
  BarChart3,
  Cpu,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export type DashboardView =
  | 'overview'
  | 'queue'
  | 'channels'
  | 'analytics'
  | 'system'
  | 'script_lab';

interface SidebarProps {
  currentView: DashboardView;
  onSelectView: (view: DashboardView) => void;
  pendingReviewCount: number;
  dlqErrorCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  pendingReviewCount,
  dlqErrorCount,
}) => {
  const navItems = [
    {
      id: 'overview' as DashboardView,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'queue' as DashboardView,
      label: 'Content Queue',
      icon: Kanban,
      badge: pendingReviewCount > 0 ? pendingReviewCount : null,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    {
      id: 'channels' as DashboardView,
      label: 'Channels',
      icon: Tv2,
      badge: null,
    },
    {
      id: 'analytics' as DashboardView,
      label: 'Analytics & ROI',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'system' as DashboardView,
      label: 'Models & Health',
      icon: Cpu,
      badge: dlqErrorCount > 0 ? dlqErrorCount : null,
      badgeColor: 'bg-rose-500 text-white font-bold',
    },
    {
      id: 'script_lab' as DashboardView,
      label: 'AI Script Lab',
      icon: Sparkles,
      badge: 'AI',
      badgeColor: 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40',
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 text-slate-400 shrink-0 flex flex-col justify-between min-h-[calc(100vh-4rem)]">
      <nav className="py-4 space-y-1">
        <div className="px-5 py-2 text-xs font-bold text-slate-500">
          Navigation
        </div>
        <div className="space-y-0.5 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow'
                    : 'hover:bg-slate-800/60 hover:text-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? 'text-white' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`text-[10px] px-2 py-0.5 font-bold uppercase rounded-full ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer Info Widget */}
      <div className="p-4">
        {dlqErrorCount > 0 && (
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{dlqErrorCount} failed task(s)</span>
            </div>
            <p className="text-slate-500">Open the Models & Health view to re-queue them.</p>
          </div>
        )}
      </div>
    </aside>
  );
};
import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart,
  Tv2,
  Zap,
  Target,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { AnalyticsOverview, Channel } from '../types';

interface AnalyticsViewProps {
  analytics: AnalyticsOverview;
  channels: Channel[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics, channels }) => {
  const [activeTab, setActiveTab] = useState<'performance' | 'comparison' | 'cost_roi'>('performance');

  return (
    <div className="space-y-6">
      
      {/* Header & View Switcher */}
      <div className="bg-white border border-slate-200 rounded-none p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Analytics, Monetization & Cost Efficiency
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Content performance telemetry, channel portfolio revenue, and AI API expenditure breakdown
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-none border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'performance' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Performance Overview
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'comparison' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Channel Comparison
          </button>
          <button
            onClick={() => setActiveTab('cost_roi')}
            className={`px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'cost_roi' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cost & ROI Modeling
          </button>
        </div>
      </div>

      {/* TAB 1: Performance Overview */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          
          {/* Weekly Views & Publication Volume Chart */}
          <div className="bg-white border border-slate-200 rounded-none p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  Weekly Views & Publication Trajectory
                </h3>
                <p className="text-xs text-slate-500">Aggregated views across all active channels for the current week</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-indigo-700 font-bold uppercase tracking-wider text-[10px]">
                  <span className="h-2.5 w-2.5 rounded-none bg-indigo-600"></span> Views
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700 font-bold uppercase tracking-wider text-[10px]">
                  <span className="h-2.5 w-2.5 rounded-none bg-emerald-600"></span> Published Shorts
                </span>
              </div>
            </div>

            {/* Custom Bar Visualization */}
            <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-200">
              {analytics.weekly_views_data.map((item, idx) => {
                const maxViews = 800000;
                const viewHeightPct = Math.round((item.views / maxViews) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] text-slate-600 font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {(item.views / 1000).toFixed(0)}k
                    </div>

                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      {/* Views Bar */}
                      <div
                        className="w-1/2 bg-indigo-600 rounded-none transition-all duration-300 group-hover:bg-indigo-700"
                        style={{ height: `${viewHeightPct}%` }}
                      ></div>
                      {/* Published Count Bar */}
                      <div
                        className="w-1/3 bg-emerald-500 rounded-none transition-all duration-300 group-hover:bg-emerald-600"
                        style={{ height: `${item.published * 10}%` }}
                      ></div>
                    </div>

                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-2">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* VTR Distribution & Content Correlation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* VTR Distribution */}
            <div className="bg-white border border-slate-200 rounded-none p-5 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                View-Through Rate (VTR) Distribution
              </h3>
              <p className="text-xs text-slate-500">Percentage of viewers watching at least 80% of the short</p>

              <div className="space-y-3 pt-2">
                {analytics.vtr_distribution.map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-800 font-bold">{d.range}</span>
                      <span className="text-slate-600 font-mono font-bold">{d.count} Shorts</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-none h-2 overflow-hidden border border-slate-200">
                      <div
                        className={`h-2 rounded-none ${
                          i === 0
                            ? 'bg-emerald-600'
                            : i === 1
                            ? 'bg-indigo-600'
                            : i === 2
                            ? 'bg-amber-500'
                            : 'bg-rose-600'
                        }`}
                        style={{ width: `${(d.count / 48) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Scoring Correlation */}
            <div className="bg-white border border-slate-200 rounded-none p-5 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                Hook Strength vs View Multiplier
              </h3>
              <p className="text-xs text-slate-500">Correlating Quality Control Level 2 score with algorithmic boost</p>

              <div className="space-y-2.5 text-xs pt-1">
                <div className="p-3 bg-slate-50 rounded-none border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-700 uppercase tracking-wider text-[11px]">Hook Score &gt; 90</span>
                    <p className="text-[11px] text-slate-500">First 3s retention &gt; 85%</p>
                  </div>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase tracking-wider text-[10px] rounded-none">
                    3.8x View Boost
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-none border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-indigo-700 uppercase tracking-wider text-[11px]">Hook Score 75 - 89</span>
                    <p className="text-[11px] text-slate-500">First 3s retention 70-84%</p>
                  </div>
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold uppercase tracking-wider text-[10px] rounded-none">
                    1.9x View Boost
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-none border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-rose-700 uppercase tracking-wider text-[11px]">Hook Score &lt; 60 (Flagged)</span>
                    <p className="text-[11px] text-slate-500">Triggers targeted 3s hook regeneration</p>
                  </div>
                  <span className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 font-bold uppercase tracking-wider text-[10px] rounded-none">
                    Regenerate
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: Channel Comparison */}
      {activeTab === 'comparison' && (
        <div className="bg-white border border-slate-200 rounded-none p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Tv2 className="h-4 w-4 text-indigo-600" />
              Side-by-Side Channel Portfolio Performance
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare view-through rates, subscriber growth, and daily spend efficiency across all active channels
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="text-[10px] uppercase tracking-widest font-bold bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Channel Name</th>
                  <th className="py-3 px-3">Niche</th>
                  <th className="py-3 px-3">AI Engine</th>
                  <th className="py-3 px-3">Subscribers</th>
                  <th className="py-3 px-3">Total Views</th>
                  <th className="py-3 px-3">Avg VTR</th>
                  <th className="py-3 px-3">Daily Cost</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {channels.map((channel) => (
                  <tr key={channel.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{channel.name}</td>
                    <td className="py-3 px-3 text-indigo-600 font-bold uppercase tracking-wider text-[11px]">{channel.niche}</td>
                    <td className="py-3 px-3 uppercase font-mono text-slate-500 text-[11px]">
                      {channel.ai_model_config_id}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800 font-mono">
                      {(channel.subscribers / 1000).toFixed(1)}k
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800 font-mono">
                      {(channel.total_views / 1000000).toFixed(2)}M
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-600 font-mono">{channel.avg_vtr}%</td>
                    <td className="py-3 px-3 font-mono text-slate-700 font-bold">
                      ${channel.current_daily_spend_usd.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider border ${
                          channel.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {channel.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Cost & ROI Modeling (PDF Chapter 14 & 21) */}
      {activeTab === 'cost_roi' && (
        <div className="space-y-6">
          
          {/* Monthly Cost Breakdown ($50 Target) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Cost Breakdown Pie/List */}
            <div className="bg-white border border-slate-200 rounded-none p-5 space-y-4 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  Monthly Operational Cost Breakdown (~$50/Channel)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  AI API calls dominate the budget at ~$30-35. Fixed VPS stays constant as portfolio scales.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {analytics.cost_breakdown.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-800 font-bold">{item.category}</span>
                      <span className="font-mono font-bold text-emerald-600">
                        ${item.amount_usd.toFixed(2)} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-none h-2 overflow-hidden border border-slate-200">
                      <div
                        className="h-2 rounded-none"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-none text-xs text-emerald-800 flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-[11px]">Calculated Cost Per Short:</span>
                <span className="font-bold text-sm font-mono">$0.35 / video</span>
              </div>
            </div>

            {/* Portfolio Break-Even Table (PDF Chapter 15.2) */}
            <div className="bg-white border border-slate-200 rounded-none p-5 space-y-4 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-purple-600" />
                  Portfolio Scaling & Break-Even Analysis
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fixed VPS costs distribute across channels, increasing profit margins up to 92-97%
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="text-[10px] uppercase tracking-widest font-bold bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-2">Metric</th>
                      <th className="py-2 px-2">1 Channel</th>
                      <th className="py-2 px-2">10 Channels</th>
                      <th className="py-2 px-2">50 Channels</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    <tr>
                      <td className="py-2 px-2 font-sans font-bold text-slate-800">Monthly Fixed Cost</td>
                      <td className="py-2 px-2">$25</td>
                      <td className="py-2 px-2">$40</td>
                      <td className="py-2 px-2">$120</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 font-sans font-bold text-slate-800">Monthly Variable Cost</td>
                      <td className="py-2 px-2">$35</td>
                      <td className="py-2 px-2">$250</td>
                      <td className="py-2 px-2">$1,000</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 font-sans font-bold text-slate-800">Total Monthly Cost</td>
                      <td className="py-2 px-2 text-rose-600 font-bold">$60</td>
                      <td className="py-2 px-2 text-rose-600 font-bold">$290</td>
                      <td className="py-2 px-2 text-rose-600 font-bold">$1,120</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 font-sans font-bold text-slate-800">Break-Even Views/Mo</td>
                      <td className="py-2 px-2 text-indigo-600 font-bold">600K - 6M</td>
                      <td className="py-2 px-2 text-indigo-600 font-bold">2.9M - 29M</td>
                      <td className="py-2 px-2 text-indigo-600 font-bold">11.2M - 112M</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 font-sans font-bold text-slate-800">Time to Break-Even</td>
                      <td className="py-2 px-2 text-emerald-600 font-bold">4-8 mo</td>
                      <td className="py-2 px-2 text-emerald-600 font-bold">3-6 mo</td>
                      <td className="py-2 px-2 text-emerald-600 font-bold">2-4 mo</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* 12-Month Revenue Projections */}
          <div className="bg-white border border-slate-200 rounded-none p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                  12-Month Single Channel Revenue Projections (PDF Chapter 14.2)
                </h3>
                <p className="text-xs text-slate-500">Modeled across Conservative, Expected, and Aggressive YPP Shorts RPM scenarios</p>
              </div>
            </div>

            <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2">
              {analytics.revenue_projections.map((item, idx) => {
                const maxVal = 1500;
                const expPct = Math.min(100, Math.round((item.expected / maxVal) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="text-[9px] text-slate-600 font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      ${item.expected}
                    </div>
                    <div
                      className="w-full bg-emerald-600 rounded-none transition-all duration-300 group-hover:bg-emerald-700"
                      style={{ height: `${Math.max(6, expPct)}%` }}
                    ></div>
                    <span className="text-[10px] font-mono font-bold text-slate-600 uppercase">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

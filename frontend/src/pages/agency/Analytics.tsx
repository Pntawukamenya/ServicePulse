import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useTranslation } from '../../i18n/useTranslation';
import { useAuthStore } from '../../store/authStore';
import { getServiceLabelKey } from '../../config/services';

type AgencyFilter = '' | 'REG' | 'WASAC' | 'EMERGENCY';
const AGENCY_OPTIONS: { value: AgencyFilter; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'REG', label: 'REG' },
  { value: 'WASAC', label: 'WASAC' },
  { value: 'EMERGENCY', label: 'EMERGENCY' },
];
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  ComposedChart,
  Area,
} from 'recharts';

interface ReportAnalytics {
  totalByCategory: { service_type: string; count: number }[];
  resolutionRate: number;
  averageResolutionTimeHours: number | null;
  monthlyTrends: { month: string; total: number; resolved: number }[];
  priorityDistribution: { priority: string; count: number }[];
  criticalOverdueCount: number;
}

// Stable priority order and colors: Urgent → Priority → Standard → Routine
const PRIORITY_ORDER = ['critical', 'high', 'medium', 'low'] as const;
const PRIORITY_COLORS: Record<string, string> = {
  critical: '#ef4444', // Urgent – Red
  high: '#f97316',     // Priority – Orange
  medium: '#8b5cf6',  // Standard – Purple
  low: '#38bdf8',      // Routine – Light blue
};

const PRIORITY_I18N_KEYS: Record<string, string> = {
  critical: 'citizen.priorityCritical', // Urgent
  high: 'citizen.priorityHigh',          // Priority
  medium: 'citizen.priorityMedium',      // Standard
  low: 'citizen.priorityLow',           // Routine
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];

export default function AgencyAnalytics() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const isSuperAdminNoAgency = user?.role === 'super_admin' && !user?.agencyCode;
  const [agencyFilter, setAgencyFilter] = useState<AgencyFilter>('');
  const [data, setData] = useState<ReportAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = isSuperAdminNoAgency && agencyFilter ? { agency: agencyFilter } : {};
    setLoading(true);
    api.get('/analytics/reports', { params })
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [isSuperAdminNoAgency, agencyFilter]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="card border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 text-center py-16">
          <p className="text-red-700 dark:text-red-300 font-medium">{error || 'Failed to load analytics'}</p>
        </div>
      </div>
    );
  }

  const resolutionPct = Math.round(data.resolutionRate * 100);
  const resolutionOverview = [
    { name: 'Resolved', value: resolutionPct, fill: '#10b981' },
    { name: 'Pending', value: 100 - resolutionPct, fill: '#94a3b8' },
  ].filter((d) => d.value > 0);

  const getCategoryDisplayName = (serviceType: string) => {
    const key = getServiceLabelKey(serviceType);
    if (key) return t(key);
    return serviceType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };
  const categoryChartData = data.totalByCategory.slice(0, 10).map((r) => {
    const displayName = getCategoryDisplayName(r.service_type);
    return {
      name: displayName.length > 18 ? displayName.slice(0, 18) + '…' : displayName,
      fullName: displayName,
      count: r.count,
    };
  });

  const sortedPriorityDistribution = [...data.priorityDistribution].sort(
    (a, b) => PRIORITY_ORDER.indexOf(a.priority as typeof PRIORITY_ORDER[number]) - PRIORITY_ORDER.indexOf(b.priority as typeof PRIORITY_ORDER[number])
  );
  const priorityChartData = sortedPriorityDistribution.map((r) => ({
    name: t(PRIORITY_I18N_KEYS[r.priority] || r.priority),
    value: r.count,
    fill: PRIORITY_COLORS[r.priority] ?? CHART_COLORS[data.priorityDistribution.indexOf(r) % CHART_COLORS.length],
  }));

  const monthlyChartData = data.monthlyTrends.slice(-12).map((r) => ({
    ...r,
    monthShort: r.month.length >= 7 ? r.month.slice(2) : r.month,
  }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg px-3 py-2 text-sm">
        {label && <p className="font-medium text-neutral-900 dark:text-white mb-1">{label}</p>}
        {payload.map((p) => (
          <p key={p.name} className="text-neutral-600 dark:text-neutral-300">
            {p.name}: <span className="font-semibold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">{t('nav.analytics')}</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Report insights and performance metrics</p>
        </div>
        {isSuperAdminNoAgency && (
          <div className="flex items-center gap-2">
            <label htmlFor="analytics-agency" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
              Agency:
            </label>
            <select
              id="analytics-agency"
              value={agencyFilter}
              onChange={(e) => setAgencyFilter(e.target.value as AgencyFilter)}
              className="input select w-auto min-w-[8rem]"
            >
              {AGENCY_OPTIONS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="mb-8" />

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="card card-flat">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Resolution rate</p>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{resolutionPct}%</p>
        </div>
        <div className="card card-flat">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Avg. resolution time</p>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">
            {data.averageResolutionTimeHours != null
              ? `${Math.round(data.averageResolutionTimeHours)}h`
              : '—'}
          </p>
        </div>
        <div className="card card-flat">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Critical overdue</p>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{data.criticalOverdueCount}</p>
        </div>
        <div className="card card-flat">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Categories</p>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">{data.totalByCategory.length}</p>
        </div>
      </div>

      {/* Data tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Reports by category</h2>
          {data.totalByCategory.length === 0 ? (
            <p className="text-sm text-neutral-500">No data</p>
          ) : (
            <ul className="space-y-2">
              {data.totalByCategory.slice(0, 10).map((row) => (
                <li key={row.service_type} className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{getCategoryDisplayName(row.service_type)}</span>
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{row.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Priority distribution</h2>
          {data.priorityDistribution.length === 0 ? (
            <p className="text-sm text-neutral-500">No data</p>
          ) : (
            <ul className="space-y-2">
              {sortedPriorityDistribution.map((row) => (
                <li key={row.priority} className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{t(PRIORITY_I18N_KEYS[row.priority] || row.priority)}</span>
                  <span className="text-sm font-bold text-neutral-600 dark:text-neutral-300">{row.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Charts section */}
      <div className="mt-10 space-y-10">
        {/* Resolution overview – donut */}
        {resolutionOverview.length > 0 && (
          <div className="card">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-4">Resolution overview</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">Share of reports resolved vs still pending</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resolutionOverview}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name} ${value}%`}
                    labelLine={false}
                  >
                    {resolutionOverview.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number | undefined) => [value != null ? `${value}%` : '—', 'Share']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Reports by category – horizontal bar */}
        {categoryChartData.length > 0 && (
          <div className="card">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-4">Reports by category</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">Number of reports per service type (top 10)</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} layout="vertical" margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-neutral-700" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                  <Bar dataKey="count" name="Reports" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Priority distribution – pie */}
        {priorityChartData.length > 0 && (
          <div className="card">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-4">Priority distribution</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">How reports are spread across priority levels</p>
            <div className="h-80 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-2/5 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {priorityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number | undefined) => [value ?? '—', 'Reports']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 sm:flex-col sm:flex-1 justify-center">
                {priorityChartData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{d.name}</span>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Monthly trends – line/area */}
        {monthlyChartData.length > 0 && (
          <div className="card">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-4">Monthly trends</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">Total reports submitted and resolved over the last 12 months</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyChartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-neutral-700" />
                  <XAxis dataKey="monthShort" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const row = monthlyChartData.find((m) => m.monthShort === label) || monthlyChartData[0];
                      return (
                        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg px-3 py-2 text-sm">
                          <p className="font-medium text-neutral-900 dark:text-white mb-1">{row.month}</p>
                          <p className="text-neutral-600 dark:text-neutral-300">Total: <span className="font-semibold">{row.total}</span></p>
                          <p className="text-emerald-600 dark:text-emerald-400">Resolved: <span className="font-semibold">{row.resolved}</span></p>
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="total" name="Total reports" fill="#3b82f6" fillOpacity={0.2} stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Monthly trends table (kept for detail) */}
        {data.monthlyTrends.length > 0 && (
          <div className="card">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-4">Monthly breakdown (table)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th className="text-left py-3 font-medium text-neutral-600 dark:text-neutral-400">Month</th>
                    <th className="text-right py-3 font-medium text-neutral-600 dark:text-neutral-400">Total</th>
                    <th className="text-right py-3 font-medium text-neutral-600 dark:text-neutral-400">Resolved</th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthlyTrends.slice(-12).map((row) => (
                    <tr key={row.month} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                      <td className="py-2 text-neutral-800 dark:text-neutral-200">{row.month}</td>
                      <td className="py-2 text-right font-medium">{row.total}</td>
                      <td className="py-2 text-right text-emerald-600 dark:text-emerald-400">{row.resolved}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

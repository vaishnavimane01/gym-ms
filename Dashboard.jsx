import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import NewMemberWizardModal from '../../components/NewMemberWizardModal';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  Package,
  Calendar,
  CreditCard,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Shield,
  Dumbbell,
  UserCheck,
  Crown,
  Layers,
  Sparkles,
  Phone,
  Flame,
  DollarSign
} from 'lucide-react';

export default function Dashboard() {
  const { user, isOwner } = useAuth();
  const [loading, setLoading] = useState(true);

  // Core Stats
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    overdueMembers: 0,
    totalProducts: 0,
    lowStockCount: 0,
    todayBookingsCount: 0,
  });

  // Analytics for Owner
  const [ownerAnalytics, setOwnerAnalytics] = useState(null);

  // Alerts for Reception
  const [receptionAlerts, setReceptionAlerts] = useState(null);

  const [recentBookings, setRecentBookings] = useState([]);
  const [wizardOpen, setWizardOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const calls = [
        api.get('/members/'),
        api.get('/products/'),
        api.get('/bookings/'),
        api.get('/analytics/reception-alerts'),
      ];

      if (isOwner) {
        calls.push(api.get('/analytics/owner-overview'));
      }

      const results = await Promise.all(calls);
      const members = results[0].data || [];
      const products = results[1].data || [];
      const bookings = results[2].data || [];
      setReceptionAlerts(results[3].data || null);

      if (isOwner && results[4]) {
        setOwnerAnalytics(results[4].data || null);
      }

      const activeCount = members.filter((m) => m.status === 'Active').length;
      const overdueCount = members.filter((m) => m.status === 'Overdue').length;
      const lowStock = products.filter((p) => p.stock_quantity <= 5);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayBookings = bookings.filter(
        (b) => b.start_time && b.start_time.startsWith(todayStr)
      );

      setStats({
        totalMembers: members.length,
        activeMembers: activeCount,
        overdueMembers: overdueCount,
        totalProducts: products.length,
        lowStockCount: lowStock.length,
        todayBookingsCount: todayBookings.length,
      });

      setRecentBookings(bookings.slice(0, 4));
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isOwner]);

  if (loading) {
    return <Spinner className="py-20" size="lg" />;
  }

  // Distribution chart data
  const distributionData = [
    { name: 'Active', value: stats.activeMembers, color: '#10b981' },
    { name: 'Overdue', value: stats.overdueMembers, color: '#f43f5e' },
    { name: 'Pending', value: Math.max(0, stats.totalMembers - stats.activeMembers - stats.overdueMembers), color: '#f59e0b' },
  ];

  return (
    <div className="space-y-8">
      {/* Premium Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold tracking-wide uppercase">
              {isOwner ? <Crown className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
              {user?.role} Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.username}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {isOwner
                ? 'Executive overview: Revenue metrics, member retention analytics, and financial trends.'
                : 'Front-desk terminal: Quick turnstile check-ins, registration wizard, and pending fee alerts.'}
            </p>
          </div>

          {/* Action Hub */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setWizardOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-extrabold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              New Member Wizard
            </button>
            <Link
              to="/admin/checkin"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-2xl border border-white/10 transition-all"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Quick Check-In
            </Link>
            <Link
              to="/admin/pos"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-2xl border border-white/10 transition-all"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              POS
            </Link>
          </div>
        </div>
      </div>

      {/* RECEPTION PORTAL: Expiring Soon & Pending Fees Alerts */}
      {!isOwner && receptionAlerts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Expiring soon widget */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-amber-950 text-sm">
                  Expiring Within 7 Days ({receptionAlerts.expiring_soon_count})
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Action Needed
              </span>
            </div>

            <div className="mt-3 space-y-2 max-h-44 overflow-y-auto pr-1">
              {receptionAlerts.expiring_soon_members?.length === 0 ? (
                <p className="text-xs text-amber-700 py-3 text-center">No memberships expiring this week.</p>
              ) : (
                receptionAlerts.expiring_soon_members?.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 bg-white rounded-xl border border-amber-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{m.name}</span>
                      <span className="text-[11px] text-slate-500">
                        {m.plan} • {m.phone}
                      </span>
                    </div>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                      {m.days_remaining}d left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Fees & Overdue Accounts widget */}
          <div className="bg-rose-50/70 border border-rose-200/80 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-rose-200/60">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-rose-950 text-sm">
                  Pending Fees & Overdue ({receptionAlerts.pending_fees_count})
                </h3>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
                Billing Alert
              </span>
            </div>

            <div className="mt-3 space-y-2 max-h-44 overflow-y-auto pr-1">
              {receptionAlerts.pending_fees_members?.length === 0 ? (
                <p className="text-xs text-rose-700 py-3 text-center">All accounts settled with good standing.</p>
              ) : (
                receptionAlerts.pending_fees_members?.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 bg-white rounded-xl border border-rose-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{m.name}</span>
                      <span className="text-[11px] text-slate-500">{m.phone}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-rose-700 block">Status: {m.status}</span>
                      <span className="text-[10px] text-slate-400">
                        Wallet: ₹{Number(m.wallet_balance).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* OWNER ANALYTICS SECTION: Key Executive KPI Cards */}
      {isOwner && ownerAnalytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow transition-shadow">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Monthly Revenue
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black text-slate-900">
                ₹{Number(ownerAnalytics.total_revenue_monthly).toLocaleString()}
              </h3>
              <span className="text-xs font-bold text-emerald-600">
                +{ownerAnalytics.revenue_growth_pct}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Memberships & POS sales</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow transition-shadow">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Member Base
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black text-slate-900">
                {ownerAnalytics.total_active_members}
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                / {stats.totalMembers} total
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Active paid subscriptions</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow transition-shadow">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Retention Rate
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black text-emerald-700">
                {ownerAnalytics.monthly_retention_rate}%
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Low member churn</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow transition-shadow">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Avg Daily Check-Ins
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black text-slate-900">
                {ownerAnalytics.average_daily_attendance}
              </h3>
              <span className="text-xs font-bold text-emerald-600">visits</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Floor activity index</p>
          </div>
        </div>
      )}

      {/* OWNER VISUAL CHARTS (Recharts) */}
      {isOwner && ownerAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. Monthly Revenue Area Chart (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Revenue Growth & Projections</h3>
                <p className="text-xs text-slate-500">
                  Monthly breakdown of recurring memberships vs POS product sales.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-3 rounded-md bg-emerald-500" /> Memberships
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-3 rounded-md bg-indigo-500" /> POS Sales
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ownerAnalytics.revenue_chart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMemberships" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorPOS" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip
                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="memberships" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMemberships)" />
                  <Area type="monotone" dataKey="pos_sales" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorPOS)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Active vs Inactive Donut Chart (1 col) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Membership Health</h3>
              <p className="text-xs text-slate-500">Active roster vs overdue defaults.</p>
            </div>

            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-1 text-center text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Active</span>
                <span className="font-extrabold text-emerald-600">{stats.activeMembers}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Pending</span>
                <span className="font-extrabold text-amber-500">
                  {Math.max(0, stats.totalMembers - stats.activeMembers - stats.overdueMembers)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Overdue</span>
                <span className="font-extrabold text-rose-500">{stats.overdueMembers}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7-DAY ATTENDANCE TRENDS CHART */}
      {isOwner && ownerAnalytics && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">7-Day Attendance Rhythm</h3>
              <p className="text-xs text-slate-500">Floor occupancy and daily member check-in volume.</p>
            </div>
            <Link
              to="/admin/checkin"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Turnstile Monitor <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ownerAnalytics.attendance_trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={12} />
                <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="checkins" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick Links & Operational Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gym Plans shortcut */}
        <Link
          to="/admin/plans"
          className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-base">Gym Plans & Packages</h4>
          <p className="text-xs text-slate-500 mt-1">
            Create or edit Monthly, Quarterly, VIP memberships and customize amenities.
          </p>
        </Link>

        {/* Member Directory shortcut */}
        <Link
          to="/admin/members"
          className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-base">Member Directory</h4>
          <p className="text-xs text-slate-500 mt-1">
            Filter by status, adjust wallets with audit logs, and manage accounts.
          </p>
        </Link>

        {/* Schedule shortcut */}
        <Link
          to="/admin/schedule"
          className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-base">Trainer Schedule</h4>
          <p className="text-xs text-slate-500 mt-1">
            Visual scheduler, attendance check-in, and conflict prevention.
          </p>
        </Link>
      </div>

      {/* New Member Wizard Modal */}
      <NewMemberWizardModal
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}

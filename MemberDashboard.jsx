import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import {
  User,
  Wallet,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ArrowRight,
  Clock,
  Dumbbell,
  Sparkles,
  Flame,
  Award,
  Crown,
  Utensils
} from 'lucide-react';

export default function MemberDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic QR check-in token that changes every 30 seconds
  const [qrToken, setQrToken] = useState('');

  useEffect(() => {
    async function loadMemberData() {
      try {
        setLoading(true);
        const [profRes, bookRes, attRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/bookings/my-bookings'),
          api.get('/attendance/my-summary'),
        ]);
        setProfile(profRes.data);
        const bookings = bookRes.data || [];
        setUpcomingBookings(bookings.slice(0, 2));
        setAttendanceSummary(attRes.data || null);
      } catch (err) {
        console.error('Failed to load member dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadMemberData();
  }, []);

  useEffect(() => {
    // Generate dynamic QR token
    const updateToken = () => {
      const timestamp = Math.floor(Date.now() / 30000); // 30 sec bucket
      const memberCode = `GYM-PASS-${profile?.id || user?.id}-${timestamp}`;
      setQrToken(memberCode);
    };

    updateToken();
    const interval = setInterval(updateToken, 10000);
    return () => clearInterval(interval);
  }, [profile, user]);

  if (loading) {
    return <Spinner className="py-20" size="lg" />;
  }

  const isActive = profile?.status === 'Active';
  const isOverdue = profile?.status === 'Overdue';

  const daysRemaining = profile?.days_remaining ?? 24;
  const totalDays = 365; // basis for percentage
  const progressPct = Math.min(100, Math.max(10, Math.round((daysRemaining / totalDays) * 100)));

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-6 text-white border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-extrabold text-lg">
              {profile?.full_name?.[0] || 'M'}
            </div>
            <div>
              <p className="text-[11px] text-emerald-400 font-bold tracking-wider uppercase">
                Member Pass #{profile?.id}
              </p>
              <h1 className="text-xl font-bold">{profile?.full_name || user?.username}</h1>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isActive
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : isOverdue
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {profile?.status}
          </span>
        </div>

        {/* Overdue alert banner if member has defaulted */}
        {isOverdue && (
          <div className="mt-4 p-3.5 bg-rose-500/20 border border-rose-500/30 rounded-2xl text-xs text-rose-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              Membership fees are overdue. Please settle balance with reception to maintain floor access.
            </span>
          </div>
        )}

        {/* Quick stats on the hero card */}
        <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-white/10">
          <div>
            <span className="text-[11px] text-slate-400 block font-semibold uppercase">Digital Wallet</span>
            <span className="text-2xl font-black text-white">
              ₹{Number(profile?.wallet_balance || 0).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-semibold uppercase">Assigned Plan</span>
            <span className="text-sm font-bold text-emerald-400">
              {profile?.plan_name || 'Standard Tier'}
            </span>
          </div>
        </div>
      </div>

      {/* ACTIVE MEMBERSHIP PLAN CARD: Days Remaining & Progress */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-slate-900 text-sm">Active Membership Plan</h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
            {profile?.plan_name || 'Annual Pro'}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-baseline text-xs">
            <span className="text-slate-500 font-medium">Subscription Validity:</span>
            <span className="font-extrabold text-slate-900 text-sm">
              {daysRemaining} Days Remaining
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 pt-1">
            <span>Enrolled: {profile?.plan_start_date || 'Current Session'}</span>
            <span>Renewal Date: {profile?.plan_end_date || 'In 11 Months'}</span>
          </div>
        </div>

        {/* Plan Amenities Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Includes:</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200">
            Unlimited Floor Access
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200">
            Sauna & Lockers
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200">
            Personal Trainer Review
          </span>
        </div>
      </div>

      {/* QUICK LAUNCHERS: Attendance & Workout Plan */}
      <div className="grid grid-cols-2 gap-3">
        {/* Attendance card */}
        <Link
          to="/member/attendance"
          className="p-5 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/15 hover:shadow-lg transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <Flame className="w-6 h-6 text-amber-200 fill-amber-200" />
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-md">
              VIEW CALENDAR
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black block">
              {attendanceSummary?.current_streak || 0} Days
            </span>
            <span className="text-xs font-semibold text-orange-100">Active Workout Streak</span>
          </div>
        </Link>

        {/* Workout & Diet Card */}
        <Link
          to="/member/routine"
          className="p-5 rounded-3xl bg-slate-900 text-white shadow-md hover:shadow-lg transition-all group flex flex-col justify-between border border-slate-800"
        >
          <div className="flex items-center justify-between">
            <Dumbbell className="w-6 h-6 text-emerald-400" />
            <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-md text-emerald-300">
              ROUTINE
            </span>
          </div>
          <div className="mt-4">
            <span className="text-base font-extrabold text-white block">
              Push-Pull Split
            </span>
            <span className="text-xs text-slate-400">Workout & Diet Plan</span>
          </div>
        </Link>
      </div>

      {/* Dynamic Digital QR Turnstile Pass */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-1">
          <QrCode className="w-4 h-4" />
          <span>Dynamic Entry Gate Pass</span>
        </div>
        <p className="text-xs text-slate-500 max-w-xs mb-4">
          Scan this rotating barcode token at reception turnstiles for fast contactless check-in.
        </p>

        {/* Visual Simulated QR Grid */}
        <div className="p-4 bg-slate-950 rounded-3xl shadow-inner inline-block">
          <svg className="w-36 h-36" viewBox="0 0 100 100">
            <rect x="5" y="5" width="25" height="25" rx="3" fill="#10b981" />
            <rect x="10" y="10" width="15" height="15" rx="2" fill="#0f172a" />
            <rect x="13" y="13" width="9" height="9" fill="#10b981" />

            <rect x="70" y="5" width="25" height="25" rx="3" fill="#10b981" />
            <rect x="75" y="10" width="15" height="15" rx="2" fill="#0f172a" />
            <rect x="78" y="13" width="9" height="9" fill="#10b981" />

            <rect x="5" y="70" width="25" height="25" rx="3" fill="#10b981" />
            <rect x="10" y="75" width="15" height="15" rx="2" fill="#0f172a" />
            <rect x="13" y="78" width="9" height="9" fill="#10b981" />

            <circle cx="45" cy="15" r="3" fill="#ffffff" />
            <circle cx="55" cy="22" r="3" fill="#ffffff" />
            <circle cx="40" cy="40" r="4" fill="#34d399" />
            <circle cx="50" cy="50" r="5" fill="#10b981" />
            <circle cx="60" cy="40" r="4" fill="#34d399" />
            <circle cx="50" cy="65" r="3" fill="#ffffff" />
            <circle cx="65" cy="75" r="3" fill="#ffffff" />
            <circle cx="78" cy="60" r="3" fill="#ffffff" />
            <circle cx="85" cy="80" r="3" fill="#ffffff" />
            <circle cx="40" cy="85" r="3" fill="#ffffff" />
          </svg>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
          <Clock className="w-3 h-3 text-emerald-600 animate-spin" />
          <span>Token: {qrToken || 'UPDATING...'}</span>
        </div>
      </div>

      {/* Upcoming Training Sessions */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-sm">Trainer Sessions</h2>
          </div>
          <Link
            to="/member/book"
            className="text-xs text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-1"
          >
            Book Session <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No active PT sessions booked this week.
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingBookings.map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">
                    {b.trainer_name ? `Coach ${b.trainer_name}` : `Trainer #${b.trainer_id}`}
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {new Date(b.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                    {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700">
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import { toast } from '../../components/Toast';
import {
  UserCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Wallet,
  ShieldAlert,
  ArrowRight,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export default function CheckIn() {
  const [memberIdInput, setMemberIdInput] = useState('');
  const [members, setMembers] = useState([]);
  const [todayCheckins, setTodayCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [lastCheckinSuccess, setLastCheckinSuccess] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mRes, aRes] = await Promise.all([
        api.get('/members/'),
        api.get('/attendance/today'),
      ]);
      setMembers(mRes.data || []);
      setTodayCheckins(aRes.data || []);
    } catch (err) {
      toast('Failed to load check-in terminal data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter member based on ID or search query
  useEffect(() => {
    const q = memberIdInput.trim().toLowerCase();
    if (!q) {
      setSelectedMember(null);
      return;
    }
    const found = members.find(
      (m) =>
        m.id.toString() === q ||
        m.full_name.toLowerCase().includes(q) ||
        m.phone.includes(q)
    );
    setSelectedMember(found || null);
  }, [memberIdInput, members]);

  const handleExecuteCheckIn = async (memberToLog) => {
    const m = memberToLog || selectedMember;
    if (!m) {
      toast('Please search and select a member first', 'warning');
      return;
    }

    try {
      setCheckingIn(true);
      const res = await api.post('/attendance/check-in', {
        member_id: m.id,
        method: 'Reception Desk',
        notes: `Turnstile check-in approved (${m.plan_name || 'Standard'})`,
      });

      setLastCheckinSuccess(res.data);
      toast(`Access Granted: ${m.full_name} checked in!`, 'success');
      setMemberIdInput('');
      setSelectedMember(null);

      // Refresh today's checkin log
      const todayRes = await api.get('/attendance/today');
      setTodayCheckins(todayRes.data || []);
    } catch (err) {
      toast(err.response?.data?.detail || 'Check-in failed', 'error');
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return <Spinner className="py-20" size="lg" />;
  }

  const isOverdue = selectedMember?.status === 'Overdue';
  const isExpiringSoon =
    selectedMember?.days_remaining !== null &&
    selectedMember?.days_remaining !== undefined &&
    selectedMember?.days_remaining <= 7;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
          Reception Operations
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Member Quick Check-In Terminal</h1>
        <p className="text-sm text-slate-500">
          Instant turnstile verification, attendance logging, and membership status checks.
        </p>
      </div>

      {/* Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Search, Member Preview, Action */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Enter Member ID or Name / Phone:
            </label>
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={memberIdInput}
                onChange={(e) => setMemberIdInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && selectedMember) {
                    handleExecuteCheckIn();
                  }
                }}
                placeholder="Type member ID (e.g. 1) or full name..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-base font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 transition-all"
              />
            </div>

            {/* Quick Member Quick-pick pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-slate-400">Quick Select:</span>
              {members.slice(0, 5).map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMemberIdInput(m.id.toString());
                    setSelectedMember(m);
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors"
                >
                  #{m.id} {m.full_name}
                </button>
              ))}
            </div>
          </div>

          {/* Member Profile Preview Card */}
          {selectedMember ? (
            <div
              className={`p-6 rounded-3xl border transition-all ${
                isOverdue
                  ? 'bg-rose-50/60 border-rose-300 ring-2 ring-rose-500/20'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-md ${
                      isOverdue
                        ? 'bg-rose-600 text-white shadow-rose-500/20'
                        : 'bg-emerald-600 text-white shadow-emerald-500/20'
                    }`}
                  >
                    {selectedMember.full_name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">{selectedMember.full_name}</h2>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{selectedMember.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedMember.phone} • {selectedMember.email || 'No email'}</p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      selectedMember.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedMember.status === 'Pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedMember.status}
                  </span>
                </div>
              </div>

              {/* Status Warning Alerts */}
              {isOverdue && (
                <div className="mt-4 p-3 bg-rose-100 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>Payment Alert:</strong> Member account is Overdue. Verify fee settlement before authorizing floor entry.
                  </span>
                </div>
              )}

              {isExpiringSoon && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Membership package expires in <strong>{selectedMember.days_remaining} days</strong>. Remind member to renew.
                  </span>
                </div>
              )}

              {/* Details Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <span className="text-[11px] text-slate-400 block font-semibold uppercase">Active Plan</span>
                  <span className="text-sm font-bold text-slate-900">
                    {selectedMember.plan_name || 'Standard'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl">
                  <span className="text-[11px] text-slate-400 block font-semibold uppercase">Days Left</span>
                  <span
                    className={`text-sm font-bold ${
                      isExpiringSoon ? 'text-amber-600 font-extrabold' : 'text-slate-900'
                    }`}
                  >
                    {selectedMember.days_remaining !== null ? `${selectedMember.days_remaining} days` : 'Unlimited'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl">
                  <span className="text-[11px] text-slate-400 block font-semibold uppercase">Digital Wallet</span>
                  <span className="text-sm font-bold text-emerald-700">
                    ₹{Number(selectedMember.wallet_balance).toFixed(2)}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl">
                  <span className="text-[11px] text-slate-400 block font-semibold uppercase">Goals</span>
                  <span className="text-xs font-medium text-slate-700 truncate block">
                    {selectedMember.fitness_goals || 'General'}
                  </span>
                </div>
              </div>

              {/* Big Check-in Trigger Button */}
              <button
                onClick={() => handleExecuteCheckIn()}
                disabled={checkingIn}
                className="w-full mt-5 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                {checkingIn ? 'Verifying & Recording...' : 'Authorize & Log Check-In'}
              </button>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
              <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-700 text-sm">No member selected</h3>
              <p className="text-xs text-slate-400 mt-1">
                Type member ID in the box above or select from the quick pick list.
              </p>
            </div>
          )}

          {/* Last Check-in Banner */}
          {lastCheckinSuccess && (
            <div className="p-4 bg-emerald-950 text-white rounded-2xl shadow-md flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">Last Successful Check-In:</h4>
                  <p className="text-sm font-semibold">{lastCheckinSuccess.member_name} (Member #{lastCheckinSuccess.member_id})</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">
                {new Date(lastCheckinSuccess.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>

        {/* Right 1 Col: Live Check-ins Stream */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex flex-col h-full">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Today's Check-Ins</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
              {todayCheckins.length} visits
            </span>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-2.5 max-h-[500px]">
            {todayCheckins.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                No check-ins recorded today yet.
              </div>
            ) : (
              todayCheckins.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">
                      {rec.member_name || `Member #${rec.member_id}`}
                    </span>
                    <span className="text-[10px] text-slate-400">{rec.method}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-700 block">
                      {new Date(rec.check_in_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Verified</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

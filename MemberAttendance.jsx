import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import { toast } from '../../components/Toast';
import {
  Calendar as CalendarIcon,
  Flame,
  CheckCircle2,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Dumbbell
} from 'lucide-react';

export default function MemberAttendance() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total_checkins: 0,
    current_streak: 0,
    checkin_dates: [],
  });
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  useEffect(() => {
    async function loadAttendance() {
      try {
        setLoading(true);
        const res = await api.get('/attendance/my-summary');
        setSummary(res.data || { total_checkins: 0, current_streak: 0, checkin_dates: [] });
      } catch (err) {
        toast('Failed to load attendance summary', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadAttendance();
  }, []);

  if (loading) {
    return <Spinner className="py-20" size="lg" />;
  }

  // Generate calendar days for currentMonthDate
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const checkinSet = new Set(summary.checkin_dates);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Monthly Attendance Calendar</h1>
        <p className="text-xs text-slate-500">
          Track your gym floor consistency, streak records, and workout frequency.
        </p>
      </div>

      {/* Streak & Milestone Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-orange-100 uppercase tracking-wider">
              Workout Streak
            </span>
            <Flame className="w-5 h-5 text-amber-200 fill-amber-200" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black">{summary.current_streak}</span>
            <span className="text-xs font-semibold text-orange-100">days continuous</span>
          </div>
          <p className="text-[11px] text-orange-200 mt-1">Keep the momentum burning!</p>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 text-white shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Check-Ins
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black text-white">{summary.total_checkins}</span>
            <span className="text-xs font-semibold text-slate-400">gym visits</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">Logged this past month</p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-3xl bg-emerald-50 border border-emerald-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Consistency Goal
            </span>
            <Award className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-950">
              {Math.min(100, Math.round((summary.total_checkins / 20) * 100))}%
            </span>
            <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{ width: `${Math.min(100, Math.round((summary.total_checkins / 20) * 100))}%` }}
              />
            </div>
          </div>
          <p className="text-[10px] text-emerald-700 mt-1">Target: 20 sessions / month</p>
        </div>
      </div>

      {/* Interactive Monthly Calendar Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-base">
              {monthNames[month]} {year}
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-1">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* Empty cells before month starts */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-12 sm:h-14 rounded-2xl bg-slate-50/50" />
          ))}

          {/* Days in Month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isAttended = checkinSet.has(dateStr);
            const isToday =
              new Date().toISOString().split('T')[0] === dateStr;

            return (
              <div
                key={dayNum}
                className={`h-12 sm:h-14 rounded-2xl p-1.5 flex flex-col justify-between items-center transition-all ${
                  isAttended
                    ? 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/40'
                    : isToday
                    ? 'border-2 border-slate-900 bg-white font-bold text-slate-900'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <span className="text-xs">{dayNum}</span>
                {isAttended && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-100 fill-emerald-600" />
                )}
                {!isAttended && isToday && (
                  <span className="text-[9px] font-bold text-slate-400">TODAY</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-emerald-500 shadow-sm" />
            <span>Checked In (Cardio/Strength)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-300" />
            <span>Rest Day</span>
          </div>
        </div>
      </div>
    </div>
  );
}

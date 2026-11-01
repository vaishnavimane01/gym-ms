import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { toast } from '../../components/Toast';
import {
  Calendar,
  Clock,
  Dumbbell,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Award,
  Wallet,
  Sparkles,
  Flame,
  Zap,
  Target,
  MessageSquare,
  Check,
  ChevronRight,
  XCircle,
  Sun,
  Sunset,
  Moon
} from 'lucide-react';

export default function BookSession() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Core Booking State
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');

  // Dates
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };
  const getDayAfterStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTodayStr());

  // Hourly Slots State
  const [slots, setSlots] = useState([]);
  const [selectedHour, setSelectedHour] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'morning', 'afternoon', 'evening'

  // Additional Feature States
  const [sessionFocus, setSessionFocus] = useState('Heavy Strength & Hypertrophy');
  const [sessionNotes, setSessionNotes] = useState('');
  const [memberProfile, setMemberProfile] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);

  // Cancellation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Loaders
  const [loadingTrainers, setLoadingTrainers] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  // 1. Fetch Trainers & Member Profile on Mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoadingTrainers(true);
        const [trainersRes, profileRes] = await Promise.all([
          api.get('/trainers/'),
          api.get('/auth/me'),
        ]);

        const list = trainersRes.data || [];
        setTrainers(list);
        if (list.length > 0) {
          setSelectedTrainerId(list[0].id);
        }
        setMemberProfile(profileRes.data || null);
      } catch (err) {
        toast('Failed to load coaching data', 'error');
      } finally {
        setLoadingTrainers(false);
      }
    }
    loadInitialData();
    fetchUpcomingBookings();
  }, []);

  // 2. Fetch Slots whenever Trainer or Date changes
  useEffect(() => {
    async function fetchSlots() {
      if (!selectedTrainerId || !selectedDate) return;
      try {
        setLoadingSlots(true);
        setSelectedHour(null);
        const res = await api.get('/bookings/available-slots', {
          params: {
            trainer_id: selectedTrainerId,
            date: selectedDate,
          },
        });
        setSlots(res.data || []);
      } catch (err) {
        toast('Failed to query available slots', 'error');
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [selectedTrainerId, selectedDate]);

  // 3. Fetch Member's Upcoming Bookings
  const fetchUpcomingBookings = async () => {
    try {
      const res = await api.get('/bookings/my-bookings');
      setUpcomingBookings(res.data || []);
    } catch (err) {
      console.error('Failed to load upcoming sessions', err);
    }
  };

  const selectedTrainer = trainers.find((t) => t.id === parseInt(selectedTrainerId, 10));

  // Filter Trainers by Specialty
  const filteredTrainers =
    specialtyFilter === 'All'
      ? trainers
      : trainers.filter((t) => t.specialty.toLowerCase().includes(specialtyFilter.toLowerCase()));

  // Filter Slots by Time of Day
  const filteredSlots = slots.filter((slot) => {
    if (timeFilter === 'morning') return slot.hour >= 6 && slot.hour < 12;
    if (timeFilter === 'afternoon') return slot.hour >= 12 && slot.hour < 17;
    if (timeFilter === 'evening') return slot.hour >= 17 && slot.hour < 22;
    return true;
  });

  // Handle Session Confirmation
  const handleBook = async () => {
    if (!selectedTrainerId || !selectedDate || selectedHour === null) {
      toast('Please select a coach, date, and an available slot', 'warning');
      return;
    }

    const start_time = `${selectedDate}T${String(selectedHour).padStart(2, '0')}:00:00`;
    const end_time = `${selectedDate}T${String(selectedHour + 1).padStart(2, '0')}:00:00`;

    try {
      setBookingInProgress(true);
      await api.post('/bookings/', {
        trainer_id: parseInt(selectedTrainerId, 10),
        start_time,
        end_time,
      });

      toast(`Session confirmed with ${selectedTrainer?.name}!`, 'success');
      setSelectedHour(null);
      fetchUpcomingBookings();

      // Refresh slot list
      const res = await api.get('/bookings/available-slots', {
        params: {
          trainer_id: selectedTrainerId,
          date: selectedDate,
        },
      });
      setSlots(res.data || []);
    } catch (err) {
      if (err.response?.status === 409) {
        toast(`Schedule Conflict: ${err.response.data.detail}`, 'error');
      } else {
        toast(err.response?.data?.detail || 'Booking failed', 'error');
      }
    } finally {
      setBookingInProgress(false);
    }
  };

  // Handle Session Cancellation
  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    try {
      setCancelling(true);
      await api.delete(`/bookings/${bookingToCancel.id}`);
      toast('Session booking cancelled successfully', 'success');
      setCancelModalOpen(false);
      setBookingToCancel(null);
      fetchUpcomingBookings();

      // Refresh slots
      if (selectedTrainerId && selectedDate) {
        const res = await api.get('/bookings/available-slots', {
          params: { trainer_id: selectedTrainerId, date: selectedDate },
        });
        setSlots(res.data || []);
      }
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to cancel session', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loadingTrainers) {
    return <Spinner className="py-20" size="lg" />;
  }

  const walletBalance = memberProfile?.wallet_balance ?? 0;
  const sessionCost = selectedTrainer?.hourly_rate ?? 0;
  const remainingWallet = walletBalance - sessionCost;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Wallet Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-3xl text-white shadow-xl border border-slate-700/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Personal Coaching Portal
            </span>
            {memberProfile?.plan_name && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700 text-slate-200">
                {memberProfile.plan_name}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Book Training Session</h1>
          <p className="text-xs text-slate-400 mt-1">
            Select your coach, chosen date, and available training window with zero conflicts.
          </p>
        </div>

        {/* Member Wallet Pill */}
        <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-3 rounded-2xl border border-slate-700">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Wallet Balance</span>
            <span className="text-lg font-black text-white">₹{Number(walletBalance).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* STEP 1: CHOOSE PERSONAL TRAINER */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Choose Personal Trainer
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Certified master trainers specialized in strength, hypertrophy, and functional endurance.
            </p>
          </div>

          {/* Specialty Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['All', 'Strength', 'CrossFit', 'Yoga'].map((spec) => (
              <button
                key={spec}
                type="button"
                onClick={() => setSpecialtyFilter(spec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  specialtyFilter === spec
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {filteredTrainers.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No trainers match the selected specialty.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {filteredTrainers.map((t) => {
              const isSelected = selectedTrainerId === t.id;
              const initials = t.name
                .split(' ')
                .map((n) => n[0])
                .join('');

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTrainerId(t.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-500/10'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-800 mt-0.5">
                        {t.specialty}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Session Rate:</span>
                    <span className="font-extrabold text-slate-900">
                      ₹{Number(t.hourly_rate).toFixed(0)}{' '}
                      <span className="text-[10px] font-normal text-slate-400">/ 60 min</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* STEP 2: CHOOSE TRAINING DATE */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
            2
          </span>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Choose Training Date
          </h2>
        </div>

        {/* Quick Date Shortcuts & Picker */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedDate(getTodayStr())}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDate === getTodayStr()
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Today ({getTodayStr()})
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(getTomorrowStr())}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDate === getTomorrowStr()
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tomorrow ({getTomorrowStr()})
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(getDayAfterStr())}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDate === getDayAfterStr()
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              In 2 Days ({getDayAfterStr()})
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 sm:ml-auto">
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              min={getTodayStr()}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-800 outline-none"
            />
          </div>
        </div>
      </div>

      {/* STEP 3: AVAILABLE HOURLY SLOTS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Available Hourly Slots ({selectedDate})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time conflict detection guarantees your reserved hour with {selectedTrainer?.name || 'Coach'}.
            </p>
          </div>

          {/* Time Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              All Slots
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('morning')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                timeFilter === 'morning' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              <Sun className="w-3 h-3 text-amber-500" /> Morning
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('afternoon')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                timeFilter === 'afternoon' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              <Sunset className="w-3 h-3 text-orange-500" /> Afternoon
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('evening')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                timeFilter === 'evening' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              <Moon className="w-3 h-3 text-indigo-500" /> Evening
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available Slot
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Booked / Unavailable
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 ring-2 ring-emerald-500" /> Selected
          </span>
        </div>

        {loadingSlots ? (
          <Spinner className="py-12" size="md" />
        ) : filteredSlots.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
            No training windows matching this filter on {selectedDate}.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {filteredSlots.map((slot) => {
              const isSelected = selectedHour === slot.hour;
              const isAvailable = slot.available;

              return (
                <button
                  key={slot.hour}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => setSelectedHour(slot.hour)}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center gap-1 relative ${
                    !isAvailable
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                      : isSelected
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/30'
                      : 'bg-emerald-50/50 border-emerald-200 text-emerald-950 hover:bg-emerald-100 hover:border-emerald-300'
                  }`}
                >
                  <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                  <span className="tracking-tight">
                    {slot.start} - {slot.end}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
                      isSelected
                        ? 'bg-emerald-700 text-white'
                        : isAvailable
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isAvailable ? 'Open' : 'Booked'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* STEP 4: CUSTOMIZE SESSION FOCUS & GOALS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
            4
          </span>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Customize Session Focus & Instructions
          </h2>
        </div>

        {/* Focus Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              id: 'Heavy Strength & Hypertrophy',
              icon: Dumbbell,
              desc: 'Compound lifts, progressive overload',
            },
            {
              id: 'HIIT, Stamina & Fat Burn',
              icon: Flame,
              desc: 'High heart rate intervals & circuits',
            },
            {
              id: 'Mobility & Deep Stretching',
              icon: Sparkles,
              desc: 'Joint recovery, posture, flexibility',
            },
            {
              id: 'Boxing & Functional Power',
              icon: Zap,
              desc: 'Explosive core, pad work & speed',
            },
          ].map((item) => {
            const isChosen = sessionFocus === item.id;
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => setSessionFocus(item.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  isChosen
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${isChosen ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="font-bold text-xs text-slate-900">{item.id}</span>
                </div>
                <p className="text-[11px] text-slate-500">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Coach Special Instructions */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            Special Instructions / Physical Focus for Coach (Optional)
          </label>
          <input
            type="text"
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g. Focus on deadlift form, recovering from mild hamstring stiffness..."
          />
        </div>
      </div>

      {/* CONFIRMATION & WALLET SUMMARY CARD */}
      {selectedHour !== null && selectedTrainer && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-700 space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-700/80 gap-3">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                1-on-1 PT Reservation
              </span>
              <h3 className="text-lg font-black text-white mt-1">Review & Confirm Appointment</h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Session Fee</span>
              <span className="text-2xl font-black text-emerald-400">
                ₹{Number(selectedTrainer.hourly_rate).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Coach</span>
              <strong className="text-white text-sm">{selectedTrainer.name}</strong>
              <span className="block text-[11px] text-emerald-400 font-semibold">{selectedTrainer.specialty}</span>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Date & Time</span>
              <strong className="text-white text-sm">{selectedDate}</strong>
              <span className="block text-[11px] text-slate-300 font-medium">
                {String(selectedHour).padStart(2, '0')}:00 - {String(selectedHour + 1).padStart(2, '0')}:00
              </span>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Focus Goal</span>
              <strong className="text-white text-sm">{sessionFocus}</strong>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Wallet After Session</span>
              <strong className={`text-sm ${remainingWallet < 0 ? 'text-rose-400' : 'text-white'}`}>
                ₹{Number(remainingWallet).toFixed(2)}
              </strong>
              {remainingWallet < 0 && (
                <span className="block text-[10px] text-rose-400 font-semibold">Low Balance Warning</span>
              )}
            </div>
          </div>

          <button
            onClick={handleBook}
            disabled={bookingInProgress}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 text-sm tracking-wide"
          >
            <ShieldCheck className="w-5 h-5 text-slate-950" />
            {bookingInProgress ? 'Securing Slot...' : `Confirm & Secure Slot (${String(selectedHour).padStart(2, '0')}:00)`}
          </button>
        </div>
      )}

      {/* MY SCHEDULED PT SESSIONS (FEATURE) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              My Upcoming PT Sessions ({upcomingBookings.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Appointments secured under your account. You can cancel with 1 click if needed.
            </p>
          </div>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">No scheduled sessions yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Select a coach and slot above to reserve your next training window.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {upcomingBookings.map((b) => {
              const start = new Date(b.start_time);
              const dateStr = start.toISOString().split('T')[0];
              const timeStr = `${String(start.getHours()).padStart(2, '0')}:00`;

              return (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">
                        {b.trainer_name || 'Assigned Coach'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'Booked'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'Completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dateStr}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{timeStr} (60 mins)</span>
                      </div>
                    </div>
                  </div>

                  {b.status === 'Booked' && (
                    <button
                      type="button"
                      onClick={() => {
                        setBookingToCancel(b);
                        setCancelModalOpen(true);
                      }}
                      className="mt-3 w-full py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel Session
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CANCEL MODAL */}
      <Modal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Confirm Session Cancellation"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to release your reserved training window with{' '}
            <strong className="text-slate-900">{bookingToCancel?.trainer_name}</strong> on{' '}
            <strong className="text-slate-900">
              {bookingToCancel?.start_time ? bookingToCancel.start_time.split('T')[0] : ''}
            </strong>
            ? This slot will immediately become available for other members.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Keep Booking
            </button>
            <button
              type="button"
              disabled={cancelling}
              onClick={handleCancelBooking}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            >
              {cancelling ? 'Releasing Slot...' : 'Yes, Cancel Appointment'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

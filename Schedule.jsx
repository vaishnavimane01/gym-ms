import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { toast } from '../../components/Toast';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  Dumbbell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Check,
  X
} from 'lucide-react';

export default function Schedule() {
  const [bookings, setBookings] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [trainerFilter, setTrainerFilter] = useState('');

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New booking form
  const [formData, setFormData] = useState({
    member_id: '',
    trainer_id: '',
    date: new Date().toISOString().split('T')[0],
    start_hour: '09:00',
    end_hour: '10:00',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedDate) params.date = selectedDate;
      if (trainerFilter) params.trainer_id = trainerFilter;

      const [bRes, tRes, mRes] = await Promise.all([
        api.get('/bookings/', { params }),
        api.get('/trainers/'),
        api.get('/members/'),
      ]);

      setBookings(bRes.data || []);
      setTrainers(tRes.data || []);
      setMembers(mRes.data || []);
    } catch (err) {
      toast('Failed to load scheduler data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, trainerFilter]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      toast(`Session marked as ${newStatus}`, 'success');
      fetchData();
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to update status', 'error');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await api.delete(`/bookings/${bookingId}`);
      toast('Booking cancelled', 'success');
      fetchData();
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to cancel booking', 'error');
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      member_id: members[0]?.id || '',
      trainer_id: trainers[0]?.id || '',
      date: selectedDate,
      start_hour: '09:00',
      end_hour: '10:00',
    });
    setCreateOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.member_id || !formData.trainer_id) {
      toast('Select both a member and a trainer', 'warning');
      return;
    }

    const start_time = `${formData.date}T${formData.start_hour}:00`;
    const end_time = `${formData.date}T${formData.end_hour}:00`;

    if (new Date(end_time) <= new Date(start_time)) {
      toast('End time must be after start time', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/bookings/', {
        member_id: parseInt(formData.member_id, 10),
        trainer_id: parseInt(formData.trainer_id, 10),
        start_time,
        end_time,
      });
      toast('Session booked successfully!', 'success');
      setCreateOpen(false);
      fetchData();
    } catch (err) {
      if (err.response?.status === 409) {
        toast(`Conflict: ${err.response.data.detail}`, 'error');
      } else {
        toast(err.response?.data?.detail || 'Booking failed', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const timeOptions = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trainer Scheduling Hub</h1>
          <p className="text-sm text-slate-500">
            Real-time daily calendar, conflict detection, and attendance check-in.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Book Session
        </button>
      </div>

      {/* Date & Trainer Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-500 uppercase">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase">Trainer:</span>
            <select
              value={trainerFilter}
              onChange={(e) => setTrainerFilter(e.target.value)}
              className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="">All Trainers</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{bookings.length}</strong> session(s)
        </div>
      </div>

      {/* Bookings Timeline / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        {loading ? (
          <Spinner className="py-20" size="lg" />
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-700">No sessions scheduled for this date</h3>
            <p className="text-xs text-slate-400 mt-1">Click "Book Session" to schedule a training allocation.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => {
              const start = new Date(b.start_time);
              const end = new Date(b.end_time);
              const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const endTimeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={b.id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
                >
                  {/* Time badge */}
                  <div className="flex items-center gap-3">
                    <div className="w-16 text-center py-2 bg-slate-800 text-white rounded-xl text-xs font-bold leading-tight">
                      <span>{startTimeStr}</span>
                      <span className="block text-[10px] text-slate-400 font-normal">to {endTimeStr}</span>
                    </div>

                    {/* Member & Trainer details */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-bold text-slate-900 text-sm">
                          {b.member_name || `Member #${b.member_id}`}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Dumbbell className="w-3.5 h-3.5 text-slate-400" />
                        <span>Coach: <strong>{b.trainer_name || `Trainer #${b.trainer_id}`}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Check-in Triggers */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        b.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'Booked'
                          ? 'bg-blue-100 text-blue-800'
                          : b.status === 'No-Show'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {b.status}
                    </span>

                    {/* Check-in actions for Booked sessions */}
                    {b.status === 'Booked' && (
                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          onClick={() => handleStatusChange(b.id, 'Completed')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Mark as Completed"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Complete
                        </button>
                        <button
                          onClick={() => handleStatusChange(b.id, 'No-Show')}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Mark as No-Show"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          No-Show
                        </button>
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Cancel Session"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NEW SESSION MODAL */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Schedule Trainer Session">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Select Member</label>
            <select
              required
              value={formData.member_id}
              onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Choose Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.phone}) - {m.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Select Trainer</label>
            <select
              required
              value={formData.trainer_id}
              onChange={(e) => setFormData({ ...formData, trainer_id: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Choose Trainer --</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.specialty} • ₹{t.hourly_rate}/hr)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Session Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Start Time</label>
              <select
                value={formData.start_hour}
                onChange={(e) => setFormData({ ...formData, start_hour: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {timeOptions.slice(0, -1).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">End Time</label>
              <select
                value={formData.end_hour}
                onChange={(e) => setFormData({ ...formData, end_hour: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {timeOptions.slice(1).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
            <strong>Conflict Prevention:</strong> The system automatically verifies that neither the member nor the trainer has overlapping commitments during this time window.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              {submitting ? 'Verifying...' : 'Book Session'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

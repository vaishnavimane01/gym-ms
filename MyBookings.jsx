import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { toast } from '../../components/Toast';
import {
  Calendar,
  Clock,
  Dumbbell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  X
} from 'lucide-react';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/my-bookings');
      setBookings(res.data || []);
    } catch (err) {
      toast('Failed to load bookings history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenCancel = (b) => {
    setSelectedBooking(b);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    try {
      setCancelling(true);
      await api.delete(`/bookings/${selectedBooking.id}`);
      toast('Session booking cancelled', 'success');
      setCancelModalOpen(false);
      fetchBookings();
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to cancel session', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <Spinner className="py-20" size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Session Bookings</h1>
          <p className="text-xs text-slate-500">Track upcoming appointments and previous coaching history.</p>
        </div>
        <Link
          to="/member/book"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Book Slot
        </Link>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-sm">No personal training sessions on record</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Ready to hit your fitness goals? Book an expert trainer session to accelerate your progress.
          </p>
          <Link
            to="/member/book"
            className="inline-block mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
          >
            Schedule Your First Session
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const start = new Date(b.start_time);
            const end = new Date(b.end_time);
            const dateStr = start.toLocaleDateString([], {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const timeStr = `${start.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

            const isUpcoming = b.status === 'Booked';

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-slate-900 text-sm">
                      {b.trainer_name ? `Coach ${b.trainer_name}` : `Trainer #${b.trainer_id}`}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {dateStr}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {timeStr}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      b.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : b.status === 'Booked'
                        ? 'bg-blue-100 text-blue-700'
                        : b.status === 'No-Show'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {b.status}
                  </span>

                  {isUpcoming && (
                    <button
                      onClick={() => handleOpenCancel(b)}
                      className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-semibold transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CANCEL BOOKING MODAL */}
      <Modal open={cancelModalOpen} onClose={() => setCancelModalOpen(false)} title="Cancel Session Booking">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to cancel your session with{' '}
            <strong className="text-slate-900">{selectedBooking?.trainer_name}</strong>? The trainer slot will be released for other members.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Keep Session
            </button>
            <button
              onClick={handleConfirmCancel}
              disabled={cancelling}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Yes, Cancel Session'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { toast } from '../../components/Toast';
import {
  Dumbbell,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Award,
  TrendingUp,
  Percent,
  Clock,
  CheckCircle2,
  Shield
} from 'lucide-react';

export default function Trainers() {
  const { isOwner } = useAuth();
  const [trainers, setTrainers] = useState([]);
  const [commissionReports, setCommissionReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    specialty: 'Strength & Conditioning',
    hourly_rate: 1500,
    commission_percentage: 15,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const calls = [api.get('/trainers/')];
      if (isOwner) {
        calls.push(api.get('/trainers/commission-report'));
      }
      const results = await Promise.all(calls);
      setTrainers(results[0].data || []);
      if (isOwner && results[1]) {
        setCommissionReports(results[1].data || []);
      }
    } catch (err) {
      toast('Failed to load trainer records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isOwner]);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      specialty: 'Strength & Conditioning',
      hourly_rate: 1500,
      commission_percentage: 15,
    });
    setCreateOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/trainers/', {
        ...formData,
        hourly_rate: parseFloat(formData.hourly_rate),
        commission_percentage: parseFloat(formData.commission_percentage),
      });
      toast('Trainer profile created', 'success');
      setCreateOpen(false);
      fetchData();
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to add trainer', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (t) => {
    setSelectedTrainer(t);
    setFormData({
      name: t.name,
      specialty: t.specialty,
      hourly_rate: t.hourly_rate,
      commission_percentage: t.commission_percentage,
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.put(`/trainers/${selectedTrainer.id}`, {
        ...formData,
        hourly_rate: parseFloat(formData.hourly_rate),
        commission_percentage: parseFloat(formData.commission_percentage),
      });
      toast('Trainer updated successfully', 'success');
      setEditOpen(false);
      fetchData();
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to update trainer', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (t) => {
    setSelectedTrainer(t);
    setDeleteOpen(true);
  };

  const handleDeleteSubmit = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/trainers/${selectedTrainer.id}`);
      toast('Trainer removed', 'success');
      setDeleteOpen(false);
      fetchData();
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to delete trainer', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spinner className="py-20" size="lg" />;
  }

  const totalCommissionPaid = commissionReports.reduce((acc, r) => acc + r.total_commission, 0);
  const totalCompletedSessions = commissionReports.reduce((acc, r) => acc + r.completed_sessions, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Personal Trainers</h1>
          <p className="text-sm text-slate-500">Manage coaching staff, specialties, rates, and commissions.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Trainer
        </button>
      </div>

      {/* Trainers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trainers.map((t) => (
          <div
            key={t.id}
            className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(t)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-lg mt-3">{t.name}</h3>
              <p className="text-xs font-medium text-emerald-600 bg-emerald-50 inline-block px-2.5 py-0.5 rounded-md mt-1">
                {t.specialty}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-slate-400 block font-medium">Hourly Rate</span>
                <span className="text-slate-900 font-bold text-sm">₹{Number(t.hourly_rate).toFixed(0)}/hr</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-slate-400 block font-medium">Commission</span>
                <span className="text-emerald-700 font-bold text-sm">{t.commission_percentage}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Owner-Only: Commission Summary Dashboard */}
      {isOwner && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900">Trainer Commission Reports</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Owner-restricted financial summary of completed training sessions and earned payouts.
              </p>
            </div>

            {/* Quick aggregate totals */}
            <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block">Total Completed</span>
                <span className="font-bold text-slate-800">{totalCompletedSessions} sessions</span>
              </div>
              <div className="h-6 w-[1px] bg-slate-200" />
              <div>
                <span className="text-slate-400 block">Total Commission</span>
                <span className="font-bold text-emerald-700">₹{totalCommissionPaid.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs">
                  <th className="py-3 px-4">Trainer</th>
                  <th className="py-3 px-4 text-center">Total Booked</th>
                  <th className="py-3 px-4 text-center">Completed</th>
                  <th className="py-3 px-4 text-center">Billed Hours</th>
                  <th className="py-3 px-4 text-right">Gross Earnings</th>
                  <th className="py-3 px-4 text-right">Commission Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {commissionReports.map((report) => (
                  <tr key={report.trainer_id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {report.trainer_name}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-600">{report.total_sessions}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" />
                        {report.completed_sessions}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-700">{report.total_hours} hrs</td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                      ₹{report.total_earnings.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-700 text-sm">
                      ₹{report.total_commission.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Register New Trainer">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Trainer Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Coach Vikram"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Specialty</label>
            <input
              type="text"
              required
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. CrossFit, Powerlifting, Yoga"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Hourly Rate (₹)</label>
              <input
                type="number"
                min="100"
                step="50"
                required
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Commission (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                required
                value={formData.commission_percentage}
                onChange={(e) => setFormData({ ...formData, commission_percentage: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
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
              {submitting ? 'Creating...' : 'Register Trainer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Trainer Details">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Trainer Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Specialty</label>
            <input
              type="text"
              required
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Hourly Rate (₹)</label>
              <input
                type="number"
                min="100"
                step="50"
                required
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Commission (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                required
                value={formData.commission_percentage}
                onChange={(e) => setFormData({ ...formData, commission_percentage: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE MODAL */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Confirm Trainer Removal">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to remove <strong className="text-slate-900">{selectedTrainer?.name}</strong>?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              {submitting ? 'Removing...' : 'Delete Trainer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

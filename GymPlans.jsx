import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { toast } from '../../components/Toast';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Calendar,
  Layers,
  Crown,
  Tag,
  Shield,
  Clock
} from 'lucide-react';

export default function GymPlans() {
  const { isOwner } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    duration_days: 30,
    price: 2500,
    description: '',
    features: '',
    badge: 'Popular',
    is_active: true,
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/plans/');
      setPlans(res.data || []);
    } catch (err) {
      toast('Failed to load membership plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      duration_days: 30,
      price: 2500,
      description: 'Access to general fitness equipment and lockers.',
      features: 'Cardio & Strength floor, Locker access, 1 Free fitness orientation',
      badge: 'Popular',
      is_active: true,
    });
    setCreateOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/plans/', {
        ...formData,
        duration_days: parseInt(formData.duration_days, 10),
        price: parseFloat(formData.price),
      });
      toast('Membership plan published successfully!', 'success');
      setCreateOpen(false);
      fetchPlans();
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to create plan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (p) => {
    setSelectedPlan(p);
    setFormData({
      name: p.name,
      duration_days: p.duration_days,
      price: p.price,
      description: p.description,
      features: p.features,
      badge: p.badge || '',
      is_active: p.is_active,
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.put(`/plans/${selectedPlan.id}`, {
        ...formData,
        duration_days: parseInt(formData.duration_days, 10),
        price: parseFloat(formData.price),
      });
      toast('Plan details updated', 'success');
      setEditOpen(false);
      fetchPlans();
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to update plan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (p) => {
    setSelectedPlan(p);
    setDeleteOpen(true);
  };

  const handleDeleteSubmit = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/plans/${selectedPlan.id}`);
      toast('Plan removed', 'success');
      setDeleteOpen(false);
      fetchPlans();
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to delete plan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spinner className="py-20" size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
            <Crown className="w-3.5 h-3.5 text-emerald-600" />
            Owner Tier Catalog
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Gym Plans & Packages</h1>
          <p className="text-sm text-slate-500">
            Define pricing tiers, membership durations, perks, and access privileges.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Package
          </button>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => {
          const featuresList = (p.features || '')
            .split(',')
            .map((f) => f.trim())
            .filter(Boolean);

          const isVIP = p.name.toLowerCase().includes('vip') || p.badge === 'VIP';
          const isBestValue = p.badge === 'Best Value';

          return (
            <div
              key={p.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between relative bg-white shadow-sm hover:shadow-md ${
                isVIP
                  ? 'border-amber-300 ring-2 ring-amber-400/20'
                  : isBestValue
                  ? 'border-emerald-400 ring-2 ring-emerald-500/20'
                  : 'border-slate-200'
              }`}
            >
              {/* Badge */}
              {p.badge && (
                <div className="absolute -top-3 right-6">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm ${
                      isVIP
                        ? 'bg-amber-400 text-slate-900'
                        : isBestValue
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-white'
                    }`}
                  >
                    {p.badge}
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 text-lg">{p.name}</h3>
                  <div className="flex items-center gap-1">
                    {isOwner && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Edit Plan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl font-extrabold text-slate-900">
                    ₹{Number(p.price).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500">/ {p.duration_days} days</span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-4">{p.description}</p>

                {/* Features Checklist */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Included Amenities:
                  </span>
                  {featuresList.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Status</span>
                <span
                  className={`font-semibold ${
                    p.is_active ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  {p.is_active ? 'Active on Roster' : 'Inactive'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE MODAL */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Membership Package">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Package Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. VIP Elite 6-Month"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration (Days)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.duration_days}
                onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fee (₹)</label>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Promotional Badge</label>
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Popular, Best Value, VIP"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Short marketing blurb explaining the tier."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Features (Comma Separated)
            </label>
            <textarea
              rows="2"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. 24/7 Access, Private Locker, Sauna & Steam, 5 PT credits"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Publish Package'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Membership Package">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Package Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration (Days)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.duration_days}
                onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fee (₹)</label>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Promotional Badge</label>
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Features (Comma Separated)
            </label>
            <textarea
              rows="2"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="is_active" className="text-xs font-semibold text-slate-700">
              Active for member enrollment
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE MODAL */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Confirm Package Deletion">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong className="text-slate-900">{selectedPlan?.name}</strong>?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              {submitting ? 'Deleting...' : 'Delete Package'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

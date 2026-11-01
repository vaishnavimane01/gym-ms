import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { toast } from '../../components/Toast';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Wallet,
  ShieldAlert,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [highlightedMemberId, setHighlightedMemberId] = useState(null);

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedMember, setSelectedMember] = useState(null);
  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');

  // Forms state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: 'member123',
    fitness_goals: '',
    wallet_balance: 0,
    status: 'Active',
    plan_id: '',
  });

  const [statusData, setStatusData] = useState({
    status: 'Active',
  });

  const [walletData, setWalletData] = useState({
    amount: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/members/', { params });
      setMembers(res.data || []);
    } catch (err) {
      toast('Failed to load members', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await api.get('/plans/');
      setPlans(res.data || []);
    } catch (err) {
      console.error('Failed to load plans', err);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchPlans();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMembers();
  };

  const handleOpenCreate = () => {
    setFormData({
      full_name: '',
      phone: '',
      email: '',
      password: 'member123',
      fitness_goals: '',
      wallet_balance: 0,
      status: 'Active',
      plan_id: '',
    });
    setCreateError('');
    setCreateOpen(true);
  };

  // Find if email or phone is already used in directory
  const matchedExistingMember = formData.email.trim()
    ? members.find(
        (m) =>
          m.email &&
          m.email.toLowerCase() === formData.email.trim().toLowerCase()
      )
    : null;

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');

    try {
      setSubmitting(true);
      const payload = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        password: formData.password || 'member123',
        fitness_goals: formData.fitness_goals?.trim() || null,
        wallet_balance: parseFloat(formData.wallet_balance) || 0,
        status: formData.status,
        plan_id: formData.plan_id ? parseInt(formData.plan_id) : null,
      };

      const res = await api.post('/members/', payload);
      toast(`Member "${res.data.full_name}" created and added to directory!`, 'success');
      setCreateOpen(false);
      setHighlightedMemberId(res.data.id);
      fetchMembers();

      // Clear search so newly added member is visible
      if (search) setSearch('');
    } catch (err) {
      const detail = err.response?.data?.detail;
      let msg = 'Failed to create member';
      if (typeof detail === 'string') {
        msg = detail;
      } else if (Array.isArray(detail)) {
        msg = detail.map((d) => d.msg || d.message).join(', ');
      } else if (detail && typeof detail === 'object') {
        msg = detail.message || JSON.stringify(detail);
      }
      setCreateError(msg);
      toast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwitchToEditExisting = (m) => {
    setCreateOpen(false);
    setSelectedMember(m);
    setFormData({
      full_name: formData.full_name || m.full_name,
      phone: formData.phone || m.phone,
      email: formData.email || m.email || '',
      fitness_goals: formData.fitness_goals || m.fitness_goals || '',
      status: formData.status || m.status,
      plan_id: formData.plan_id || (m.plan_id ? String(m.plan_id) : ''),
      wallet_balance: formData.wallet_balance || m.wallet_balance,
    });
    setEditError('');
    setEditOpen(true);
  };

  const handleOpenEdit = (m) => {
    setSelectedMember(m);
    setFormData({
      full_name: m.full_name,
      phone: m.phone,
      email: m.email || '',
      fitness_goals: m.fitness_goals || '',
      status: m.status,
      plan_id: m.plan_id ? String(m.plan_id) : '',
      wallet_balance: m.wallet_balance,
    });
    setEditError('');
    setEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');

    try {
      setSubmitting(true);
      const payload = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        fitness_goals: formData.fitness_goals?.trim() || null,
        status: formData.status,
        plan_id: formData.plan_id ? parseInt(formData.plan_id) : null,
      };

      await api.put(`/members/${selectedMember.id}`, payload);
      toast(`Member "${formData.full_name}" profile updated!`, 'success');
      setEditOpen(false);
      setHighlightedMemberId(selectedMember.id);
      fetchMembers();
    } catch (err) {
      const detail = err.response?.data?.detail;
      let msg = 'Failed to update member';
      if (typeof detail === 'string') {
        msg = detail;
      } else if (Array.isArray(detail)) {
        msg = detail.map((d) => d.msg || d.message).join(', ');
      }
      setEditError(msg);
      toast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenStatusOverride = (m) => {
    setSelectedMember(m);
    setStatusData({ status: m.status });
    setStatusModalOpen(true);
  };

  const handleStatusOverrideSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.put(`/members/${selectedMember.id}`, { status: statusData.status });
      toast(`Status updated to ${statusData.status} (Audit log generated)`, 'success');
      setStatusModalOpen(false);
      setHighlightedMemberId(selectedMember.id);
      fetchMembers();
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to override status', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenWalletAdjustment = (m) => {
    setSelectedMember(m);
    setWalletData({ amount: '', notes: '' });
    setWalletModalOpen(true);
  };

  const handleWalletSubmit = async (e) => {
    e.preventDefault();
    const amountVal = parseFloat(walletData.amount);
    if (isNaN(amountVal) || amountVal === 0) {
      toast('Please enter a valid non-zero amount', 'warning');
      return;
    }
    if (!walletData.notes || walletData.notes.trim().length < 5) {
      toast('Mandatory audit note must be at least 5 characters', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/members/${selectedMember.id}/wallet`, {
        amount: amountVal,
        notes: walletData.notes.trim(),
      });
      toast('Wallet balance adjusted and logged to audit trail!', 'success');
      setWalletModalOpen(false);
      setHighlightedMemberId(selectedMember.id);
      fetchMembers();
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to adjust wallet', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (m) => {
    setSelectedMember(m);
    setDeleteModalOpen(true);
  };

  const handleDeleteSubmit = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/members/${selectedMember.id}`);
      toast('Member deleted successfully', 'success');
      setDeleteModalOpen(false);
      fetchMembers();
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to delete member', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>Member Directory</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              {members.length} Total
            </span>
          </h1>
          <p className="text-sm text-slate-500">
            Manage memberships, enrolled gym plans, wallets, and access statuses.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by full name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 uppercase">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Members Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <Spinner className="py-20" size="lg" />
        ) : members.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No members found.</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search criteria or register a new member.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3.5 px-4">Member Name</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Membership Plan</th>
                  <th className="py-3.5 px-4">Wallet Balance</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => {
                  const isHighlighted = m.id === highlightedMemberId;
                  return (
                    <tr
                      key={m.id}
                      className={`transition-colors ${
                        isHighlighted
                          ? 'bg-emerald-50/70 ring-2 ring-emerald-500 ring-inset'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{m.full_name}</span>
                          {isHighlighted && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-600 text-white font-bold">
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">ID: #{m.id}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">{m.phone}</div>
                        <div className="text-xs text-slate-500">{m.email || '—'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {m.plan_name ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              {m.plan_name}
                            </span>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {m.days_remaining != null ? (
                                <span className={m.days_remaining <= 7 ? 'text-amber-600 font-semibold' : ''}>
                                  {m.days_remaining} days left
                                </span>
                              ) : (
                                'Standard'
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No Active Plan</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          ₹{Number(m.wallet_balance).toFixed(2)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            m.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {m.status === 'Active' && <CheckCircle className="w-3 h-3" />}
                          {m.status === 'Pending' && <Clock className="w-3 h-3" />}
                          {m.status === 'Overdue' && <AlertCircle className="w-3 h-3" />}
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenWalletAdjustment(m)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="Adjust Wallet Balance"
                          >
                            <Wallet className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenStatusOverride(m)}
                            className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                            title="Override Status"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            title="Edit Member Profile"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(m)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            title="Delete Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MEMBER MODAL */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New Gym Member">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{createError}</p>
                {matchedExistingMember && (
                  <button
                    type="button"
                    onClick={() => handleSwitchToEditExisting(matchedExistingMember)}
                    className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
                  >
                    <span>Update {matchedExistingMember.full_name} (ID #{matchedExistingMember.id}) Instead</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {matchedExistingMember && !createError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold">
                  Member already exists: {matchedExistingMember.full_name} (ID #{matchedExistingMember.id})
                </p>
                <p className="text-[11px] text-amber-700">
                  Phone: {matchedExistingMember.phone} • Status: {matchedExistingMember.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSwitchToEditExisting(matchedExistingMember)}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap"
              >
                Edit Profile
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Ramesh Kumar"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="+91-9876543210"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="ramesh@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Membership Plan
              </label>
              <select
                value={formData.plan_id}
                onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">No Plan (Standard Entry)</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.price} • {p.duration_days}d)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Initial Wallet (₹)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={formData.wallet_balance}
                onChange={(e) => setFormData({ ...formData, wallet_balance: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Portal Password
              </label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                placeholder="Default: member123"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Fitness Goals
            </label>
            <textarea
              rows="2"
              value={formData.fitness_goals}
              onChange={(e) => setFormData({ ...formData, fitness_goals: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Strength training, weight loss, endurance..."
            />
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
              {submitting ? 'Creating...' : 'Create Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MEMBER MODAL */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Member Profile">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {editError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="font-semibold">{editError}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Membership Plan
              </label>
              <select
                value={formData.plan_id}
                onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">No Plan / Standard</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.price} • {p.duration_days}d)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Fitness Goals
            </label>
            <textarea
              rows="2"
              value={formData.fitness_goals}
              onChange={(e) => setFormData({ ...formData, fitness_goals: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
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

      {/* STATUS OVERRIDE MODAL */}
      <Modal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Override Membership Status for ${selectedMember?.full_name}`}
      >
        <form onSubmit={handleStatusOverrideSubmit} className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <strong>Audit Policy Notice:</strong> Modifying a member's operational status manually creates an immutable audit override log entry tracked under your admin ID.
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Select New Status</label>
            <select
              value={statusData.status}
              onChange={(e) => setStatusData({ status: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
            >
              <option value="Active">Active (Full access permitted)</option>
              <option value="Pending">Pending (Awaiting paperwork/orientation)</option>
              <option value="Overdue">Overdue (Payment default / restricted)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Confirm Status Override'}
            </button>
          </div>
        </form>
      </Modal>

      {/* WALLET ADJUSTMENT MODAL */}
      <Modal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        title={`Adjust Wallet Balance: ${selectedMember?.full_name}`}
      >
        <form onSubmit={handleWalletSubmit} className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
            Current balance: <strong className="text-sm">₹{Number(selectedMember?.wallet_balance || 0).toFixed(2)}</strong>.
            Enter a positive amount to credit, or negative to debit.
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Adjustment Amount (₹)</label>
            <input
              type="number"
              step="any"
              required
              value={walletData.amount}
              onChange={(e) => setWalletData({ ...walletData, amount: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="+500 or -200"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Audit Note <span className="text-rose-500">* (Mandatory)</span>
            </label>
            <textarea
              rows="3"
              required
              value={walletData.notes}
              onChange={(e) => setWalletData({ ...walletData, notes: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Cash top-up at reception desk / Membership fee rebate"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setWalletModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              {submitting ? 'Applying...' : 'Apply Wallet Adjustment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Member Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong className="text-slate-900">{selectedMember?.full_name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              {submitting ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

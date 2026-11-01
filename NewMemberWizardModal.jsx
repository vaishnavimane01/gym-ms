import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from './Modal';
import { toast } from './Toast';
import {
  User,
  Phone,
  Mail,
  Shield,
  CreditCard,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Wallet,
  Check
} from 'lucide-react';

export default function NewMemberWizardModal({ open, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: 'member123',
    fitness_goals: 'Build lean muscle & overall endurance',
    plan_id: null,
    wallet_balance: 1000,
    status: 'Active',
  });

  const [createdMember, setCreatedMember] = useState(null);

  useEffect(() => {
    if (open) {
      setStep(1);
      setCreatedMember(null);
      api.get('/plans/').then((res) => {
        const activePlans = (res.data || []).filter((p) => p.is_active);
        setPlans(activePlans);
        if (activePlans.length > 0 && !formData.plan_id) {
          setFormData((prev) => ({ ...prev, plan_id: activePlans[0].id }));
        }
      });
    }
  }, [open]);

  const handleNext = () => {
    if (step === 1) {
      if (!formData.full_name || !formData.phone) {
        toast('Please enter member name and phone number', 'warning');
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const handleFinish = async () => {
    try {
      setSubmitting(true);
      const res = await api.post('/members/', {
        ...formData,
        wallet_balance: parseFloat(formData.wallet_balance) || 0,
      });
      setCreatedMember(res.data);
      setStep(4); // Success step
      toast(`Member ${res.data.full_name} registered successfully!`, 'success');
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed';
      toast(typeof msg === 'string' ? msg : JSON.stringify(msg), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPlan = plans.find((p) => p.id === formData.plan_id);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Streamlined Member Registration Wizard"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Wizard Step Progress Bar */}
        <div className="flex items-center justify-between relative px-2">
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />
          {[1, 2, 3, 4].map((i) => {
            const isCompleted = step > i;
            const isCurrent = step === i;
            return (
              <div key={i} className="flex flex-col items-center gap-1.5 z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-slate-900 text-white ring-4 ring-emerald-500/20 scale-110'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : i}
                </div>
                <span className="text-[10px] font-semibold text-slate-500">
                  {i === 1 ? 'Profile' : i === 2 ? 'Membership' : i === 3 ? 'Billing' : 'Done'}
                </span>
              </div>
            );
          })}
        </div>

        {/* STEP 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Enter core identity details for the gym roster and turnstile check-in.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Siddharth Malhotra"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="+91-9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="siddharth@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Primary Fitness Goals
              </label>
              <textarea
                rows="2"
                placeholder="e.g. Weight reduction, powerlifting, marathon conditioning..."
                value={formData.fitness_goals}
                onChange={(e) => setFormData({ ...formData, fitness_goals: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Choose Membership Plan */}
        {step === 2 && (
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Select Membership Tier</h3>
              <p className="text-xs text-slate-500">
                Package determines facility privileges, duration, and expiration date.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {plans.map((p) => {
                const isSelected = formData.plan_id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setFormData({ ...formData, plan_id: p.id })}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                        {p.badge && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">
                        {p.duration_days} Days
                      </span>
                      <span className="text-base font-extrabold text-emerald-700">
                        ₹{Number(p.price).toFixed(0)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Initial Wallet & Status */}
        {step === 3 && (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Selected Tier</span>
                <span className="font-bold text-sm text-emerald-400">{selectedPlan?.name || 'Standard'}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Plan Fee</span>
                <span className="font-extrabold text-base">₹{selectedPlan?.price || 0}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Initial Digital Wallet Top-up (₹)
              </label>
              <div className="relative">
                <Wallet className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.wallet_balance}
                  onChange={(e) => setFormData({ ...formData, wallet_balance: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Credit stored in member wallet for protein shakes, accessories, and POS items.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Initial Account Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Active">Active (Turnstile Access Immediate)</option>
                <option value="Pending">Pending (Orientation Required)</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 4: Success & Summary */}
        {step === 4 && createdMember && (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Member Successfully Onboarded!</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Registration complete with member account and assigned membership tier.
              </p>
            </div>

            <div className="max-w-sm mx-auto p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Member ID:</span>
                <span className="font-bold text-slate-900">#{createdMember.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Name:</span>
                <span className="font-semibold text-slate-900">{createdMember.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Plan:</span>
                <span className="font-semibold text-emerald-700">{createdMember.plan_name || 'Standard'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Initial Wallet:</span>
                <span className="font-bold text-slate-900">₹{Number(createdMember.wallet_balance).toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-all"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {step < 4 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all flex items-center gap-1.5"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleFinish}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                {submitting ? 'Registering...' : 'Complete Registration'}
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

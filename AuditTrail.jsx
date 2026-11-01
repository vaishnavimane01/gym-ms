import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import { toast } from '../../components/Toast';
import {
  Shield,
  Search,
  Filter,
  Clock,
  User,
  AlertCircle,
  FileText,
  DollarSign,
  Activity
} from 'lucide-react';

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [memberIdFilter, setMemberIdFilter] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (memberIdFilter) params.member_id = memberIdFilter;

      const res = await api.get('/audit/', { params });
      setLogs(res.data || []);
    } catch (err) {
      toast('Failed to load audit trail logs (Owner permission required)', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [memberIdFilter]);

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const desc = (log.action_description || '').toLowerCase();
    const memberName = (log.member_name || '').toLowerCase();
    return desc.includes(term) || memberName.includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            Owner-Restricted Ledger
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Audit & Override Trail</h1>
          <p className="text-sm text-slate-500">
            Immutable chronicle of manual status overrides, balance credits, and administrative debits.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
        >
          Refresh Logs
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action descriptions, member names..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 uppercase">Member ID:</span>
          <input
            type="number"
            value={memberIdFilter}
            onChange={(e) => setMemberIdFilter(e.target.value)}
            placeholder="Filter ID"
            className="w-24 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {memberIdFilter && (
            <button
              onClick={() => setMemberIdFilter('')}
              className="text-xs text-rose-600 font-semibold hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <Spinner className="py-20" size="lg" />
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center">
            <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-700">No audit records found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Manual balance adjustments and status changes will automatically record here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3.5 px-4">Log ID</th>
                  <th className="py-3.5 px-4">Timestamp (UTC)</th>
                  <th className="py-3.5 px-4">Admin ID</th>
                  <th className="py-3.5 px-4">Impacted Member</th>
                  <th className="py-3.5 px-4">Action Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const isWallet = log.action_description.includes('Wallet');
                  const isStatus = log.action_description.includes('Status');

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                        #{log.id}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700">
                          <User className="w-3 h-3 text-slate-400" />
                          Admin #{log.admin_id}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{log.member_name || `Member #${log.member_id}`}</div>
                        <div className="text-[10px] text-slate-400">ID: {log.member_id}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 mt-0.5 ${
                              isWallet
                                ? 'bg-emerald-100 text-emerald-800'
                                : isStatus
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {isWallet ? 'WALLET' : isStatus ? 'STATUS' : 'OVERRIDE'}
                          </span>
                          <span className="text-slate-800 font-medium leading-relaxed">
                            {log.action_description}
                          </span>
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
    </div>
  );
}

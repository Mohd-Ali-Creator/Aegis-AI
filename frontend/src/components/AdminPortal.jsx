import React, { useState, useEffect } from 'react';
import { 
  Users, Shield, ShieldAlert, Search, Filter, ArrowRight, 
  Activity, AlertTriangle, CheckCircle, Database, Lock, 
  Layers, Clock, RefreshCw, Eye, BookOpen, ChevronRight, Sparkles 
} from 'lucide-react';
import axios from 'axios';

export default function AdminPortal({ onSelectEmployee }) {
  const [summary, setSummary] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Directory filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [sortBy, setSortBy] = useState('threats'); // 'threats', 'analyses', 'recent'
  const [showRegistryModal, setShowRegistryModal] = useState(false);

  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resSummary, resEmployees, resDimensions] = await Promise.all([
        axios.get('http://localhost:4000/api/admin/summary', authHeaders),
        axios.get(`http://localhost:4000/api/admin/employees?sortBy=${sortBy}`, authHeaders),
        axios.get('http://localhost:4000/api/admin/dimensions', authHeaders)
      ]);
      setSummary(resSummary.data);
      setEmployees(resEmployees.data.employees || []);
      setDimensions(resDimensions.data.dimensions || []);
    } catch (err) {
      console.error("Failed to load admin portal data:", err);
      setError(err.response?.data?.error || "Failed to load administrator portal data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [sortBy]);

  // Unique departments for filter
  const departments = ['ALL', ...Array.from(new Set(employees.map(e => e.department).filter(Boolean)))];

  // Client-side search and department filtering
  const filteredEmployees = employees.filter(emp => {
    if (selectedDept !== 'ALL' && emp.department !== selectedDept) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = emp.name?.toLowerCase().includes(q);
      const matchEmail = emp.email?.toLowerCase().includes(q);
      const matchId = emp.employeeId?.toLowerCase().includes(q);
      const matchDept = emp.department?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchId && !matchDept) return false;
    }
    return true;
  });

  if (loading && !summary) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <div className="bg-purple-100 p-4 rounded-2xl neo-border neo-shadow-sm animate-pulse mb-4">
          <RefreshCw className="w-8 h-8 text-purple-700 animate-spin" />
        </div>
        <h3 className="font-heading font-black text-xl mb-1">Loading Administrator Security Portal...</h3>
        <p className="text-black/60 text-sm font-medium">Aggregating enterprise telemetry and employee directory</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-900 neo-border px-3.5 py-1 rounded-full text-xs font-black neo-shadow-sm mb-2">
            <Shield className="w-3.5 h-3.5" /> ADMINISTRATOR SECURITY PORTAL
          </div>
          <h1 className="font-heading font-black text-3xl md:text-5xl text-slate-900">
            Enterprise Security Directory
          </h1>
          <p className="text-black/60 text-sm md:text-base font-medium mt-1">
            Audit employee prompt activities, evaluate threat dimensions, and inspect forensic reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowRegistryModal(true)}
            className="bg-white neo-border px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm neo-hover neo-shadow-sm flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-purple-600" />
            Security Dimensions Registry ({dimensions.length})
          </button>
          <button 
            onClick={fetchAdminData}
            className="bg-black text-white neo-border px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm neo-hover flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          <div className="bg-white neo-border neo-shadow rounded-2xl p-4">
            <span className="text-black/50 font-bold text-[10px] uppercase tracking-wider block mb-1">Total Employees</span>
            <div className="text-2xl md:text-3xl font-black font-heading">{summary.totalEmployees}</div>
            <span className="text-[10px] text-black/40 font-bold block mt-1">Directory size</span>
          </div>

          <div className="bg-purple-50 neo-border neo-shadow rounded-2xl p-4">
            <span className="text-purple-800 font-bold text-[10px] uppercase tracking-wider block mb-1">Active Scanned</span>
            <div className="text-2xl md:text-3xl font-black font-heading text-purple-950">{summary.activeEmployees}</div>
            <span className="text-[10px] text-purple-800/60 font-bold block mt-1">Employees with logs</span>
          </div>

          <div className="bg-white neo-border neo-shadow rounded-2xl p-4">
            <span className="text-black/50 font-bold text-[10px] uppercase tracking-wider block mb-1">Total Scans</span>
            <div className="text-2xl md:text-3xl font-black font-heading">{summary.totalAnalyses}</div>
            <span className="text-[10px] text-black/40 font-bold block mt-1">Prompts intercepted</span>
          </div>

          <div className="bg-blue-50 neo-border neo-shadow rounded-2xl p-4">
            <span className="text-blue-800 font-bold text-[10px] uppercase tracking-wider block mb-1">Sanitized Rewrites</span>
            <div className="text-2xl md:text-3xl font-black font-heading text-blue-700">{summary.actionBreakdown.sanitized}</div>
            <span className="text-[10px] text-blue-800/60 font-bold block mt-1">Safe replacements</span>
          </div>

          <div className="bg-red-50 neo-border neo-shadow rounded-2xl p-4">
            <span className="text-red-800 font-bold text-[10px] uppercase tracking-wider block mb-1">Blocked Attacks</span>
            <div className="text-2xl md:text-3xl font-black font-heading text-red-600">{summary.actionBreakdown.blocked}</div>
            <span className="text-[10px] text-red-800/60 font-bold block mt-1">Critical threats</span>
          </div>

          <div className="bg-emerald-50 neo-border neo-shadow rounded-2xl p-4">
            <span className="text-emerald-800 font-bold text-[10px] uppercase tracking-wider block mb-1">Avg Latency</span>
            <div className="text-2xl md:text-3xl font-black font-heading text-emerald-800">{summary.avgLatency}ms</div>
            <span className="text-[10px] text-emerald-800/60 font-bold block mt-1">Guardrail overhead</span>
          </div>
        </div>
      )}

      {/* Employee Directory Section */}
      <div className="bg-white neo-border neo-shadow rounded-2xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 border-b border-black/10 pb-4">
          <div>
            <h2 className="font-heading font-black text-2xl md:text-3xl">Employee Directory</h2>
            <p className="text-xs text-black/50 font-bold mt-0.5">
              Select an employee to open their dedicated Security Analytics Dashboard
            </p>
          </div>

          {/* Directory Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="flex items-center bg-slate-50 neo-border rounded-xl px-3 py-2 text-xs font-bold w-full sm:w-64">
              <Search className="w-4 h-4 text-black/40 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Search name, ID, department..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none w-full font-medium"
              />
            </div>

            {/* Department Filter */}
            <select 
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="bg-slate-50 neo-border rounded-xl px-3 py-2 text-xs font-bold outline-none"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'ALL' ? 'All Departments' : dept}
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <select 
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-slate-50 neo-border rounded-xl px-3 py-2 text-xs font-bold outline-none"
            >
              <option value="threats">Sort: Highest Threat Velocity</option>
              <option value="analyses">Sort: Most Scans</option>
              <option value="recent">Sort: Recently Active</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[760px]">
            <thead className="bg-slate-50 border-b-2 border-black/10">
              <tr>
                <th className="p-4 font-bold uppercase tracking-wider text-[11px] text-black/60">Employee</th>
                <th className="p-4 font-bold uppercase tracking-wider text-[11px] text-black/60">Department & Title</th>
                <th className="p-4 font-bold uppercase tracking-wider text-[11px] text-black/60">Total Scans</th>
                <th className="p-4 font-bold uppercase tracking-wider text-[11px] text-black/60">Decision Breakdown</th>
                <th className="p-4 font-bold uppercase tracking-wider text-[11px] text-black/60">Risk Summary</th>
                <th className="p-4 font-bold uppercase tracking-wider text-[11px] text-black/60">Last Active</th>
                <th className="p-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center font-bold text-black/40 text-sm">
                    No employees matched your search query.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => {
                  const s = emp.stats;
                  return (
                    <tr key={emp._id} className="hover:bg-purple-50/40 transition-colors group">
                      {/* Name & ID */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-purple-200 neo-border flex items-center justify-center font-black text-xs text-purple-900 shrink-0">
                            {emp.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-heading font-black text-sm text-slate-900 group-hover:text-purple-700 transition-colors">
                              {emp.name}
                            </div>
                            <div className="text-[11px] font-mono font-bold text-black/50">
                              {emp.employeeId} • {emp.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="p-4">
                        <div className="font-bold text-xs text-slate-800">{emp.department}</div>
                        <div className="text-[11px] text-black/50 font-medium">{emp.title}</div>
                      </td>

                      {/* Total Scans */}
                      <td className="p-4 font-mono font-bold text-sm">
                        {s.totalAnalyses}
                      </td>

                      {/* Mini Decision Badges */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
                          <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-300" title="Allowed">
                            {s.allowed} A
                          </span>
                          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300" title="Warned">
                            {s.warned} W
                          </span>
                          <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded border border-blue-300" title="Sanitized">
                            {s.sanitized} S
                          </span>
                          <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded border border-red-300" title="Blocked">
                            {s.blocked} B
                          </span>
                        </div>
                      </td>

                      {/* Risk Summary */}
                      <td className="p-4">
                        {s.highRisk > 0 ? (
                          <span className="inline-flex items-center gap-1 text-red-700 font-bold text-xs bg-red-100 px-2 py-0.5 rounded-full border border-red-300">
                            <ShieldAlert className="w-3 h-3" /> {s.highRisk} High/Critical
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                            <CheckCircle className="w-3 h-3" /> Nominal
                          </span>
                        )}
                      </td>

                      {/* Last Active */}
                      <td className="p-4 text-xs font-mono text-black/60">
                        {emp.lastActive ? new Date(emp.lastActive).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                      </td>

                      {/* Action */}
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => onSelectEmployee(emp.employeeId || emp._id)}
                          className="bg-purple-100 hover:bg-purple-200 text-purple-950 neo-border px-3.5 py-1.5 rounded-full font-heading font-black text-xs neo-shadow-sm neo-hover inline-flex items-center gap-1.5 transition-all"
                        >
                          View Analytics <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Extensible Security Dimensions Registry Modal */}
      {showRegistryModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white neo-border neo-shadow rounded-[24px] p-6 md:p-8 w-full max-w-4xl max-h-[90vh] flex flex-col relative">
            <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full neo-border">
                  ARCHITECTURAL REGISTRY
                </span>
                <h2 className="font-heading font-black text-2xl md:text-3xl mt-1">
                  Centralized Security Dimensions Registry
                </h2>
                <p className="text-xs text-black/60 font-medium">
                  Aegis dynamically incorporates new criteria across prompt, privacy, threat, and operational categories.
                </p>
              </div>
              <button 
                onClick={() => setShowRegistryModal(false)}
                className="bg-slate-100 neo-border p-2 rounded-full font-black text-sm hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {dimensions.map((dim) => (
                <div 
                  key={dim.id} 
                  className={`p-4 rounded-xl border neo-border ${dim.status === 'IMPLEMENTED' ? 'bg-white' : 'bg-slate-50 border-dashed'}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm">{dim.displayName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        dim.status === 'IMPLEMENTED' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-slate-200 text-slate-700 border border-slate-300'
                      }`}>
                        {dim.status}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono bg-purple-50 text-purple-900 border border-purple-200 px-2 py-0.5 rounded font-bold self-start sm:self-auto">
                      {dim.category}
                    </span>
                  </div>

                  <p className="text-xs text-black/70 font-medium mb-3">
                    {dim.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-black/60 bg-slate-50 p-2 rounded-lg border border-black/5">
                    <div><span className="font-bold text-black/40">DATA SOURCE:</span> {dim.dataSource}</div>
                    <div><span className="font-bold text-black/40">SEVERITY:</span> {dim.severityMapping}</div>
                    <div><span className="font-bold text-black/40">METRIC:</span> {dim.supportedMeasurement}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-black/10 pt-4 mt-4 flex justify-end">
              <button 
                onClick={() => setShowRegistryModal(false)}
                className="bg-black text-white px-6 py-2 rounded-xl font-bold text-sm neo-hover"
              >
                Close Registry
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

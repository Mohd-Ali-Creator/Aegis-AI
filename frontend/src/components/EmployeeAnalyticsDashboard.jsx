import React, { useState, useEffect } from 'react';
import { 
  Shield, ShieldAlert, ArrowLeft, Download, Filter, Search, 
  Activity, AlertTriangle, CheckCircle, Clock, Database, 
  Layers, Lock, User, FileText, ChevronRight, Eye, RefreshCw 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area
} from 'recharts';
import axios from 'axios';

export default function EmployeeAnalyticsDashboard({ 
  employeeId, 
  onBack, 
  onViewReport 
}) {
  const [data, setData] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters for History
  const [filterAction, setFilterAction] = useState('ALL');
  const [filterRiskLevel, setFilterRiskLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllDimensions, setShowAllDimensions] = useState(false);

  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resAnalytics, resHistory] = await Promise.all([
        axios.get(`http://localhost:4000/api/admin/employees/${employeeId}/analytics`, authHeaders),
        axios.get(`http://localhost:4000/api/admin/employees/${employeeId}/history`, authHeaders)
      ]);
      setData(resAnalytics.data);
      setHistoryLogs(resHistory.data.logs || []);
    } catch (err) {
      console.error("Failed to load employee analytics:", err);
      setError(err.response?.data?.error || "Failed to load employee analytics data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <div className="bg-purple-100 p-4 rounded-2xl neo-border neo-shadow-sm animate-pulse mb-4">
          <RefreshCw className="w-8 h-8 text-purple-700 animate-spin" />
        </div>
        <h3 className="font-heading font-black text-xl mb-1">Loading Employee Security Telemetry...</h3>
        <p className="text-black/60 text-sm font-medium">Aggregating evidence, forensic dimensions, and risk scores</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <button onClick={onBack} className="flex items-center gap-2 font-bold mb-6 hover:underline text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Employee Directory
        </button>
        <div className="bg-red-50 neo-border neo-shadow rounded-2xl p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="font-heading font-black text-2xl text-red-900 mb-2">Analytics Error</h3>
          <p className="text-red-700 font-medium mb-6">{error || "Could not retrieve employee profile."}</p>
          <button onClick={fetchAnalytics} className="bg-black text-white px-6 py-2 rounded-xl font-bold neo-hover">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { employee, summary, decisionDistribution, dimensionsBreakdown, timeline } = data;

  // Filtered logs
  const filteredLogs = historyLogs.filter(log => {
    const s = log.security;
    if (!s) return false;
    if (filterAction !== 'ALL' && s.action !== filterAction) return false;
    if (filterRiskLevel !== 'ALL' && s.risk_level !== filterRiskLevel) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPrompt = s.original_prompt?.toLowerCase().includes(q);
      const matchRedacted = s.redacted_prompt?.toLowerCase().includes(q);
      if (!matchPrompt && !matchRedacted) return false;
    }
    return true;
  });

  const displayedDimensions = showAllDimensions 
    ? dimensionsBreakdown 
    : dimensionsBreakdown.slice(0, 6);

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <button 
            onClick={onBack} 
            className="inline-flex items-center gap-2 bg-white neo-border px-4 py-1.5 rounded-full font-bold text-xs neo-shadow-sm neo-hover mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
          </button>
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-black text-3xl md:text-4xl text-slate-900">
              {employee.name}
            </h1>
            <span className="bg-purple-100 text-purple-900 font-mono font-bold text-xs px-3 py-1 rounded-full neo-border">
              {employee.employeeId}
            </span>
          </div>
          <p className="text-black/60 font-medium text-sm mt-1">
            {employee.title} • <span className="font-bold text-black/80">{employee.department}</span> • {employee.email}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAnalytics}
            className="bg-white neo-border px-4 py-2 rounded-xl font-bold text-xs neo-hover neo-shadow-sm flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white neo-border neo-shadow rounded-2xl p-4 md:p-5">
          <span className="text-black/50 font-bold text-[11px] uppercase tracking-wider block mb-1">Total Analyses</span>
          <div className="text-3xl md:text-4xl font-black font-heading">{summary.totalAnalyses}</div>
          <span className="text-[10px] text-black/40 font-bold uppercase mt-1 block">Prompts Intercepted</span>
        </div>

        <div className="bg-red-50 neo-border neo-shadow rounded-2xl p-4 md:p-5">
          <span className="text-red-700 font-bold text-[11px] uppercase tracking-wider block mb-1">High-Risk Incidents</span>
          <div className="text-3xl md:text-4xl font-black font-heading text-red-600">{summary.highRiskCount}</div>
          <span className="text-[10px] text-red-700/60 font-bold uppercase mt-1 block">High & Critical Levels</span>
        </div>

        <div className="bg-blue-50 neo-border neo-shadow rounded-2xl p-4 md:p-5">
          <span className="text-blue-700 font-bold text-[11px] uppercase tracking-wider block mb-1">Sanitized Rewrites</span>
          <div className="text-3xl md:text-4xl font-black font-heading text-blue-700">{summary.decisions.sanitized}</div>
          <span className="text-[10px] text-blue-700/60 font-bold uppercase mt-1 block">Payloads Neutralized</span>
        </div>

        <div className="bg-purple-50 neo-border neo-shadow rounded-2xl p-4 md:p-5">
          <span className="text-purple-700 font-bold text-[11px] uppercase tracking-wider block mb-1">Mean Risk Score</span>
          <div className="text-3xl md:text-4xl font-black font-heading text-purple-900">
            {(summary.avgRiskScore * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] text-purple-700/60 font-bold uppercase mt-1 block">Evidence-Based Risk</span>
        </div>

        <div className="bg-emerald-50 neo-border neo-shadow rounded-2xl p-4 md:p-5 col-span-2 lg:col-span-1">
          <span className="text-emerald-700 font-bold text-[11px] uppercase tracking-wider block mb-1">Avg Analysis Latency</span>
          <div className="text-3xl md:text-4xl font-black font-heading text-emerald-800">
            {summary.avgLatencyMs.toFixed(1)}ms
          </div>
          <span className="text-[10px] text-emerald-700/60 font-bold uppercase mt-1 block">Sub-100ms Guardrail</span>
        </div>
      </div>

      {/* Main Charts Row: Pie Chart & Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* CHART B: Security Decision Pie Chart */}
        <div className="lg:col-span-5 bg-white neo-border neo-shadow rounded-2xl p-6 flex flex-col min-h-[380px]">
          <div className="flex items-center justify-between mb-4 border-b border-black/10 pb-3">
            <div>
              <h3 className="font-heading font-black text-xl">Security Decision Distribution</h3>
              <p className="text-xs text-black/50 font-bold mt-0.5">Enforcement breakdown for this employee</p>
            </div>
            <span className="bg-slate-100 neo-border px-2.5 py-1 rounded-full text-[10px] font-mono font-bold">
              {summary.totalAnalyses} records
            </span>
          </div>

          <div className="flex-1 min-h-[200px] flex items-center justify-center">
            {summary.totalAnalyses === 0 ? (
              <div className="text-center font-bold text-black/40 text-sm">No activity records found.</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={decisionDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="#1e293b"
                    strokeWidth={1.5}
                  >
                    {decisionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '2px solid #1e293b', 
                      borderRadius: '12px', 
                      boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', 
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Decision Legend Table */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-black/10">
            {decisionDistribution.map((d, i) => {
              const pct = summary.totalAnalyses > 0 ? ((d.value / summary.totalAnalyses) * 100).toFixed(0) : 0;
              return (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-black/10 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full neo-border" style={{ backgroundColor: d.color }}></span>
                    <span className="font-bold text-slate-800">{d.name}</span>
                  </div>
                  <div className="font-mono font-bold">
                    <span>{d.value}</span> <span className="text-black/40 text-[10px]">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHART C: Multi-Dimension Security Analytics Bar Chart */}
        <div className="lg:col-span-7 bg-white neo-border neo-shadow rounded-2xl p-6 flex flex-col min-h-[380px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-black/10 pb-3 gap-2">
            <div>
              <h3 className="font-heading font-black text-xl">Security Dimensions Breakdown</h3>
              <p className="text-xs text-black/50 font-bold mt-0.5">
                Evaluated from Aegis Extensible Registry (Regex, ML, Multi-Modal)
              </p>
            </div>
            <button 
              onClick={() => setShowAllDimensions(!showAllDimensions)}
              className="text-xs font-bold text-purple-700 hover:underline self-start sm:self-auto"
            >
              {showAllDimensions ? 'Show Top 6' : `Show All (${dimensionsBreakdown.length})`}
            </button>
          </div>

          <div className="flex-1 min-h-[220px]">
            {displayedDimensions.length === 0 ? (
              <div className="h-full flex items-center justify-center font-bold text-black/40 text-sm">
                No threat criteria flagged for this employee.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={displayedDimensions} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#000" fontSize={11} allowDecimals={false} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={160} 
                    stroke="#000" 
                    fontSize={10} 
                    tickFormatter={(val) => val.length > 22 ? val.substring(0, 22) + '...' : val} 
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '2px solid #1e293b', 
                      borderRadius: '12px', 
                      boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', 
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}
                    formatter={(val, name, props) => [`${val} detections`, `${props.payload.category} (${props.payload.severity})`]}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} stroke="#000" strokeWidth={1.5} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="text-[11px] font-mono text-black/50 bg-slate-50 p-2.5 rounded-xl border border-black/10 mt-2">
            💡 <strong className="text-black">Dynamic Registry Notice:</strong> Evaluates all verified dimensions including PII, Prompt Injection, Jailbreaks, SQL Destruction, and ML Semantic Intent without fixed 4-dimension limits.
          </div>
        </div>

      </div>

      {/* Row 3: Historical Trends (CHART D) & Risk Model Breakdown (E) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* CHART D: Historical Trend Visualization */}
        <div className="lg:col-span-7 bg-white neo-border neo-shadow rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-black/10 pb-3">
            <div>
              <h3 className="font-heading font-black text-xl">Historical Activity & Threat Velocity</h3>
              <p className="text-xs text-black/50 font-bold mt-0.5">Daily time-series of total requests vs. security events</p>
            </div>
          </div>

          <div className="flex-1 min-h-[200px]">
            {timeline.length === 0 ? (
              <div className="h-48 flex items-center justify-center font-bold text-black/40 text-sm">
                Insufficient timestamped data for trend visualization.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={timeline} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#000" fontSize={11} />
                  <YAxis stroke="#000" fontSize={11} allowDecimals={false} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '2px solid #1e293b', 
                      borderRadius: '12px', 
                      boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', 
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}
                  />
                  <Area type="monotone" dataKey="total" name="Total Scans" stroke="#000" fill="#f3e8ff" strokeWidth={2} />
                  <Area type="monotone" dataKey="threats" name="Security Events" stroke="#ef4444" fill="#fee2e2" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* E. Risk Model & Severity Breakdown */}
        <div className="lg:col-span-5 bg-white neo-border neo-shadow rounded-2xl p-6 flex flex-col">
          <div className="border-b border-black/10 pb-3 mb-4">
            <h3 className="font-heading font-black text-xl">Risk Classification Model</h3>
            <p className="text-xs text-black/50 font-bold mt-0.5">Evidence-based severity & confidence separation</p>
          </div>

          <div className="space-y-3 flex-1">
            {[
              { level: 'SAFE', score: '0.0%', count: summary.severities.safeCount, color: 'bg-emerald-100 text-emerald-800 border-emerald-400', desc: 'No threat indicators detected' },
              { level: 'LOW', score: '< 40%', count: summary.severities.lowCount, color: 'bg-teal-100 text-teal-800 border-teal-400', desc: 'PII redacted, benign intent' },
              { level: 'MEDIUM', score: '< 70%', count: summary.severities.mediumCount, color: 'bg-amber-100 text-amber-800 border-amber-400', desc: 'Ambiguous ML intent or evasion pattern' },
              { level: 'HIGH', score: '< 90%', count: summary.severities.highCount, color: 'bg-rose-100 text-rose-800 border-rose-400', desc: 'Instruction override, safe rewrite applied' },
              { level: 'CRITICAL', score: '>= 90%', count: summary.severities.criticalCount, color: 'bg-red-200 text-red-950 border-red-500', desc: 'Malicious links, direct destruction attempt' }
            ].map((sev, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-black/10 bg-slate-50 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md font-black text-[10px] border ${sev.color}`}>
                    {sev.level}
                  </span>
                  <span className="text-black/60 font-medium">{sev.desc}</span>
                </div>
                <div className="font-mono font-bold text-right">
                  <span className="text-black">{sev.count}</span> <span className="text-black/40 text-[10px]">({sev.score})</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-black/10 text-[11px] text-black/60">
            <strong>Architecture Rule:</strong> Risk Score (threat severity) and Confidence (evidence certainty) are maintained as strictly separate metrics.
          </div>
        </div>

      </div>

      {/* Row 4: Reports and Prompt Analysis History for Employee */}
      <div className="bg-white neo-border neo-shadow rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-black/10 pb-4">
          <div>
            <h3 className="font-heading font-black text-2xl">Authorized Scan History & Reports</h3>
            <p className="text-xs text-black/50 font-bold mt-0.5">
              Inspect granular payload telemetry, indicators, and forensic reports for {employee.name}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="flex items-center bg-slate-50 neo-border rounded-xl px-3 py-1.5 text-xs font-bold w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-black/40 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Search prompt payload..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none w-full font-medium"
              />
            </div>

            {/* Action Filter */}
            <select 
              value={filterAction} 
              onChange={e => setFilterAction(e.target.value)}
              className="bg-slate-50 neo-border rounded-xl px-3 py-1.5 text-xs font-bold outline-none"
            >
              <option value="ALL">All Actions</option>
              <option value="ALLOWED">Allowed</option>
              <option value="WARNED">Warned</option>
              <option value="SANITIZED">Sanitized</option>
              <option value="BLOCKED">Blocked</option>
            </select>

            {/* Risk Level Filter */}
            <select 
              value={filterRiskLevel} 
              onChange={e => setFilterRiskLevel(e.target.value)}
              className="bg-slate-50 neo-border rounded-xl px-3 py-1.5 text-xs font-bold outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="SAFE">Safe</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-slate-50 border-b-2 border-black/10">
              <tr>
                <th className="p-3 font-bold uppercase tracking-wider text-[11px] text-black/60">Time</th>
                <th className="p-3 font-bold uppercase tracking-wider text-[11px] text-black/60">Risk</th>
                <th className="p-3 font-bold uppercase tracking-wider text-[11px] text-black/60">Action</th>
                <th className="p-3 font-bold uppercase tracking-wider text-[11px] text-black/60">Prompt Preview</th>
                <th className="p-3 font-bold uppercase tracking-wider text-[11px] text-black/60">Indicators Flagged</th>
                <th className="p-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center font-bold text-black/40 text-sm">
                    No prompt scans matching selected criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const s = log.security;
                  return (
                    <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono text-xs font-bold text-black/70">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black neo-border ${
                          s.risk_level === 'SAFE' ? 'text-emerald-800 bg-emerald-100' :
                          s.risk_level === 'LOW' ? 'text-teal-800 bg-teal-100' :
                          s.risk_level === 'MEDIUM' ? 'text-amber-800 bg-amber-100' :
                          s.risk_level === 'HIGH' ? 'text-rose-800 bg-rose-100' :
                          'text-red-950 bg-red-200'
                        }`}>
                          {s.risk_level} ({(s.risk_score * 100).toFixed(0)}%)
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-black text-xs ${
                          s.action === 'BLOCKED' ? 'text-red-600' :
                          s.action === 'SANITIZED' ? 'text-blue-600' :
                          s.action === 'WARNED' ? 'text-amber-600' :
                          'text-emerald-600'
                        }`}>
                          {s.action}
                        </span>
                      </td>
                      <td className="p-3 text-xs font-mono font-medium truncate max-w-xs text-black/80">
                        {s.action === 'SANITIZED' ? (
                          <span>
                            <span className="line-through text-black/40 mr-1">{s.original_prompt?.substring(0, 30)}...</span>
                            <span className="text-blue-700 font-bold">{s.redacted_prompt}</span>
                          </span>
                        ) : (
                          s.original_prompt
                        )}
                      </td>
                      <td className="p-3 text-xs">
                        {s.threat_reasons?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {s.threat_reasons.slice(0, 2).map((r, i) => (
                              <span key={i} className="bg-slate-100 border border-black/10 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold">
                                {typeof r === 'object' ? r.type : r}
                              </span>
                            ))}
                            {s.threat_reasons.length > 2 && (
                              <span className="text-[10px] font-bold text-black/40">+{s.threat_reasons.length - 2}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-emerald-600 font-bold text-[11px]">✓ Clean</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={() => onViewReport(log._id)} 
                          className="bg-white neo-border px-3 py-1.5 rounded-full font-bold text-xs neo-hover neo-shadow-sm inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> Inspect
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

    </div>
  );
}

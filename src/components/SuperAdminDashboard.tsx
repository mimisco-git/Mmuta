import React, { useState, useEffect } from "react";
import {
  Building2, Users, GraduationCap, BookOpen, BarChart2,
  PlusCircle, Pencil, Trash2, ToggleLeft, ToggleRight,
  LogOut, CheckCircle, AlertTriangle, X, Save, School, CreditCard,
} from "lucide-react";
import { School as SchoolType } from "../types";

interface SuperAdminDashboardProps {
  token: string;
  user: any;
  onLogout: () => void;
}

type Tab = "schools" | "stats" | "add-school";

interface Stats {
  totalSchools: number;
  totalStudents: number;
  totalLecturers: number;
  totalExams: number;
}

interface EditingSchool {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string;
}

export default function SuperAdminDashboard({ token, user, onLogout }: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("schools");
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Add school form
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Inline edit
  const [editingSchool, setEditingSchool] = useState<EditingSchool | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Credits top-up
  const [creditingSchool, setCreditingSchool] = useState<{ id: string; name: string } | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditLoading, setCreditLoading] = useState(false);

  const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };
  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4000);
  };

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/schools", { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setSchools(data);
      else showError(data.error || "Failed to load schools");
    } catch {
      showError("Network error loading schools");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/super-admin/stats", { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch {}
  };

  useEffect(() => {
    fetchSchools();
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) {
      showError("School name and code are required.");
      return;
    }
    setAddLoading(true);
    try {
      const res = await fetch("/api/super-admin/schools", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ name: newName, code: newCode, email: newEmail, phone: newPhone, address: newAddress }),
      });
      const data = await res.json();
      if (!res.ok) { showError(data.error || "Failed to create school"); return; }
      showSuccess(`School "${data.name}" created.`);
      setNewName(""); setNewCode(""); setNewEmail(""); setNewPhone(""); setNewAddress("");
      await fetchSchools();
      await fetchStats();
      setActiveTab("schools");
    } catch {
      showError("Network error");
    } finally {
      setAddLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await fetch(`/api/super-admin/schools/${id}/toggle`, { method: "PATCH", headers: authHeaders });
      const data = await res.json();
      if (!res.ok) { showError(data.error || "Failed to toggle"); return; }
      showSuccess(`School is now ${data.isActive ? "Active" : "Inactive"}.`);
      await fetchSchools();
    } catch {
      showError("Network error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/super-admin/schools/${id}`, { method: "DELETE", headers: authHeaders });
      const data = await res.json();
      if (!res.ok) { showError(data.error || "Failed to delete"); return; }
      showSuccess("School deleted.");
      setDeleteId(null);
      await fetchSchools();
      await fetchStats();
    } catch {
      showError("Network error");
    }
  };

  const handleAddCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditingSchool) return;
    const amount = parseInt(creditAmount);
    if (!amount || amount <= 0) { showError("Enter a positive credit amount"); return; }
    setCreditLoading(true);
    try {
      const res = await fetch(`/api/super-admin/schools/${creditingSchool.id}/credits/add`, {
        method: "POST", headers: authHeaders,
        body: JSON.stringify({ amount, description: `Admin top-up: +${amount} credits` }),
      });
      const data = await res.json();
      if (!res.ok) { showError(data.error || "Failed to add credits"); return; }
      showSuccess(`Added ${amount} credits to ${creditingSchool.name}. New balance: ${data.newBalance}`);
      setCreditingSchool(null); setCreditAmount("");
      await fetchSchools();
    } catch { showError("Network error"); }
    finally { setCreditLoading(false); }
  };

  const openEdit = (school: SchoolType) => {
    setEditingSchool({
      id: school.id,
      name: school.name,
      code: school.code,
      email: school.email || "",
      phone: school.phone || "",
      address: school.address || "",
    });
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchool) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/super-admin/schools/${editingSchool.id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          name: editingSchool.name,
          code: editingSchool.code,
          email: editingSchool.email,
          phone: editingSchool.phone,
          address: editingSchool.address,
        }),
      });
      const data = await res.json();
      if (!res.ok) { showError(data.error || "Update failed"); return; }
      showSuccess("School updated.");
      setEditingSchool(null);
      await fetchSchools();
    } catch {
      showError("Network error");
    } finally {
      setEditLoading(false);
    }
  };

  // ── CSS shortcuts
  const inpCls = "w-full px-3 py-2 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500";
  const lblCls = "block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1";
  const tabCls = (t: Tab) =>
    `px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
      activeTab === t
        ? "bg-emerald-600 text-white shadow"
        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" className="h-8 w-8 rounded-lg" alt="Mmuta" onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          <div>
            <h1 className="text-[15px] font-bold text-slate-800 dark:text-white">Mmuta Super Admin</h1>
            <p className="text-[11px] text-slate-400">{user?.email || user?.name}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </header>

      {/* Alerts */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {successMsg && (
          <div className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium pointer-events-auto">
            <CheckCircle className="h-4 w-4 shrink-0" /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium pointer-events-auto">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {errorMsg}
          </div>
        )}
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button className={tabCls("schools")} onClick={() => setActiveTab("schools")}>
            <School className="h-3.5 w-3.5 inline mr-1.5" />Schools
          </button>
          <button className={tabCls("stats")} onClick={() => setActiveTab("stats")}>
            <BarChart2 className="h-3.5 w-3.5 inline mr-1.5" />Stats
          </button>
          <button className={tabCls("add-school")} onClick={() => setActiveTab("add-school")}>
            <PlusCircle className="h-3.5 w-3.5 inline mr-1.5" />Add School
          </button>
        </div>

        {/* ── SCHOOLS TAB ── */}
        {activeTab === "schools" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 dark:text-white">Registered Schools</h2>
              <button
                onClick={() => { fetchSchools(); fetchStats(); }}
                className="text-xs text-emerald-600 hover:text-emerald-500 font-semibold cursor-pointer"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm">Loading schools…</div>
            ) : schools.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">No schools yet. Add the first one.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-left">
                      <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">School</th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Code</th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Students</th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Lecturers</th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Courses</th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Credits</th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Status</th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {schools.map(school => (
                      <tr key={school.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="font-semibold text-slate-800 dark:text-white">{school.name}</div>
                          {school.email && <div className="text-xs text-slate-400 mt-0.5">{school.email}</div>}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{school.code}</span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{school._count?.students ?? 0}</td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{school._count?.lecturers ?? 0}</td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{school._count?.courses ?? 0}</td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                            {school.creditBalance ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            school.isActive
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                          }`}>
                            {school.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => { setCreditingSchool({ id: school.id, name: school.name }); setCreditAmount(""); }}
                              className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                              title="Add Credits"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openEdit(school)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggle(school.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                              title={school.isActive ? "Deactivate" : "Activate"}
                            >
                              {school.isActive ? <ToggleRight className="h-3.5 w-3.5 text-emerald-500" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                            </button>
                            <button
                              onClick={() => setDeleteId(school.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── STATS TAB ── */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 dark:text-white text-lg">Platform Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Building2, label: "Total Schools", value: stats?.totalSchools ?? "—", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                { icon: Users, label: "Total Students", value: stats?.totalStudents ?? "—", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
                { icon: GraduationCap, label: "Total Lecturers", value: stats?.totalLecturers ?? "—", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
                { icon: BookOpen, label: "Total Exams", value: stats?.totalExams ?? "—", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-3">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                    <p className={`text-2xl font-black mt-0.5 ${color}`}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {stats && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">School Breakdown</h3>
                <div className="space-y-2">
                  {schools.map(s => (
                    <div key={s.id} className="flex items-center gap-3 text-sm">
                      <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded w-16 text-center shrink-0">{s.code}</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 flex-1 truncate">{s.name}</span>
                      <span className="text-slate-400 text-xs">{s._count?.students ?? 0} students · {s._count?.lecturers ?? 0} lecturers</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${s.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-400 dark:bg-slate-700"}`}>
                        {s.isActive ? "ON" : "OFF"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ADD SCHOOL TAB ── */}
        {activeTab === "add-school" && (
          <div className="max-w-lg">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="font-bold text-slate-800 dark:text-white mb-5">Register New School</h2>
              <form onSubmit={handleAddSchool} className="space-y-4">
                <div>
                  <label className={lblCls}>School Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Federal University of Technology, Owerri"
                    className={inpCls}
                  />
                </div>
                <div>
                  <label className={lblCls}>Short Code * (used for login)</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={e => setNewCode(e.target.value.toUpperCase())}
                    placeholder="FUTO"
                    maxLength={10}
                    className={inpCls + " font-mono uppercase"}
                  />
                </div>
                <div>
                  <label className={lblCls}>Official Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="info@school.edu.ng"
                    className={inpCls}
                  />
                </div>
                <div>
                  <label className={lblCls}>Phone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className={inpCls}
                  />
                </div>
                <div>
                  <label className={lblCls}>Address</label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={e => setNewAddress(e.target.value)}
                    placeholder="PMB 1526, Owerri, Imo State"
                    className={inpCls}
                  />
                </div>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                  {addLoading ? "Creating…" : "Create School"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 dark:text-white">Edit School</h3>
              <button onClick={() => setEditingSchool(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="space-y-3.5">
              <div>
                <label className={lblCls}>School Name *</label>
                <input type="text" required value={editingSchool.name} onChange={e => setEditingSchool(s => s ? { ...s, name: e.target.value } : s)} className={inpCls} />
              </div>
              <div>
                <label className={lblCls}>Short Code *</label>
                <input type="text" required value={editingSchool.code} onChange={e => setEditingSchool(s => s ? { ...s, code: e.target.value.toUpperCase() } : s)} maxLength={10} className={inpCls + " font-mono uppercase"} />
              </div>
              <div>
                <label className={lblCls}>Email</label>
                <input type="email" value={editingSchool.email} onChange={e => setEditingSchool(s => s ? { ...s, email: e.target.value } : s)} className={inpCls} />
              </div>
              <div>
                <label className={lblCls}>Phone</label>
                <input type="text" value={editingSchool.phone} onChange={e => setEditingSchool(s => s ? { ...s, phone: e.target.value } : s)} className={inpCls} />
              </div>
              <div>
                <label className={lblCls}>Address</label>
                <input type="text" value={editingSchool.address} onChange={e => setEditingSchool(s => s ? { ...s, address: e.target.value } : s)} className={inpCls} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setEditingSchool(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={editLoading} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer">
                  <Save className="h-4 w-4" />
                  {editLoading ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credits Top-Up Modal */}
      {creditingSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Add Exam Credits</h3>
                <p className="text-[12px] text-slate-400 mt-0.5">{creditingSchool.name}</p>
              </div>
              <button onClick={() => setCreditingSchool(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddCredits} className="space-y-4">
              <div>
                <label className={lblCls}>Number of Credits to Add</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={creditAmount}
                  onChange={e => setCreditAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className={inpCls}
                  autoFocus
                />
                <p className="text-[11px] text-slate-400 mt-1.5">Each exam or quiz attempt costs 1 credit.</p>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setCreditingSchool(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={creditLoading} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer">
                  <CreditCard className="h-4 w-4" />
                  {creditLoading ? "Adding…" : "Add Credits"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-1">Delete School?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              This will permanently delete the school and all associated data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors cursor-pointer">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

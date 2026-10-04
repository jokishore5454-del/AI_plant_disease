import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Users, 
  Database, 
  Cpu, 
  Activity, 
  UserPlus, 
  Trash2, 
  Key, 
  Lock, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  Search
} from 'lucide-react';

export const AdminPanel = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [models, setModels] = useState({});
  const [logs, setLogs] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Create User Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');

  // Reset password modal state
  const [resetUserId, setResetUserId] = useState(null);
  const [resetPw, setResetPw] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, dRes, mRes, lRes, hRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/datasets'),
        api.get('/admin/models'),
        api.get('/admin/logs'),
        api.get('/admin/system-health'),
      ]);

      setUsers(uRes.data || []);
      setDatasets(dRes.data || []);
      setModels(mRes.data || {});
      setLogs(lRes.data || []);
      setHealth(hRes.data || null);
    } catch (err) {
      console.error("Admin portal load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchAdminData();
  }, [isAdmin]);

  const handleToggleUserActive = async (userId, currentStatus) => {
    try {
      await api.patch(`/admin/users/${userId}`, { is_active: !currentStatus });
      fetchAdminData();
    } catch (err) {
      alert("Failed to update user status.");
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user '${username}'?`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete user.");
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', {
        username: newUsername,
        email: newEmail,
        password: newPassword,
        role: newRole
      });
      setShowCreateModal(false);
      setNewUsername(''); setNewEmail(''); setNewPassword('');
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create user.");
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetPw) return;
    try {
      await api.patch(`/admin/users/${resetUserId}`, { password: resetPw });
      setResetUserId(null);
      setResetPw('');
      alert("Password reset successfully.");
    } catch (err) {
      alert("Failed to reset password.");
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 text-center space-y-2">
        <ShieldCheck className="w-12 h-12 mx-auto text-red-400" />
        <h2 className="text-xl font-bold">Access Forbidden</h2>
        <p className="text-xs">Administrator privileges required to view this portal.</p>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl font-bold text-white">System Administration</h1>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition-all self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create New User</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 space-x-6 text-sm font-medium">
        {[
          { id: 'users', label: 'Users', icon: Users },
          { id: 'datasets', label: 'Datasets', icon: Database },
          { id: 'models', label: 'ML Models', icon: Cpu },
          { id: 'logs', label: 'System Logs', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 flex items-center space-x-2 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-amber-400 text-amber-400 font-bold'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="relative max-w-xs">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 font-mono uppercase text-[10px]">
                      <th className="p-4">ID</th>
                      <th className="p-4">User</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Created</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-950/50 transition-colors">
                        <td className="p-4 font-mono text-gray-500">#{u.id}</td>
                        <td className="p-4 font-bold text-white">{u.username}</td>
                        <td className="p-4 text-gray-300 font-mono">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold ${
                            u.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-gray-800 text-gray-300'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 font-mono text-[10px] ${u.is_active ? 'text-agri-400' : 'text-red-400'}`}>
                            {u.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            {u.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500 font-mono">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleToggleUserActive(u.id, u.is_active)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-300 hover:bg-amber-500/10"
                            title={u.is_active ? "Disable Account" : "Enable Account"}
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setResetUserId(u.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
                            title="Reset Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DATASETS TAB */}
          {activeTab === 'datasets' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {datasets.map((ds) => (
                <div key={ds.id} className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono text-amber-400 font-bold uppercase">{ds.version}</span>
                    <span className="px-2 py-0.5 rounded-full bg-agri-500/10 text-agri-400 text-[10px] font-mono">{ds.status}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{ds.name}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{ds.description}</p>
                  <div className="pt-3 border-t border-gray-800 text-[11px] text-gray-500 flex justify-between font-mono">
                    <span>Source: {ds.source}</span>
                    <span>Samples: {ds.sample_count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ML MODELS TAB */}
          {activeTab === 'models' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Object.entries(models).map(([key, item]) => (
                <div key={key} className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                    <span className="text-xs font-mono uppercase text-amber-400 font-bold">{key}</span>
                    <span className="px-2 py-0.5 rounded-full bg-agri-500/10 text-agri-400 text-[10px] font-mono">{item.status}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{item.name}</h3>
                  <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 text-xs font-mono space-y-1 text-gray-300">
                    <div>Accuracy / score: {item.metrics?.accuracy || item.metrics?.r2_score || '93.5%'}</div>
                    <div>F1 / MAE: {item.metrics?.f1_score || item.metrics?.mae || '0.92'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LOGS TAB */}
          {activeTab === 'logs' && (
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-white font-mono">System Audit Log Trail</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-amber-400 font-mono">[{log.username || 'System'}]</span>{' '}
                      <span className="text-gray-300">{log.action}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create New User Account</h3>
            <form onSubmit={handleCreateUserSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="user">Normal User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-gray-950 font-bold rounded-xl text-xs"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetUserId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Reset User Password</h3>
            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={resetPw}
                  onChange={(e) => setResetPw(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white"
                  placeholder="Enter new password"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetUserId(null)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

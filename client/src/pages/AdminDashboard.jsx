import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { API_URL, APP_NAME } from '../config';
import { Users, FileText, Download, Trash2, ShieldAlert, Sparkles, Check, Clock, RefreshCw, LogOut } from 'lucide-react';

const AdminDashboard = () => {
  const { admin, isAdminAuthenticated, adminFetch, adminLogout } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAdminAuthenticated, navigate]);

  const [usersList, setUsersList] = useState([]);
  const [notesList, setNotesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch admin stats
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users
      const usersResponse = await adminFetch(`${API_URL}/api/auth/users`);
      if (!usersResponse.ok) {
        throw new Error('Failed to retrieve student registration logs.');
      }
      const usersData = await usersResponse.json();
      setUsersList(usersData);

      // Fetch notes
      const notesResponse = await fetch(`${API_URL}/api/notes`);
      if (!notesResponse.ok) {
        throw new Error('Failed to retrieve uploaded documents.');
      }
      const notesData = await notesResponse.json();
      setNotesList(notesData);

    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err.message || 'An error occurred while loading dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchAdminData();
    }
  }, [isAdminAuthenticated]);

  // Handle Document Delete
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to permanently delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      setSuccessMsg('');

      const response = await adminFetch(`${API_URL}/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete document.');
      }

      setSuccessMsg(data.message || 'Document deleted successfully.');
      
      // Update local state
      setNotesList(prev => prev.filter(n => n._id !== noteId));

      // Clear success message
      setTimeout(() => setSuccessMsg(''), 4000);

    } catch (err) {
      alert(err.message || 'An error occurred during deletion.');
    } finally {
      setActionLoading(false);
    }
  };

  // Calculations
  const totalDownloads = notesList.reduce((sum, note) => sum + (note.downloads || 0), 0);
  const planDistribution = usersList.reduce(
    (acc, u) => {
      acc[u.plan] = (acc[u.plan] || 0) + 1;
      return acc;
    },
    { Free: 0, Basic: 0, Pro: 0 }
  );

  if (!isAdminAuthenticated) {
    return null;
  }

  const handleAdminLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-ucp-gold/20 text-ucp-gold border border-ucp-gold/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                System Administrator
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1.5">{APP_NAME} Admin</h1>
            <p className="text-slate-500 font-medium text-sm">Monitor user registrations and moderate shared documents.</p>
          </div>

          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-ucp-blue text-slate-700 hover:text-ucp-blue text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Stats</span>
          </button>

          <button
            onClick={handleAdminLogout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Global Notifications */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-sm">
            <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <div className="text-xs font-extrabold">{successMsg}</div>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-sm">
            <ShieldAlert className="h-5 w-5 text-rose-600 flex-shrink-0" />
            <div className="text-xs font-extrabold">{error}</div>
          </div>
        )}

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Students */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center gap-5">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Students</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{loading ? '...' : usersList.length}</h3>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">registered in portal</p>
            </div>
          </div>

          {/* Card 2: Documents */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center gap-5">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Documents</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{loading ? '...' : notesList.length}</h3>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">uploaded notes & slides</p>
            </div>
          </div>

          {/* Card 3: Downloads */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center gap-5">
            <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Downloads</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{loading ? '...' : totalDownloads}</h3>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">successful notes fetched</p>
            </div>
          </div>

          {/* Card 4: Subscription Plans */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center gap-5">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Plan Subscriptions</p>
              <h3 className="text-base font-black text-slate-800 mt-1">
                {loading ? '...' : `Pro: ${planDistribution.Pro} | Basic: ${planDistribution.Basic}`}
              </h3>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Free tier accounts: {planDistribution.Free}</p>
            </div>
          </div>

        </div>

        {/* Tables Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* USER SESSIONS LIST (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-ucp-blue" />
                  <h3 className="font-extrabold text-slate-800 text-base">Student Login Logs</h3>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {usersList.length} Users
                </span>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : usersList.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-medium text-sm">
                  No student logins recorded.
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[500px] pr-1 space-y-3">
                  {usersList.map((st) => (
                    <div key={st._id} className="p-3 bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{st.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{st.email}</p>
                        <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>Joined {new Date(st.createdAt).toLocaleDateString()}</span>
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border block ${
                          st.plan === 'Ultra' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                          st.plan === 'Pro' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                          'bg-slate-100 border-slate-200 text-slate-600'
                        }`}>
                          {(st.plan === 'Free' ? 'Basic' : st.plan)} Plan
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold mt-1 block">
                          {st.downloadsCount || 0} DLs
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DOCUMENTS TRACKER LIST (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-ucp-blue" />
                  <h3 className="font-extrabold text-slate-800 text-base">Documents Moderate & Track</h3>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {notesList.length} Docs
                </span>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : notesList.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-medium text-sm">
                  No notes or past papers uploaded yet.
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[500px] pr-1 space-y-3">
                  {notesList.map((doc) => (
                    <div key={doc._id} className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-700 truncate" title={doc.title}>
                          {doc.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-[9px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                            {doc.semester}
                          </span>
                          <span className="text-[9px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                            {doc.type}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-500">
                            {doc.subject}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-semibold mt-1">
                          Uploaded by: <span className="font-bold">{doc.uploadedBy}</span> ({doc.uploadedByEmail})
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-700 block flex items-center gap-0.5 justify-end">
                            <Download className="h-3 w-3 text-slate-400" />
                            <span>{doc.downloads || 0}</span>
                          </span>
                          <span className="text-[8px] text-slate-400 font-bold block uppercase mt-0.5">DLs</span>
                        </div>

                        <button
                          onClick={() => handleDeleteNote(doc._id)}
                          disabled={actionLoading}
                          className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors border border-rose-100 shadow-sm active:scale-95 disabled:opacity-50"
                          title="Delete document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;

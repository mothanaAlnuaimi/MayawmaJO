import { useState, useEffect } from 'react';
import { Users, Briefcase, Flag, Shield, LogOut, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner, Button, Badge, Alert } from '../../components/ui';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [message, setMessage] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes, reportsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getReports(),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setReports(reportsRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleBlockUser = async (id, isBlocked) => {
    try {
      await adminAPI.blockUser(id, isBlocked);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isBlocked } : u));
      setMessage(isBlocked ? 'تم حظر المستخدم' : 'تم إلغاء الحظر');
    } catch (err) { setMessage('حدث خطأ'); }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleVerify = async (id) => {
    try {
      await adminAPI.verifyEmployer(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isVerified: true } : u));
      setMessage('تم توثيق صاحب العمل ✅');
    } catch (err) { setMessage('حدث خطأ'); }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleResolveReport = async (id) => {
    try {
      await adminAPI.updateReport(id, 'RESOLVED');
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'RESOLVED' } : r));
    } catch (err) { console.error(err); }
  };

  const roleColors = { ADMIN: 'danger', EMPLOYER: 'primary', JOB_SEEKER: 'default' };
  const roleLabels = { ADMIN: 'مدير', EMPLOYER: 'صاحب عمل', JOB_SEEKER: 'باحث عمل' };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-gray-400 text-sm">لوحة تحكم</p>
            <h1 className="text-white text-xl font-black">مدير المنصة</h1>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="p-2 bg-white/10 rounded-full text-white">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {message && <Alert type="success">{message}</Alert>}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'إجمالي المستخدمين', value: stats.users, icon: Users, color: 'blue' },
              { label: 'إجمالي الوظائف', value: stats.jobs, icon: Briefcase, color: 'green' },
              { label: 'الطلبات', value: stats.applications, icon: BarChart3, color: 'orange' },
              { label: 'بلاغات مفتوحة', value: stats.openReports, icon: Flag, color: 'red' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2
                  ${stat.color === 'blue' ? 'bg-blue-50' : stat.color === 'green' ? 'bg-green-50' :
                    stat.color === 'orange' ? 'bg-orange-50' : 'bg-red-50'}`}>
                  <stat.icon size={20} className={
                    stat.color === 'blue' ? 'text-blue-600' : stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'orange' ? 'text-orange-600' : 'text-red-600'
                  } />
                </div>
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          {[
            { key: 'users', label: 'المستخدمون' },
            { key: 'reports', label: 'البلاغات' },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key ? 'bg-white shadow-sm text-blue-600 font-bold' : 'text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner className="py-8" />
        ) : activeTab === 'users' ? (
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className={`bg-white rounded-2xl border p-4 shadow-sm ${u.isBlocked ? 'border-red-100 bg-red-50' : 'border-gray-100'}`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 shrink-0">
                    {u.fullName?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">{u.fullName}</span>
                      <Badge variant={roleColors[u.role]}>{roleLabels[u.role]}</Badge>
                      {u.isVerified && <Badge variant="success"><Shield size={10} /> موثق</Badge>}
                      {u.isBlocked && <Badge variant="danger">محظور</Badge>}
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">{u.email} · {u.city}</p>
                    <p className="text-gray-400 text-xs">ثقة: {u.trustScore}%</p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {u.role === 'EMPLOYER' && !u.isVerified && (
                      <Button size="sm" variant="success" onClick={() => handleVerify(u.id)}>
                        <Shield size={12} /> توثيق
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={u.isBlocked ? 'secondary' : 'danger'}
                      onClick={() => handleBlockUser(u.id, !u.isBlocked)}
                    >
                      {u.isBlocked ? 'إلغاء الحظر' : 'حظر'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="text-center py-8 text-gray-400">لا توجد بلاغات</div>
            ) : reports.map(r => (
              <div key={r.id} className={`bg-white rounded-2xl border p-4 shadow-sm ${
                r.status === 'OPEN' ? 'border-orange-100' : 'border-gray-100'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        r.status === 'OPEN' ? 'bg-orange-100 text-orange-700' :
                        r.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {r.status === 'OPEN' ? 'مفتوح' : r.status === 'RESOLVED' ? 'تم الحل' : 'تحت المراجعة'}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">الوظيفة: {r.job?.title}</p>
                    <p className="text-gray-600 text-xs mt-0.5">السبب: {r.reason}</p>
                    <p className="text-gray-400 text-xs mt-0.5">من: {r.reporter?.fullName}</p>
                  </div>
                  {r.status === 'OPEN' && (
                    <Button size="sm" variant="success" onClick={() => handleResolveReport(r.id)}>
                      حل
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

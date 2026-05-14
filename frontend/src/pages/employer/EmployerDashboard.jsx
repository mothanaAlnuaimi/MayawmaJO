import { useState, useEffect } from 'react';
import { Plus, Briefcase, Users, Star, Shield, TrendingUp, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI, applicationsAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { EmployerBottomNavigation } from '../../components/layout/BottomNavigation';
import { LoadingSpinner, Badge, TrustScoreBadge, Button } from '../../components/ui';

export default function EmployerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, open: 0, applications: 0 });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [jobsRes, appsRes] = await Promise.all([
        jobsAPI.getMyJobs(),
        applicationsAPI.getForEmployer(),
      ]);
      const jobsList = jobsRes.data || [];
      setJobs(jobsList);
      setStats({
        total: jobsList.length,
        open: jobsList.filter(j => j.status === 'OPEN').length,
        applications: appsRes.data?.length || 0,
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const statusColors = {
    OPEN: 'bg-green-100 text-green-700',
    CLOSED: 'bg-gray-100 text-gray-600',
    BLOCKED: 'bg-red-100 text-red-700',
  };
  const statusLabels = { OPEN: 'مفتوح', CLOSED: 'مغلق', BLOCKED: 'محظور' };

  const businessName = user?.employerProfile?.businessName || user?.fullName;

  return (
    <div className="min-h-screen bg-gray-50 bottom-nav-padding">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-800 pt-12 pb-20 px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-200 text-sm">لوحة التحكم</p>
            <h1 className="text-white text-xl font-black">{businessName}</h1>
          </div>
          <div className="flex gap-2">
            <div className="bg-white/20 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              {user?.isVerified ? <><Shield size={12} /> موثق</> : 'غير موثق'}
            </div>
            <button onClick={handleLogout} className="p-2 bg-white/20 rounded-full text-white">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <TrustScoreBadge score={user?.trustScore || 50} />
          <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-bold">
            <Star size={11} fill="currentColor" />
            {user?.rating?.toFixed(1) || '0.0'}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-12 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'إجمالي الوظائف', value: stats.total, icon: '💼', color: 'blue' },
            { label: 'الوظائف المفتوحة', value: stats.open, icon: '✅', color: 'green' },
            { label: 'الطلبات الواردة', value: stats.applications, icon: '📋', color: 'orange' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/employer/create-job')}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-4 flex items-center gap-3 transition-colors shadow-md shadow-blue-200"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Plus size={22} />
            </div>
            <div className="text-right">
              <p className="font-bold text-sm">نشر وظيفة</p>
              <p className="text-blue-200 text-xs">أضف فرصة جديدة</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/employer/applicants')}
            className="bg-white border border-gray-100 hover:bg-gray-50 rounded-2xl p-4 flex items-center gap-3 transition-colors shadow-sm"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users size={22} className="text-blue-600" />
            </div>
            <div className="text-right">
              <p className="font-bold text-sm text-gray-900">المتقدمون</p>
              <p className="text-gray-400 text-xs">مراجعة الطلبات</p>
            </div>
          </button>
        </div>

        {/* My Jobs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">وظائفي</h2>
            <button onClick={() => navigate('/employer/jobs')} className="text-blue-600 text-sm font-medium">
              عرض الكل
            </button>
          </div>

          {loading ? (
            <LoadingSpinner className="py-8" />
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
              <p className="text-4xl mb-2">📭</p>
              <p className="font-semibold text-gray-600">لم تنشر أي وظيفة بعد</p>
              <Button onClick={() => navigate('/employer/create-job')} className="mt-3" size="sm">
                <Plus size={16} /> نشر أول وظيفة
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 5).map(job => (
                <div
                  key={job.id}
                  onClick={() => navigate(`/employer/jobs/${job.id}`)}
                  className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm card-hover cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{job.title}</h3>
                      <p className="text-gray-500 text-sm">{job.city} · {job.payment} دينار</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
                          {statusLabels[job.status]}
                        </span>
                        <span className="text-gray-400 text-xs">{job._count?.applications || 0} طلب</span>
                        {job.riskScore > 60 && (
                          <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">⚠️ مخاطرة</span>
                        )}
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <p className="text-xs text-gray-400">
                        {new Date(job.createdAt).toLocaleDateString('ar-JO')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <EmployerBottomNavigation />
    </div>
  );
}

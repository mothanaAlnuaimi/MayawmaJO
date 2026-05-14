import { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, XCircle, Star, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { applicationsAPI, jobsAPI } from '../../services/api';
import { EmployerBottomNavigation } from '../../components/layout/BottomNavigation';
import { LoadingSpinner, EmptyState, TrustScoreBadge, Button, Alert } from '../../components/ui';

export default function ApplicantsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => { loadData(); }, [selectedJob]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appsRes, jobsRes] = await Promise.all([
        applicationsAPI.getForEmployer(selectedJob || undefined),
        jobsAPI.getMyJobs(),
      ]);
      setApplications(appsRes.data || []);
      setJobs(jobsRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleStatus = async (appId, status) => {
    setActionLoading(prev => ({ ...prev, [appId]: true }));
    try {
      await applicationsAPI.updateStatus(appId, status);
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      setMessage(status === 'ACCEPTED' ? 'تم قبول الطلب ✅' : 'تم رفض الطلب');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'حدث خطأ');
    } finally {
      setActionLoading(prev => ({ ...prev, [appId]: false }));
    }
  };

  const pending = applications.filter(a => a.status === 'PENDING');
  const processed = applications.filter(a => a.status !== 'PENDING');

  return (
    <div className="min-h-screen bg-gray-50 bottom-nav-padding">
      <div className="bg-white shadow-sm sticky top-0 z-30">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 rounded-full">
              <ArrowRight size={20} />
            </button>
            <h1 className="text-xl font-black text-gray-900 flex-1">المتقدمون</h1>
            <span className="bg-blue-100 text-blue-700 text-sm px-2 py-0.5 rounded-full font-medium">
              {pending.length} معلق
            </span>
          </div>
          {/* Job filter */}
          <select
            value={selectedJob}
            onChange={e => setSelectedJob(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">كل الوظائف</option>
            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {message && <Alert type={message.includes('✅') ? 'success' : 'danger'}>{message}</Alert>}

        {loading ? (
          <LoadingSpinner className="py-16" />
        ) : applications.length === 0 ? (
          <EmptyState icon={Users} title="لا توجد طلبات بعد" description="ستظهر هنا طلبات المتقدمين لوظائفك" />
        ) : (
          <>
            {/* Pending applications */}
            {pending.length > 0 && (
              <section>
                <h2 className="font-bold text-gray-900 mb-3">⏳ بانتظار قرارك ({pending.length})</h2>
                <div className="space-y-3">
                  {pending.map(app => (
                    <ApplicantCard
                      key={app.id}
                      app={app}
                      onAccept={() => handleStatus(app.id, 'ACCEPTED')}
                      onReject={() => handleStatus(app.id, 'REJECTED')}
                      loading={actionLoading[app.id]}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Processed */}
            {processed.length > 0 && (
              <section>
                <h2 className="font-bold text-gray-900 mb-3">تمت المعالجة ({processed.length})</h2>
                <div className="space-y-3">
                  {processed.map(app => (
                    <ApplicantCard key={app.id} app={app} processed />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <EmployerBottomNavigation />
    </div>
  );
}

function ApplicantCard({ app, onAccept, onReject, loading, processed }) {
  const skills = app.seeker?.jobSeekerProfile?.skills
    ? JSON.parse(app.seeker.jobSeekerProfile.skills)
    : [];

  const statusStyle = {
    ACCEPTED: 'bg-green-50 border-green-100',
    REJECTED: 'bg-red-50 border-red-100',
    PENDING: 'bg-white border-gray-100',
  }[app.status];

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${statusStyle}`}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0">
          {app.seeker?.fullName?.[0] || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-gray-900">{app.seeker?.fullName}</h3>
              <p className="text-gray-500 text-xs">{app.seeker?.city}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="flex items-center gap-1 text-yellow-500 text-xs">
                <Star size={11} fill="currentColor" />
                {app.seeker?.rating?.toFixed(1) || '0.0'}
              </div>
              <TrustScoreBadge score={app.seeker?.trustScore || 50} />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-gray-400 text-xs">
              {app.seeker?.jobSeekerProfile?.completedJobs || 0} وظيفة مكتملة
            </span>
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {skills.slice(0, 3).map(s => (
                <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs border border-blue-100">
                  {s}
                </span>
              ))}
            </div>
          )}

          <p className="text-gray-400 text-xs mt-1.5">الوظيفة: {app.job?.title}</p>
        </div>
      </div>

      {!processed && (
        <div className="flex gap-2 mt-3">
          <Button
            onClick={onAccept}
            variant="success"
            size="sm"
            className="flex-1"
            loading={loading}
          >
            <CheckCircle size={14} /> قبول
          </Button>
          <Button
            onClick={onReject}
            variant="danger"
            size="sm"
            className="flex-1"
            loading={loading}
          >
            <XCircle size={14} /> رفض
          </Button>
        </div>
      )}

      {processed && (
        <div className={`mt-3 text-center py-1.5 rounded-lg text-sm font-medium ${
          app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {app.status === 'ACCEPTED' ? '✅ تم القبول' : '❌ تم الرفض'}
        </div>
      )}
    </div>
  );
}

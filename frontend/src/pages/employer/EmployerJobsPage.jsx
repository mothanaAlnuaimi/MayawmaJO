import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Briefcase } from 'lucide-react';
import { jobsAPI } from '../../services/api';
import { EmployerBottomNavigation } from '../../components/layout/BottomNavigation';
import { LoadingSpinner, EmptyState, Button } from '../../components/ui';

export default function EmployerJobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadJobs(); }, []);
  const loadJobs = async () => {
    try {
      const res = await jobsAPI.getMyJobs();
      setJobs(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleClose = async (id) => {
    try {
      await jobsAPI.delete(id);
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'CLOSED' } : j));
    } catch (err) { console.error(err); }
  };

  const statusStyle = {
    OPEN: 'bg-green-100 text-green-700',
    CLOSED: 'bg-gray-100 text-gray-600',
    BLOCKED: 'bg-red-100 text-red-700',
  };
  const statusLabel = { OPEN: 'مفتوح', CLOSED: 'مغلق', BLOCKED: 'محظور' };

  return (
    <div className="min-h-screen bg-gray-50 bottom-nav-padding">
      <div className="bg-white shadow-sm">
        <div className="px-4 pt-4 pb-3 flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 rounded-full">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-xl font-black text-gray-900 flex-1">وظائفي</h1>
          <button
            onClick={() => navigate('/employer/create-job')}
            className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded-xl"
          >
            <Plus size={16} /> جديد
          </button>
        </div>
      </div>

      <div className="px-4 pt-4">
        {loading ? (
          <LoadingSpinner className="py-16" />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="لا توجد وظائف بعد"
            description="انشر أول وظيفة لتبدأ باستقطاب المتقدمين"
            action={<Button onClick={() => navigate('/employer/create-job')}><Plus size={16} /> نشر وظيفة</Button>}
          />
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{job.title}</h3>
                    <p className="text-gray-500 text-sm">{job.city} · {job.payment} دينار · {job.date}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[job.status]}`}>
                        {statusLabel[job.status]}
                      </span>
                      <span className="text-blue-600 text-xs font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                        {job._count?.applications || 0} متقدم
                      </span>
                      {job.riskScore > 60 && (
                        <span className="text-orange-600 text-xs bg-orange-50 px-2 py-0.5 rounded-full">⚠️ مخاطرة</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => navigate(`/employer/applicants?job=${job.id}`)}
                      className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100"
                    >
                      المتقدمون
                    </button>
                    {job.status === 'OPEN' && (
                      <button
                        onClick={() => handleClose(job.id)}
                        className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-100"
                      >
                        إغلاق
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EmployerBottomNavigation />
    </div>
  );
}

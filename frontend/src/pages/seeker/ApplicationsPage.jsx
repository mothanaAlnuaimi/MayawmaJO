import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Briefcase } from 'lucide-react';
import { applicationsAPI } from '../../services/api';
import { BottomNavigation } from '../../components/layout/BottomNavigation';
import { LoadingSpinner, EmptyState, Badge } from '../../components/ui';

const statusConfig = {
  PENDING: { label: 'قيد المراجعة', icon: Clock, color: 'warning', bg: 'bg-orange-50 border-orange-100' },
  ACCEPTED: { label: 'مقبول', icon: CheckCircle, color: 'success', bg: 'bg-green-50 border-green-100' },
  REJECTED: { label: 'مرفوض', icon: XCircle, color: 'danger', bg: 'bg-red-50 border-red-100' },
};

const tabs = [
  { key: 'all', label: 'الكل' },
  { key: 'PENDING', label: 'قيد المراجعة' },
  { key: 'ACCEPTED', label: 'مقبول' },
  { key: 'REJECTED', label: 'مرفوض' },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => { loadApplications(); }, []);

  const loadApplications = async () => {
    try {
      const res = await applicationsAPI.getMine();
      setApplications(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = activeTab === 'all' ? applications : applications.filter(a => a.status === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 bottom-nav-padding">
      <div className="bg-white shadow-sm">
        <div className="px-4 pt-12 pb-0">
          <h1 className="text-2xl font-black text-gray-900 mb-4">طلباتي</h1>
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {tabs.map(tab => (
              <button key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.key !== 'all' && (
                  <span className={`mr-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {applications.filter(a => a.status === tab.key).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {loading ? (
          <LoadingSpinner className="py-16" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="لا توجد طلبات"
            description="لم تتقدم لأي وظيفة بعد. تصفح الفرص المتاحة!"
          />
        ) : (
          <div className="space-y-3">
            {filtered.map(app => {
              const config = statusConfig[app.status];
              const StatusIcon = config.icon;
              const businessName = app.job?.employer?.employerProfile?.businessName || app.job?.employer?.fullName;

              return (
                <div key={app.id} className={`bg-white rounded-2xl border p-4 shadow-sm ${config.bg}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{app.job?.title}</h3>
                      <p className="text-gray-500 text-sm mt-0.5">{businessName}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-blue-600 text-sm font-semibold">{app.job?.payment} دينار</span>
                        <span className="text-gray-400 text-xs">{app.job?.city}</span>
                        <span className="text-gray-400 text-xs">
                          {new Date(app.createdAt).toLocaleDateString('ar-JO')}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                        ${app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                          app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'}`}>
                        <StatusIcon size={12} />
                        {config.label}
                      </div>
                    </div>
                  </div>

                  {app.status === 'ACCEPTED' && (
                    <div className="mt-3 bg-green-100 rounded-xl px-3 py-2">
                      <p className="text-green-800 text-xs font-medium">
                        🎉 تهانينا! تم قبول طلبك. انتظر تواصل صاحب العمل معك.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}

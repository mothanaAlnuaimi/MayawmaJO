import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Calendar, Users, Shield, AlertTriangle, ArrowRight, Bookmark, Share2, Star } from 'lucide-react';
import { jobsAPI, applicationsAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Button, Badge, Alert, LoadingSpinner, TrustScoreBadge, RiskBadge } from '../../components/ui';

const categoryIcons = {
  'توصيل': '🛵', 'فعاليات': '🎉', 'إدخال بيانات': '💻',
  'تصميم': '🎨', 'خدمة عملاء': '🎧', 'تصوير': '📷',
  'مبيعات': '🛍️', 'مساعدة في متجر': '🏪',
};

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const res = await jobsAPI.getById(id);
      setJob(res.data);
    } catch (err) {
      setError('لم يتم العثور على الوظيفة');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    setError('');
    try {
      await applicationsAPI;
      await jobsAPI.apply(id);
      setApplied(true);
      setSuccess('تم تقديم طلبك بنجاح! سيتواصل معك صاحب العمل قريباً.');
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ في تقديم الطلب');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!job) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">لم يتم العثور على الوظيفة</p></div>;

  const icon = categoryIcons[job.category] || '💼';
  const businessName = job.employer?.employerProfile?.businessName || job.employer?.fullName;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Top bar */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowRight size={20} />
        </button>
        <h1 className="font-bold text-gray-900 flex-1 truncate">{job.title}</h1>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Bookmark size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Hero Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl shrink-0">
              {icon}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black text-gray-900">{job.title}</h2>
              <p className="text-gray-600 mt-1 font-medium">{businessName}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="primary">{job.category}</Badge>
                {job.employer?.isVerified && (
                  <Badge variant="verified"><Shield size={12} /> موثق</Badge>
                )}
                {job.riskScore > 40 && <RiskBadge score={job.riskScore} />}
              </div>
            </div>
          </div>

          {/* Payment highlight */}
          <div className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white">
            <p className="text-blue-100 text-sm">الراتب</p>
            <p className="text-3xl font-black">{job.payment} <span className="text-lg font-normal">دينار أردني</span></p>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3">تفاصيل الوظيفة</h3>
          <div className="space-y-3">
            <DetailRow icon={MapPin} label="الموقع" value={`${job.city}${job.area ? ` · ${job.area}` : ''}`} />
            <DetailRow icon={Calendar} label="التاريخ" value={job.date} />
            <DetailRow icon={Clock} label="الوقت" value={`${job.startTime} - ${job.endTime}`} />
            <DetailRow icon={Users} label="عدد المطلوبين" value={`${job.workersNeeded} أشخاص`} />
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3">وصف الوظيفة</h3>
          <p className="text-gray-600 leading-relaxed">{job.description}</p>
        </div>

        {/* Requirements */}
        {job.requirements && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3">المتطلبات</h3>
            <p className="text-gray-600 leading-relaxed">{job.requirements}</p>
          </div>
        )}

        {/* Employer info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3">عن صاحب العمل</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
              🏢
            </div>
            <div>
              <p className="font-semibold text-gray-900">{businessName}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {job.employer?.isVerified && (
                  <span className="text-blue-600 text-xs flex items-center gap-1">
                    <Shield size={12} /> موثق
                  </span>
                )}
                <span className="flex items-center gap-1 text-yellow-500 text-xs">
                  <Star size={12} fill="currentColor" />
                  {job.employer?.rating?.toFixed(1) || '0.0'}
                </span>
                <TrustScoreBadge score={job.employer?.trustScore || 50} />
              </div>
            </div>
          </div>
        </div>

        {/* Risk warning */}
        {job.riskScore > 60 && (
          <Alert type="warning">
            <div className="flex items-start gap-2">
              <AlertTriangle size={18} className="text-orange-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">تحذير</p>
                <p className="text-sm mt-0.5">هذا الإعلان قد يكون غير واضح أو يحتاج إلى مراجعة. يُنصح بالتحقق من صاحب العمل قبل التقديم.</p>
              </div>
            </div>
          </Alert>
        )}

        {/* Safety notice */}
        <Alert type="info">
          <p className="text-xs">💡 <strong>نصيحة الأمان:</strong> لا تشارك معلوماتك البنكية أو بياناتك الحساسة مع صاحب العمل. جميع المدفوعات تتم وجهاً لوجه.</p>
        </Alert>

        {error && <Alert type="danger">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}
      </div>

      {/* Apply button */}
      {user?.role === 'JOB_SEEKER' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
          <Button
            className="w-full"
            size="lg"
            variant={applied ? 'success' : 'primary'}
            onClick={handleApply}
            loading={applying}
            disabled={applied || job.status !== 'OPEN'}
          >
            {applied ? '✓ تم التقديم' : job.status !== 'OPEN' ? 'الوظيفة مغلقة' : 'تقدم الآن'}
          </Button>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
        <Icon size={16} className="text-blue-600" />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

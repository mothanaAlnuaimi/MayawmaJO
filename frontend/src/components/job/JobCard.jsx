import { MapPin, Clock, DollarSign, Shield, AlertTriangle, Truck, Calendar, Star } from 'lucide-react';
import { Badge, TrustScoreBadge, RiskBadge } from '../ui';
import { useNavigate } from 'react-router-dom';

// Category icon mapping
const categoryIcons = {
  'توصيل': '🛵',
  'فعاليات': '🎉',
  'إدخال بيانات': '💻',
  'تصميم': '🎨',
  'خدمة عملاء': '🎧',
  'تصوير': '📷',
  'مبيعات': '🛍️',
  'مساعدة في متجر': '🏪',
  'تنظيم فعاليات': '🎪',
};

export function JobCard({ job, showApply = true, compact = false }) {
  const navigate = useNavigate();
  const icon = categoryIcons[job.category] || '💼';
  const businessName = job.employer?.employerProfile?.businessName || job.employer?.fullName || 'صاحب عمل';

  const handleClick = () => navigate(`/jobs/${job.id}`);

  if (compact) {
    return (
      <div
        onClick={handleClick}
        className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm card-hover cursor-pointer flex items-center gap-3"
      >
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-xl shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{job.title}</p>
          <p className="text-gray-500 text-xs">{job.city} · {job.payment} دينار</p>
        </div>
        {job.employer?.isVerified && (
          <Shield size={14} className="text-blue-600 shrink-0" />
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm card-hover cursor-pointer overflow-hidden"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-gray-900 text-base leading-tight">{job.title}</h3>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {job.employer?.isVerified && (
                  <Badge variant="verified" className="text-xs">
                    <Shield size={10} /> موثق
                  </Badge>
                )}
                {job.riskScore > 40 && <RiskBadge score={job.riskScore} />}
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">{businessName}</p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
            <MapPin size={14} className="text-gray-400" />
            <span>{job.city}{job.area && ` · ${job.area}`}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
            <Calendar size={14} className="text-gray-400" />
            <span>{job.date}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
            <Clock size={14} className="text-gray-400" />
            <span>{job.startTime} - {job.endTime}</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-600 text-sm font-semibold">
            <span>{job.payment} دينار</span>
          </div>
        </div>

        {/* Category badge */}
        <div className="flex items-center justify-between">
          <Badge variant="primary">{job.category}</Badge>
          {showApply && (
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job.id}`); }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              تقدم الآن
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// AI Recommended Job Card with score
export function RecommendedJobCard({ item }) {
  const { job, matchingScore, reason } = item;
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-4 card-hover cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-blue-700 font-bold text-sm">🤖 توصية ذكية</span>
        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
          {matchingScore}% تطابق
        </span>
      </div>
      <h3 className="font-bold text-gray-900 mb-1">{job.title}</h3>
      <p className="text-gray-600 text-sm mb-2">{job.city} · {job.payment} دينار</p>
      <p className="text-blue-700 text-xs bg-blue-100 rounded-lg px-3 py-2">{reason}</p>
    </div>
  );
}

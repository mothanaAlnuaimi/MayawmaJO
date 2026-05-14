import { useState, useEffect } from 'react';
import { Search, MapPin, Bell, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI, aiAPI, notificationsAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { BottomNavigation } from '../../components/layout/BottomNavigation';
import { JobCard, RecommendedJobCard } from '../../components/job/JobCard';
import { LoadingSpinner, EmptyState, Alert } from '../../components/ui';

const categories = [
  { name: 'توصيل', icon: '🛵' },
  { name: 'فعاليات', icon: '🎉' },
  { name: 'إدخال بيانات', icon: '💻' },
  { name: 'تصميم', icon: '🎨' },
  { name: 'خدمة عملاء', icon: '🎧' },
  { name: 'تصوير', icon: '📷' },
  { name: 'مبيعات', icon: '🛍️' },
];

const cities = ['الكل', 'عمان', 'الزرقاء', 'إربد', 'السلط', 'العقبة'];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState(user?.city || 'عمان');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadJobs();
    loadRecommended();
    loadNotifications();
  }, [selectedCity, selectedCategory]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await jobsAPI.getAll({
        city: selectedCity !== 'الكل' ? selectedCity : undefined,
        category: selectedCategory || undefined,
      });
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommended = async () => {
    try {
      const res = await aiAPI.getRecommended();
      setRecommended(res.data.slice(0, 3));
    } catch (err) { /* ignore */ }
  };

  const loadNotifications = async () => {
    try {
      const res = await notificationsAPI.getAll();
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (err) { /* ignore */ }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await jobsAPI.getAll({ search });
      setJobs(res.data.jobs || []);
    } catch (err) { console.error(err); }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'صباح الخير' : hour < 18 ? 'مساء النور' : 'مساء الخير';

  return (
    <div className="min-h-screen bg-gray-50 bottom-nav-padding">
      {/* Header */}
      <div className="bg-white pt-safe">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-500 text-sm">{greeting} 👋</p>
              <h1 className="text-xl font-black text-gray-900">{user?.fullName?.split(' ')[0]}</h1>
            </div>
            <button
              onClick={() => navigate('/notifications')}
              className="relative w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* City selector */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <MapPin size={14} className="text-blue-600" />
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="font-medium text-gray-700 bg-transparent border-none outline-none appearance-none"
            >
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={14} />
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ابحث عن فرصة عمل..."
                className="w-full bg-gray-100 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>
        </div>

        {/* Categories scroll */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setSelectedCategory('')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              الكل
            </button>
            {categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? '' : cat.name)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.name ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-6">
        {/* AI Recommended section */}
        {recommended.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">🤖 موصى بها لك</h2>
              <button onClick={() => navigate('/jobs')} className="text-blue-600 text-sm font-medium">
                عرض الكل
              </button>
            </div>
            <div className="space-y-3">
              {recommended.map((item, i) => (
                <RecommendedJobCard key={i} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Jobs section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">
              {selectedCategory || (selectedCity !== 'الكل' ? `فرص في ${selectedCity}` : 'أحدث الفرص')}
            </h2>
            <span className="text-gray-400 text-sm">{jobs.length} فرصة</span>
          </div>

          {loading ? (
            <LoadingSpinner className="py-12" />
          ) : jobs.length === 0 ? (
            <EmptyState
              title="لا توجد فرص متاحة"
              description="جرب تغيير المدينة أو الفئة للعثور على فرص"
            />
          ) : (
            <div className="space-y-3">
              {jobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </section>
      </div>

      <BottomNavigation unreadCount={unreadCount} />
    </div>
  );
}

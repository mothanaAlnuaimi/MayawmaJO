import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../services/api';
import { BottomNavigation } from '../../components/layout/BottomNavigation';
import { JobCard } from '../../components/job/JobCard';
import { LoadingSpinner, EmptyState, Select } from '../../components/ui';

const cities = ['الكل', 'عمان', 'الزرقاء', 'إربد', 'السلط', 'العقبة', 'عن بعد'];
const categories = ['الكل', 'توصيل', 'فعاليات', 'إدخال بيانات', 'تصميم', 'خدمة عملاء', 'تصوير', 'مبيعات'];

export default function JobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('الكل');
  const [category, setCategory] = useState('الكل');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { loadJobs(); }, [city, category]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await jobsAPI.getAll({
        city: city !== 'الكل' ? city : undefined,
        category: category !== 'الكل' ? category : undefined,
        search: search || undefined,
      });
      setJobs(res.data.jobs || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadJobs();
  };

  return (
    <div className="min-h-screen bg-gray-50 bottom-nav-padding">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-30">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 rounded-full">
              <ArrowRight size={20} />
            </button>
            <h1 className="text-xl font-black text-gray-900 flex-1">كل الفرص</h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl border transition-colors ${showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200'}`}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ابحث عن وظيفة..."
                className="w-full bg-gray-100 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>
        </div>

        {showFilters && (
          <div className="px-4 pb-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
            <Select
              options={cities.map(c => ({ value: c, label: c }))}
              value={city}
              onChange={e => setCity(e.target.value)}
            />
            <Select
              options={categories.map(c => ({ value: c, label: c }))}
              value={category}
              onChange={e => setCategory(e.target.value)}
            />
          </div>
        )}

        {/* Category pills */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                category === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        <p className="text-sm text-gray-500 mb-3">{jobs.length} فرصة متاحة</p>
        {loading ? (
          <LoadingSpinner className="py-16" />
        ) : jobs.length === 0 ? (
          <EmptyState
            title="لا توجد فرص"
            description="جرب تغيير الفلاتر أو البحث بكلمات مختلفة"
          />
        ) : (
          <div className="space-y-3">
            {jobs.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}

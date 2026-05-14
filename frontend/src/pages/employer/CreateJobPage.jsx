import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { jobsAPI } from '../../services/api';
import { Button, Input, Select, Alert } from '../../components/ui';

const categories = [
  { value: '', label: 'اختر التصنيف' },
  { value: 'توصيل', label: '🛵 توصيل' },
  { value: 'فعاليات', label: '🎉 فعاليات' },
  { value: 'إدخال بيانات', label: '💻 إدخال بيانات' },
  { value: 'تصميم', label: '🎨 تصميم' },
  { value: 'خدمة عملاء', label: '🎧 خدمة عملاء' },
  { value: 'تصوير', label: '📷 تصوير' },
  { value: 'مبيعات', label: '🛍️ مبيعات' },
  { value: 'مساعدة في متجر', label: '🏪 مساعدة في متجر' },
];

const cities = [
  { value: '', label: 'اختر المدينة' },
  { value: 'عمان', label: 'عمان' },
  { value: 'الزرقاء', label: 'الزرقاء' },
  { value: 'إربد', label: 'إربد' },
  { value: 'السلط', label: 'السلط' },
  { value: 'العقبة', label: 'العقبة' },
  { value: 'عن بعد', label: 'عن بعد (Remote)' },
];

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', category: '', description: '', requirements: '',
    city: '', area: '', date: '', startTime: '', endTime: '',
    payment: '', workersNeeded: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  // Calculate estimated risk score for preview
  const estimatedRisk = () => {
    let risk = 0;
    if (!form.description || form.description.length < 50) risk += 25;
    if (!form.city) risk += 15;
    if (parseFloat(form.payment) > 100) risk += 20;
    if (!form.startTime || !form.endTime) risk += 10;
    return Math.min(risk, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.description || !form.city || !form.payment) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await jobsAPI.create(form);
      setSuccess('تم نشر الوظيفة بنجاح!');
      setTimeout(() => navigate('/employer'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ في نشر الوظيفة');
    } finally {
      setLoading(false);
    }
  };

  const risk = estimatedRisk();

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-lg font-black text-gray-900">نشر وظيفة جديدة</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
        {error && <Alert type="danger">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {/* Risk preview */}
        {risk > 0 && (
          <div className={`rounded-xl p-3 border flex items-center gap-2 ${
            risk >= 60 ? 'bg-red-50 border-red-200' : risk >= 30 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'
          }`}>
            <AlertTriangle size={16} className={risk >= 60 ? 'text-red-600' : risk >= 30 ? 'text-orange-600' : 'text-green-600'} />
            <p className={`text-sm font-medium ${risk >= 60 ? 'text-red-700' : risk >= 30 ? 'text-orange-700' : 'text-green-700'}`}>
              درجة المخاطرة التقديرية: {risk}/100 - {risk >= 60 ? 'يُنصح بإضافة تفاصيل أكثر' : risk >= 30 ? 'يحتاج بعض التحسين' : 'ممتاز'}
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">معلومات الوظيفة</h2>
          <Input label="عنوان الوظيفة *" placeholder="مثال: مساعد تنظيم فعالية" value={form.title} onChange={set('title')} required />
          <Select label="التصنيف *" options={categories} value={form.category} onChange={set('category')} required />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">الوصف * <span className="text-gray-400 text-xs">(كلما كان الوصف أوضح كان أفضل)</span></label>
            <textarea
              placeholder="اشرح تفاصيل العمل، المهام المطلوبة، وبيئة العمل..."
              value={form.description}
              onChange={set('description')}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              required
            />
            <p className={`text-xs mt-1 ${form.description.length < 50 ? 'text-orange-500' : 'text-green-600'}`}>
              {form.description.length} حرف {form.description.length < 50 ? '(يُنصح بـ 50 حرف على الأقل)' : '✓'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">المتطلبات</label>
            <textarea
              placeholder="ما هي المؤهلات والمهارات المطلوبة؟"
              value={form.requirements}
              onChange={set('requirements')}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">الموقع والوقت</h2>
          <div className="grid grid-cols-2 gap-3">
            <Select label="المدينة *" options={cities} value={form.city} onChange={set('city')} required />
            <Input label="المنطقة/الحي" placeholder="الشميساني" value={form.area} onChange={set('area')} />
          </div>
          <Input label="التاريخ *" type="date" value={form.date} onChange={set('date')} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="وقت البداية" type="time" value={form.startTime} onChange={set('startTime')} />
            <Input label="وقت النهاية" type="time" value={form.endTime} onChange={set('endTime')} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">الأجر والعدد</h2>
          <div className="grid grid-cols-2 gap-3">
            <Input label="الأجر (دينار) *" type="number" min="1" placeholder="15" value={form.payment} onChange={set('payment')} required />
            <Input label="عدد العمال المطلوب" type="number" min="1" max="50" value={form.workersNeeded}
              onChange={e => setForm(f => ({ ...f, workersNeeded: parseInt(e.target.value) }))} />
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          نشر الوظيفة 🚀
        </Button>
      </form>
    </div>
  );
}

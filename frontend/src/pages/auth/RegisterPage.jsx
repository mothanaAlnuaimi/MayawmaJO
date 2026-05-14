import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Users, Check, X, Mail, Lock, Phone } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input, Select } from '../../components/ui';

// مصفوفات البيانات والخيارات
const cities = [
  { value: '', label: 'اختر مدينة' },
  { value: 'عمان', label: 'عمان' },
  { value: 'الزرقاء', label: 'الزرقاء' },
  { value: 'إربد', label: 'إربد' },
  { value: 'السلط', label: 'السلط' },
  { value: 'العقبة', label: 'العقبة' },
  { value: 'مادبا', label: 'مادبا' },
  { value: 'الكرك', label: 'الكرك' },
];

const skillOptions = ['تصميم جرافيك', 'برمجة', 'خدمة عملاء', 'مبيعات', 'توصيل', 'تصوير', 'إدخال بيانات', 'ترجمة', 'تدريس', 'محاسبة', 'اخرى'];
const availabilityOptions = ['صباح', 'ظهر', 'مساء', 'ليل', 'عطل نهاية الأسبوع', 'متاح دائماً'];
const jobTypeOptions = ['توصيل', 'فعاليات', 'إدخال بيانات', 'تصميم', 'خدمة عملاء', 'تصوير', 'مبيعات', 'مساعدة في متجر', 'اخرى'];

// دالة للتحقق من قوة كلمة المرور
const checkPasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
  };
  const strength = Object.values(checks).filter(Boolean).length;
  let strengthText = '';
  let strengthColor = '';
  if (strength <= 2) { strengthText = 'ضعيفة'; strengthColor = 'bg-red-500'; }
  else if (strength === 3) { strengthText = 'متوسطة'; strengthColor = 'bg-yellow-500'; }
  else { strengthText = 'قوية'; strengthColor = 'bg-green-500'; }
  return { checks, strength, strengthText, strengthColor };
};

const isSequential = (password) => {
  if (password.length < 3) return false;
  let isSequentialUp = true;
  for (let i = 0; i < password.length - 1; i++) {
    if (parseInt(password[i+1]) !== parseInt(password[i]) + 1) { isSequentialUp = false; break; }
  }
  let isSequentialDown = true;
  for (let i = 0; i < password.length - 1; i++) {
    if (parseInt(password[i+1]) !== parseInt(password[i]) - 1) { isSequentialDown = false; break; }
  }
  const isAllSame = password.split('').every(char => char === password[0]);
  const forbiddenPatterns = ['123456', '12345678', '123456789', '012345', '111111', '222222', '333333', '444444', '555555', '654321', '987654'];
  return isSequentialUp || isSequentialDown || isAllSame || forbiddenPatterns.some(pattern => password.includes(pattern));
};

const validatePhoneNumber = (phone) => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length > 0 && cleaned.length < 2) cleaned = '07' + cleaned;
  if (cleaned.length > 10) cleaned = cleaned.slice(0, 10);
  return cleaned;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '',
    city: '', role: 'JOB_SEEKER',
    skills: [], availability: [], preferredJobTypes: [],
    businessName: '', businessType: '', location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRequirements, setShowRequirements] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ 
    checks: { length: false, hasNumber: false, hasUpperCase: false, hasLowerCase: false }, 
    strength: 0, strengthText: 'ضعيفة', strengthColor: 'bg-red-500' 
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [skillsError, setSkillsError] = useState('');
  const [availabilityError, setAvailabilityError] = useState('');
  const [jobTypesError, setJobTypesError] = useState('');

  // حقن كود حركات الشعار (Logo Animations)
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@700&display=swap');
      
      @keyframes typingAndDeleting {
        0%, 5% { width: 0; }
        35%, 65% { width: 100%; } 
        95%, 100% { width: 0; }
      }

      @keyframes blinkCursor {
        from, to { border-color: transparent }
        50% { border-color: white; }
      }

      .animate-typing-slow {
        display: inline-block;
        overflow: hidden;
        white-space: nowrap;
        vertical-align: middle;
        direction: rtl; 
        border-left: 2px solid white; 
        animation: 
          typingAndDeleting 9s steps(6) infinite, 
          blinkCursor 0.8s step-end infinite;
      }

      .fixed-logo-box {
        width: 90px;
        height: 90px;
        background-color: #3b5bdb;
        border-radius: 18px;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 8px 16px rgba(59, 91, 219, 0.2);
        font-family: 'Tajawal', sans-serif;
        margin: 0 auto 12px auto;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(form.password));
  }, [form.password]);

  useEffect(() => {
    setPasswordsMatch(form.confirmPassword ? form.password === form.confirmPassword : true);
  }, [form.password, form.confirmPassword]);

  const toggleArray = (field, value, maxCount, setErrorFunc, errorMessage) => {
    setForm(f => {
      const currentArray = f[field];
      if (currentArray.includes(value)) {
        if (setErrorFunc) setErrorFunc('');
        return { ...f, [field]: currentArray.filter(v => v !== value) };
      }
      if (currentArray.length >= maxCount) {
        if (setErrorFunc) setErrorFunc(errorMessage);
        return f;
      }
      if (setErrorFunc) setErrorFunc('');
      return { ...f, [field]: [...currentArray, value] };
    });
  };

  const handlePhoneChange = (e) => {
    setForm(f => ({ ...f, phone: validatePhoneNumber(e.target.value) }));
  };

  const handleNextStep = async () => {
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword || !form.city) {
      setError('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    if (form.phone && (form.phone.length !== 10 || !form.phone.startsWith('07'))) {
      setError('رقم الهاتف غير صحيح');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('البريد الإلكتروني غير صالح');
      return;
    }
    if (form.password.length < 8 || !/\d/.test(form.password) || !/[A-Z]/.test(form.password) || isSequential(form.password)) {
      setError('كلمة المرور لا تستوفي الشروط الأمنية');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('كلمتا المرور غير متطابقتان');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.checkEmail(form.email);
      if (response.data.exists) {
        setError('البريد الإلكتروني مستخدم بالفعل');
      } else {
        setStep(2);
      }
    } catch (err) {
      setError('حدث خطأ في التحقق من البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.role === 'JOB_SEEKER') {
      if (form.skills.length !== 3 || form.availability.length !== 2 || form.preferredJobTypes.length !== 3) {
        setError('يرجى استكمال اختيارات المهارات والتفرغ بدقة');
        return;
      }
    } else if (!form.businessName || !form.businessType || !form.location) {
      setError('يرجى تعبئة معلومات النشاط التجاري');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register(form);
      login(res.data.token, res.data.user);
      navigate(form.role === 'EMPLOYER' ? '/employer' : '/');
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ في إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  const ErrorModal = ({ message }) => {
    if (!message) return null;
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setError('')} />
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
          <div className="text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">تنبيه</h3>
            <p className="text-gray-600">{message}</p>
            <button onClick={() => setError('')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors w-full">حسناً</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4" dir="rtl">
      <div className="max-w-sm mx-auto pt-6">
        
        {/* Logo Section */}
        <div className="text-center mb-6">
          <div className="fixed-logo-box">
            <span className="animate-typing-slow text-white font-bold" style={{ fontSize: '24px' }}>
              مياومة
            </span>
          </div>
          <h1 className="text-xl font-black text-gray-900">إنشاء حساب جديد</h1>
          <p className="text-gray-500 text-sm">انضم إلى مياومة اليوم</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full ${s <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-900 mb-4">المعلومات الأساسية</h2>

              <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-gray-100 rounded-xl">
                {[
                  { value: 'JOB_SEEKER', label: 'باحث عن عمل', icon: Users },
                  { value: 'EMPLOYER', label: 'صاحب عمل', icon: Briefcase },
                ].map(role => {
                  const Icon = role.icon;
                  const isActive = form.role === role.value;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, role: role.value }))}
                      className={`relative py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isActive ? 'bg-blue-600 text-white shadow-lg transform scale-105' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <Icon size={18} />
                      <span>{role.label}</span>
                    </button>
                  );
                })}
              </div>

              <Input label="الاسم الكامل" placeholder="محمد أحمد" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
              <Input label="البريد الإلكتروني" type="email" placeholder="example@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              
              <Input label="رقم الهاتف" type="tel" placeholder="07XXXXXXXX" value={form.phone} onChange={handlePhoneChange} dir="ltr" />
              
              <Select label="المدينة" options={cities} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
              
              <div className="relative">
                <Input label="كلمة المرور" type="password" placeholder="••••••••" value={form.password} 
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
                  onFocus={() => setShowRequirements(true)} onBlur={() => setShowRequirements(false)} required />
                
                {showRequirements && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">المتطلبات:</p>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <div className="flex items-center gap-1">{passwordStrength.checks.length ? <Check size={12} className="text-green-500"/> : <X size={12} className="text-gray-400"/>} 8 أحرف</div>
                      <div className="flex items-center gap-1">{passwordStrength.checks.hasNumber ? <Check size={12} className="text-green-500"/> : <X size={12} className="text-gray-400"/>} أرقام</div>
                      <div className="flex items-center gap-1">{passwordStrength.checks.hasUpperCase ? <Check size={12} className="text-green-500"/> : <X size={12} className="text-gray-400"/>} حرف كبير</div>
                      <div className="flex items-center gap-1">{passwordStrength.checks.hasLowerCase ? <Check size={12} className="text-green-500"/> : <X size={12} className="text-gray-400"/>} حرف صغير</div>
                    </div>
                  </div>
                )}
              </div>

              <Input label="تأكيد كلمة المرور" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required />

              <Button className="w-full" onClick={handleNextStep} loading={loading} size="lg">التالي ←</Button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button type="button" onClick={() => setStep(1)} className="text-blue-600 text-sm">← رجوع</button>
                <h2 className="font-bold text-gray-900">{form.role === 'JOB_SEEKER' ? 'المهارات والتفرغ' : 'معلومات العمل'}</h2>
              </div>

              {form.role === 'JOB_SEEKER' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">المهارات (اختر 3)</label>
                    <div className="flex flex-wrap gap-1.5">
                      {skillOptions.map(skill => (
                        <button key={skill} type="button" onClick={() => toggleArray('skills', skill, 3, setSkillsError)}
                          className={`px-2.5 py-1 rounded-full text-xs border transition-all ${form.skills.includes(skill) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>{skill}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">التفرغ (اختر 2)</label>
                    <div className="flex flex-wrap gap-1.5">
                      {availabilityOptions.map(opt => (
                        <button key={opt} type="button" onClick={() => toggleArray('availability', opt, 2, setAvailabilityError)}
                          className={`px-2.5 py-1 rounded-full text-xs border transition-all ${form.availability.includes(opt) ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200'}`}>{opt}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">الأعمال المفضلة (اختر 3)</label>
                    <div className="flex flex-wrap gap-1.5">
                      {jobTypeOptions.map(type => (
                        <button key={type} type="button" onClick={() => toggleArray('preferredJobTypes', type, 3, setJobTypesError)}
                          className={`px-2.5 py-1 rounded-full text-xs border transition-all ${form.preferredJobTypes.includes(type) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'}`}>{type}</button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Input label="اسم الشركة / النشاط" placeholder="شركة..." value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} required />
                  <Select label="نوع النشاط" options={[{ value: 'مطعم', label: 'مطعم' }, { value: 'توصيل', label: 'توصيل' }, { value: 'تقنية', label: 'تقنية' }, { value: 'أخرى', label: 'أخرى' }]} value={form.businessType} onChange={e => setForm(f => ({ ...f, businessType: e.target.value }))} />
                  <Input label="العنوان" placeholder="عمان - الشميساني" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </>
              )}

              <Button type="submit" className="w-full" loading={loading} size="lg">إنشاء الحساب ✓</Button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-4">لديك حساب؟ <Link to="/login" className="text-blue-600 font-semibold">تسجيل الدخول</Link></p>
        </div>
      </div>
      <ErrorModal message={error} />
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Users, Briefcase } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input, Alert } from '../../components/ui';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', role: 'JOB_SEEKER' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // حقن كود الحركات (CSS Animations)
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login({ email: form.email, password: form.password });
      login(res.data.token, res.data.user);
      const role = res.data.user.role;
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'EMPLOYER') navigate('/employer');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-sm">
        {/* Logo Section */}
        <div className="text-center mb-8">
          
          {/* الشعار المتحرك الجديد */}
          <div className="fixed-logo-box">
            <span 
              className="animate-typing-slow text-white font-bold"
              style={{ fontSize: '24px' }}
            >
              مياومة
            </span>
          </div>

          {/* <h1 className="text-2xl font-black text-gray-900">مياومة</h1> */}
          <p className="text-gray-500 text-sm mt-1">منصة موثوقة لفرص العمل اليومية والجزئية في الأردن</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-5">تسجيل الدخول</h2>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-gray-100 rounded-xl">
            {[
              { value: 'JOB_SEEKER', label: 'باحث عن عمل', icon: Users },
              { value: 'EMPLOYER', label: 'صاحب عمل', icon: Briefcase }
            ].map(role => {
              const Icon = role.icon;
              const isActive = form.role === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: role.value }))}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md transform scale-[1.02]'
                      : 'bg-transparent text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
                  <span>{role.label}</span>
                </button>
              );
            })}
          </div>

          {error && <Alert type="danger" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="البريد الإلكتروني"
              type="email"
              placeholder="example@email.com"
              icon={Mail}
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">كلمة المرور</label>
              <div className="relative">
                <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 pl-10 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="text-left">
              <Link to="/forgot-password" university className="text-sm text-blue-600 hover:underline">
                نسيت كلمة المرور؟
              </Link>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" loading={loading} size="lg">
              تسجيل الدخول
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-sm">أو</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google login */}
          <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-2.5 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            تسجيل الدخول بجوجل
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              إنشاء حساب
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 bg-blue-50 rounded-xl p-3 border border-blue-100">
          <p className="text-xs text-blue-700 font-medium mb-1">🔑 حسابات تجريبية:</p>
          <p className="text-xs text-blue-600">باحث عمل: omar@student.jo / seeker123</p>
          <p className="text-xs text-blue-600">صاحب عمل: events@jordanpro.jo / employer123</p>
          <p className="text-xs text-blue-600">مدير: admin@forsati.jo / admin123</p>
        </div>
      </div>
    </div>
  );
}
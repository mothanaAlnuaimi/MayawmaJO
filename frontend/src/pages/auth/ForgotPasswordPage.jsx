import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { Button, Input, Alert } from '../../components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@700&display=swap');
      
      /* حركة الكتابة والمسح مبرمجة لـ 6 أحرف (م-ي-ا-و-م-ة) */
      /* كل حرف 0.5 ثانية -> الكتابة تأخذ 3 ثوانٍ */
      @keyframes typingAndDeleting {
        0%, 5% { width: 0; }
        35%, 65% { width: 100%; } /* يبقى النص ظاهراً */
        95%, 100% { width: 0; }   /* يمسح النص */
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
        /* اتجاه الكتابة من اليمين */
        direction: rtl; 
        /* المؤشر على اليسار ليتماشى مع الكتابة العربية */
        border-left: 3px solid white; 
        /* 9 ثوانٍ للدورة الكاملة: 3 كتابة، 3 انتظار، 3 مسح */
        animation: 
          typingAndDeleting 7s steps(6) infinite, 
          blinkCursor 0.8s step-end infinite;
      }

      .fixed-logo-box {
        width: 120px;
        height: 120px;
        background-color: #3b5bdb;
        border-radius: 35px;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 10px 25px rgba(59, 91, 219, 0.25);
        font-family: 'Tajawal', sans-serif;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-sm">
        
        {/* قسم الشعار */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="fixed-logo-box mb-4">
            <div className="flex justify-center" style={{ width: '100%', padding: '0 10px' }}>
              <span 
                className="animate-typing-slow text-white font-bold"
                style={{ fontSize: '28px' }}
              >
                مياومة
              </span>
            </div>
          </div>
          
          {/* <h1 className="text-2xl font-black text-gray-900">مياومة</h1> */}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <Link to="/login" className="flex items-center gap-1 w-fit text-blue-600 text-sm mb-4 hover:underline">
            <ArrowRight size={16} /> 
            <span className="mr-1 font-medium">العودة لتسجيل الدخول</span>
          </Link>

          <h2 className="text-xl font-bold text-gray-900 mb-2">نسيت كلمة المرور؟</h2>
          <p className="text-gray-500 text-sm mb-6">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور.</p>

          {sent ? (
            <Alert type="success">
              <p className="font-bold">تم إرسال البريد! 📧</p>
              <p className="text-sm mt-1">تحقق من صندوق الوارد واتبع التعليمات.</p>
            </Alert>
          ) : (
            <div className="space-y-4">
              <Input
                label="البريد الإلكتروني"
                type="email"
                placeholder="example@email.com"
                icon={Mail}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl transition-all active:scale-95 font-bold" 
                size="lg" 
                onClick={() => email && setSent(true)}
              >
                إرسال رابط إعادة التعيين
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
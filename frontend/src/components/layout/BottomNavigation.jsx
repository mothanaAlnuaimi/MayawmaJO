import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Briefcase, FileText, Bell, User } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'الرئيسية' },
  { path: '/jobs', icon: Briefcase, label: 'الفرص' },
  { path: '/applications', icon: FileText, label: 'طلباتي' },
  { path: '/notifications', icon: Bell, label: 'الإشعارات' },
  { path: '/profile', icon: User, label: 'ملفي' },
];

export function BottomNavigation({ unreadCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-40">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {path === '/notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                {label}
              </span>
              {isActive && <div className="absolute bottom-0 w-8 h-0.5 bg-blue-600 rounded-full" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// Employer Bottom Navigation
export function EmployerBottomNavigation({ unreadCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    { path: '/employer', icon: Home, label: 'لوحة التحكم' },
    { path: '/employer/jobs', icon: Briefcase, label: 'وظائفي' },
    { path: '/employer/applicants', icon: FileText, label: 'المتقدمون' },
    { path: '/notifications', icon: Bell, label: 'الإشعارات' },
    { path: '/profile', icon: User, label: 'ملفي' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-40">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {items.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {path === '/notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

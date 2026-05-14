import { useState, useEffect } from 'react';
import { Bell, CheckCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../../services/api';
import { BottomNavigation } from '../../components/layout/BottomNavigation';
import { LoadingSpinner, EmptyState } from '../../components/ui';

const typeConfig = {
  WELCOME: { icon: '🎉', bg: 'bg-blue-50 border-blue-100' },
  NEW_JOB: { icon: '💼', bg: 'bg-green-50 border-green-100' },
  APPLICATION_ACCEPTED: { icon: '✅', bg: 'bg-green-50 border-green-100' },
  APPLICATION_REJECTED: { icon: '❌', bg: 'bg-red-50 border-red-100' },
  NEW_APPLICATION: { icon: '📋', bg: 'bg-blue-50 border-blue-100' },
  JOB_POSTED: { icon: '📢', bg: 'bg-purple-50 border-purple-100' },
  INFO: { icon: '💡', bg: 'bg-gray-50 border-gray-100' },
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationsAPI.getAll();
      setNotifications(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const markRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => notificationsAPI.markRead(n.id)));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 bottom-nav-padding">
      <div className="bg-white shadow-sm">
        <div className="px-4 pt-12 pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-gray-900">الإشعارات</h1>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1.5 text-blue-600 text-sm font-medium">
                <CheckCheck size={16} /> قراءة الكل
              </button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="text-gray-500 text-sm mt-1">{unreadCount} إشعار غير مقروء</p>
          )}
        </div>
      </div>

      <div className="px-4 pt-3">
        {loading ? (
          <LoadingSpinner className="py-16" />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="لا توجد إشعارات"
            description="ستظهر هنا آخر التحديثات والإشعارات"
          />
        ) : (
          <div className="space-y-2">
            {notifications.map(notif => {
              const config = typeConfig[notif.type] || typeConfig.INFO;
              return (
                <div
                  key={notif.id}
                  onClick={() => !notif.isRead && markRead(notif.id)}
                  className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer
                    ${notif.isRead ? 'bg-white border-gray-100' : config.bg}`}
                >
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-xl shrink-0">
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-bold ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{notif.message}</p>
                    <p className="text-gray-400 text-xs mt-1.5">
                      {new Date(notif.createdAt).toLocaleDateString('ar-JO', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
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

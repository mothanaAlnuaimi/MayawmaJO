import { useState, useEffect } from 'react';
import { Star, Shield, Briefcase, Edit2, LogOut, Sparkles, MapPin } from 'lucide-react';
import { profileAPI, aiAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from '../../components/layout/BottomNavigation';
import { LoadingSpinner, TrustScoreBadge, Badge, Button, Modal, Input } from '../../components/ui';

export default function ProfilePage() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAI, setShowAI] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const res = await profileAPI.getMe();
      setProfile(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAISuggest = async () => {
    if (!aiText.trim()) return;
    setAiLoading(true);
    try {
      const res = await aiAPI.getProfileSuggestions(aiText);
      setAiSuggestions(res.data);
    } catch (err) { console.error(err); }
    finally { setAiLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  const seekerProfile = profile?.jobSeekerProfile;
  const skills = seekerProfile?.skills ? JSON.parse(seekerProfile.skills) : [];
  const availability = seekerProfile?.availability ? JSON.parse(seekerProfile.availability) : [];

  return (
    <div className="min-h-screen bg-gray-50 bottom-nav-padding">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 pt-12 pb-16 px-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white text-xl font-bold">ملفي الشخصي</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate('/profile/edit')} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30">
              <Edit2 size={18} />
            </button>
            <button onClick={handleLogout} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg">
            {profile?.avatar ? <img src={profile.avatar} className="w-full h-full rounded-full object-cover" alt="" /> : '👤'}
          </div>
          <div>
            <h2 className="text-white text-xl font-black">{profile?.fullName}</h2>
            <div className="flex items-center gap-1 text-blue-100 text-sm mt-1">
              <MapPin size={14} />
              <span>{profile?.city || 'لم يحدد'}</span>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-bold">
                <Star size={11} fill="currentColor" />
                {profile?.rating?.toFixed(1) || '0.0'}
              </div>
              <div className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                ثقة {profile?.trustScore}%
              </div>
              {profile?.isVerified && (
                <div className="bg-white text-blue-600 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Shield size={10} /> موثق
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8 space-y-4 pb-4">
        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'الوظائف', value: seekerProfile?.completedJobs || 0, icon: '✅' },
            { label: 'التقييم', value: `${profile?.rating?.toFixed(1) || 0}⭐`, icon: '⭐' },
            { label: 'نقاط الثقة', value: `${profile?.trustScore}%`, icon: '🛡️' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-lg font-black text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            💡 المهارات
          </h3>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span key={skill} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">لم تُضَف مهارات بعد</p>
          )}
        </div>

        {/* Availability */}
        {availability.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3">🕐 أوقات التفرغ</h3>
            <div className="flex flex-wrap gap-2">
              {availability.map(time => (
                <span key={time} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
                  {time}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {seekerProfile?.bio && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-2">📝 نبذة عني</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{seekerProfile.bio}</p>
          </div>
        )}

        {/* AI Profile Builder */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-indigo-600" />
            <h3 className="font-bold text-indigo-900">مساعد الذكاء الاصطناعي</h3>
          </div>
          <p className="text-indigo-700 text-sm mb-3">أخبرني عن مهاراتك وسأساعدك في بناء ملفك الشخصي</p>
          <textarea
            value={aiText}
            onChange={e => setAiText(e.target.value)}
            placeholder="مثال: أنا طالب جامعي أعرف فوتوشوب وإكسل، وأحب العمل في التصميم والتصوير..."
            className="w-full border border-indigo-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            rows={3}
          />
          <Button
            onClick={handleAISuggest}
            loading={aiLoading}
            className="w-full mt-2"
            variant="primary"
            size="sm"
          >
            <Sparkles size={14} /> تحليل وتحسين ملفي
          </Button>

          {aiSuggestions && (
            <div className="mt-3 space-y-2">
              <div>
                <p className="text-xs font-bold text-indigo-800 mb-1">المهارات المستخرجة:</p>
                <div className="flex flex-wrap gap-1">
                  {aiSuggestions.cleanedSkills.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-white border border-indigo-200 rounded-full text-xs text-indigo-700">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-800 mb-1">الفئات المقترحة:</p>
                <div className="flex flex-wrap gap-1">
                  {aiSuggestions.suggestedCategories.map(c => (
                    <span key={c} className="px-2 py-0.5 bg-indigo-100 rounded-full text-xs text-indigo-700">{c}</span>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-indigo-200">
                <p className="text-xs font-bold text-indigo-800 mb-1">النبذة المقترحة:</p>
                <p className="text-xs text-gray-700">{aiSuggestions.improvedBio}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}

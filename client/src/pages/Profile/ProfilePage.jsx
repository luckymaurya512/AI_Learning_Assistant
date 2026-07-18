import { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import { User, Mail, Calendar, BookOpen, Layers, Award, ShieldAlert, Key } from 'lucide-react';
import documentService from '../../services/documentService';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalDocs: 0,
    totalFlashcards: 0,
    totalQuizzes: 0,
    completedQuizzesCount: 0,
    averageQuizScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileStats = async () => {
      try {
        setLoading(true);
        const res = await documentService.getDashboardStats();
        if (res.success) {
          setStats(res.stats);
        }
      } catch (err) {
        toast.error('Failed to load profile statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Profile</h1>
        <p className="text-slate-400 font-light mt-1">Manage your account information and view your aggregate progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Info Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-between text-center relative overflow-hidden h-fit">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          
          <div className="space-y-4 w-full py-4">
            <div className="h-20 w-20 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-md">
              <User size={36} />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">{user?.username}</h2>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">StudyBuddy Scholar</p>
            </div>

            <div className="border-t border-slate-800/80 pt-4 text-xs text-slate-400 space-y-3 text-left">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-slate-500 shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-500 shrink-0" />
                <span>Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full mt-6 py-2.5 bg-slate-950 border border-slate-800 hover:border-red-500/30 text-xs font-semibold text-slate-300 hover:text-red-400 rounded-xl transition-all"
          >
            Sign Out
          </button>
        </div>

        {/* Learning Statistics Panel */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
            <h3 className="font-bold text-white text-base">Learning Assistant Metrics</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 flex items-center gap-4">
                <div className="p-3 bg-blue-600/10 text-blue-400 rounded-lg">
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Documents</p>
                  <p className="text-xl font-extrabold text-white mt-1">{stats.totalDocs}</p>
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 flex items-center gap-4">
                <div className="p-3 bg-pink-600/10 text-pink-400 rounded-lg">
                  <Layers size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Flashcards</p>
                  <p className="text-xl font-extrabold text-white mt-1">{stats.totalFlashcards}</p>
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 flex items-center gap-4">
                <div className="p-3 bg-teal-600/10 text-teal-400 rounded-lg">
                  <Award size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Quizzes</p>
                  <p className="text-xl font-extrabold text-white mt-1">{stats.completedQuizzesCount}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-850 pt-5 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Average Quiz Accuracy</span>
                <span className="text-emerald-400 font-bold">{stats.averageQuizScore}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    stats.averageQuizScore >= 70 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${stats.averageQuizScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldAlert className="text-slate-400" size={18} />
              Account Security
            </h3>
            <p className="text-xs text-slate-500 font-light leading-relaxed">
              Your session tokens are stored securely in your browser's LocalStorage and sign out invalidates them automatically. Do not share your JWT credentials.
            </p>
            <div className="flex gap-2 text-xs">
              <button 
                onClick={() => toast.success('MERN security layers active: Password Hashing, JWT verification, route guarding.')}
                className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Key size={12} />
                Show security config
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;

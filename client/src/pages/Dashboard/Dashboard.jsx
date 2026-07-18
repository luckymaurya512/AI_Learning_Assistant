import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Layers, 
  FileQuestion, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  Sparkles,
  Award,
  BookMarked
} from 'lucide-react';
import documentService from '../../services/documentService';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/authContext';
import moment from 'moment';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDocs: 0,
    totalFlashcards: 0,
    totalQuizzes: 0,
    completedQuizzesCount: 0,
    favoritedCards: 0,
    averageQuizScore: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await documentService.getDashboardStats();
        if (res.success) {
          setStats(res.stats);
          setActivities(res.recentActivity);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Study Documents',
      value: stats.totalDocs,
      description: 'PDF documents uploaded',
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-600',
      link: '/documents'
    },
    {
      title: 'Study Flashcards',
      value: stats.totalFlashcards,
      description: `${stats.favoritedCards} cards marked as favorite`,
      icon: Layers,
      color: 'from-purple-500 to-pink-600',
      link: '/flashcards'
    },
    {
      title: 'AI Quizzes Generated',
      value: stats.totalQuizzes,
      description: `${stats.completedQuizzesCount} quizzes completed`,
      icon: FileQuestion,
      color: 'from-teal-500 to-emerald-600',
      link: '/quizzes'
    },
    {
      title: 'Average Quiz Score',
      value: `${stats.averageQuizScore}%`,
      description: 'Based on completed quizzes',
      icon: TrendingUp,
      color: 'from-orange-500 to-amber-600',
      link: '/quizzes'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl border border-indigo-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles size={14} className="animate-pulse" />
            AI-Powered Assistant Active
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-purple-200 tracking-tight leading-none mb-4">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-light">
            Boost your learning today. Upload documents, query the AI chatbot, study interactive flashcards, or test yourself with custom quizzes.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link 
              to="/documents" 
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 flex items-center gap-2"
            >
              Upload Materials
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <Link 
            key={i} 
            to={card.link}
            className="group relative overflow-hidden bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-md"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{card.title}</p>
                <p className="text-3xl font-extrabold text-white mt-2 group-hover:text-indigo-400 transition-colors">
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md`}>
                <card.icon size={22} />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4 font-light">{card.description}</p>
          </Link>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="text-indigo-400" size={20} />
              Recent Activity Feed
            </h2>
          </div>

          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <BookMarked size={48} className="mb-3 opacity-20" />
              <p className="text-sm">No activity recorded yet.</p>
              <p className="text-xs mt-1">Upload a PDF to kickstart your progress feed!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((act, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-800 transition-all"
                >
                  <div className={`p-2 rounded-lg text-white mt-0.5 ${
                    act.type === 'document' 
                      ? 'bg-blue-600/20 text-blue-400' 
                      : 'bg-teal-600/20 text-teal-400'
                  }`}>
                    {act.type === 'document' ? <BookOpen size={16} /> : <Award size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 font-medium truncate">
                      {act.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {moment(act.timestamp).fromNow()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-b from-indigo-950/40 to-slate-900/40 border border-indigo-900/20 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Sparkles className="text-yellow-400" size={20} />
            Study Tip
          </h2>
          <div className="space-y-6 text-sm text-slate-300">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <h3 className="font-semibold text-white mb-1 flex items-center gap-2 text-indigo-400">
                <span>1.</span> Context-Aware QA
              </h3>
              <p className="text-slate-400 leading-relaxed font-light">
                When using the AI Chat tab in the document detail page, the AI retrieves details exclusively from your PDF. Highlight terminology to get rapid, targeted study assistance.
              </p>
            </div>
            
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <h3 className="font-semibold text-white mb-1 flex items-center gap-2 text-pink-400">
                <span>2.</span> Custom Flashcards
              </h3>
              <p className="text-slate-400 leading-relaxed font-light">
                Auto-generate card sets, flag complex queries as favorite, and review them regularly. Flipping is powered by 3D CSS animation.
              </p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <h3 className="font-semibold text-white mb-1 flex items-center gap-2 text-teal-400">
                <span>3.</span> Practice Quizzes
              </h3>
              <p className="text-slate-400 leading-relaxed font-light">
                Generate dynamic multiple choice questions. After submitting, review the feedback block showing correct selections and deep pedagogical explanations written by Gemini.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

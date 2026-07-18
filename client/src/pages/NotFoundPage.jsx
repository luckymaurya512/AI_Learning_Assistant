import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4 space-y-6 animate-fadeIn">
      <div className="h-16 w-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-indigo-400 shadow-lg">
        <HelpCircle size={32} />
      </div>
      
      <div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">404 - Page Not Found</h1>
        <p className="text-slate-400 font-light mt-2 max-w-md mx-auto">
          The study section or resource you are looking for does not exist or has been moved.
        </p>
      </div>

      <Link 
        to="/" 
        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg transition-all flex items-center gap-1.5"
      >
        <ArrowLeft size={14} />
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;

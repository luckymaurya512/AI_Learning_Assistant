import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  HelpCircle, 
  Award,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import quizService from '../../services/quizService';
import toast from 'react-hot-toast';

const QuizTakePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await quizService.getQuizDetails(id);
        if (res.success) {
          setQuiz(res.data);
          // Initialize answers array with nulls
          setSelectedAnswers(new Array(res.data.questions.length).fill(null));
        }
      } catch (err) {
        toast.error('Failed to load quiz details');
        navigate('/quizzes');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, navigate]);

  const handleSelectOption = (optIdx) => {
    setSelectedAnswers(prev => {
      const updated = [...prev];
      updated[currentIdx] = optIdx;
      return updated;
    });
  };

  const handleNext = () => {
    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    // Check if all questions are answered
    const unansweredCount = selectedAnswers.filter(ans => ans === null).length;
    if (unansweredCount > 0) {
      if (!window.confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`)) {
        return;
      }
    }

    try {
      setSubmitting(true);
      toast.loading('Grading quiz...', { id: 'grading' });
      // Map null to -1 to prevent validation errors in schema
      const cleanedAnswers = selectedAnswers.map(ans => ans === null ? -1 : ans);
      
      const res = await quizService.submitQuizAnswers(id, cleanedAnswers);
      if (res.success) {
        toast.success('Quiz graded successfully!', { id: 'grading' });
        navigate(`/quizzes/result/${id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit quiz results', { id: 'grading' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="animate-spin text-indigo-500" size={36} />
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIdx];
  const totalQuestions = quiz.questions.length;
  const isQuestionAnswered = selectedAnswers[currentIdx] !== null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Navbar */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <Link to="/documents" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium transition-colors">
          <ArrowLeft size={16} />
          Back to Study
        </Link>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Quiz: Question {currentIdx + 1} of {totalQuestions}
        </span>
        <div className="flex items-center gap-1 text-xs text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded font-medium">
          <ClipboardList size={12} />
          AI Mock Exam
        </div>
      </div>

      {/* Stepper Progress Indicator */}
      <div className="flex gap-1.5 items-center">
        {quiz.questions.map((_, index) => {
          let dotColor = 'bg-slate-950 border border-slate-800';
          if (index === currentIdx) {
            dotColor = 'bg-indigo-500 border border-indigo-500 shadow-md shadow-indigo-500/20';
          } else if (selectedAnswers[index] !== null) {
            dotColor = 'bg-slate-700 border border-slate-700';
          }
          return (
            <button 
              key={index} 
              onClick={() => setCurrentIdx(index)}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${dotColor}`}
            ></button>
          );
        })}
      </div>

      {/* Question Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-600/10 text-indigo-400 rounded-lg mt-0.5">
            <HelpCircle size={20} />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
            {currentQuestion.questionText}
          </h2>
        </div>

        {/* Options List */}
        <div className="space-y-3 pt-2">
          {currentQuestion.options.map((option, optIdx) => {
            const isSelected = selectedAnswers[currentIdx] === optIdx;
            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border text-sm text-left transition-all duration-200 ${
                  isSelected 
                    ? 'bg-indigo-600/15 border-indigo-500 text-white font-medium shadow-md shadow-indigo-500/5' 
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors ${
                    isSelected 
                      ? 'bg-indigo-500 border-indigo-400 text-white' 
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}>
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span>{option}</span>
                </div>
                {isSelected && (
                  <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Nav Controls */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="flex items-center gap-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-850 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        {currentIdx === totalQuestions - 1 ? (
          <button
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className="flex items-center gap-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all shadow-lg hover:shadow-teal-500/20 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Finish & Submit'}
            <Award size={14} />
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-850 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all"
          >
            Next
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizTakePage;

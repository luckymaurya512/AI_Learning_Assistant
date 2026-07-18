import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Loader2, 
  Award, 
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import quizService from '../../services/quizService';
import toast from 'react-hot-toast';

const QuizResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedExplanations, setExpandedExplanations] = useState({});

  useEffect(() => {
    const fetchQuizResult = async () => {
      try {
        setLoading(true);
        const res = await quizService.getQuizDetails(id);
        if (res.success) {
          setQuiz(res.data);
          // Initialize first explanation as expanded
          setExpandedExplanations({ 0: true });
        }
      } catch (err) {
        toast.error('Failed to load quiz results');
        navigate('/documents');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizResult();
  }, [id, navigate]);

  const toggleExplanation = (index) => {
    setExpandedExplanations(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="animate-spin text-indigo-500" size={36} />
      </div>
    );
  }

  // Calculate statistics
  const totalQuestions = quiz.questions.length;
  let correctCount = 0;
  quiz.questions.forEach((q, idx) => {
    if (quiz.userAnswers[idx] === q.correctOptionIndex) {
      correctCount++;
    }
  });

  const incorrectCount = totalQuestions - correctCount;
  const isPassed = quiz.score >= 70;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Navbar */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <Link 
          to={`/documents/${quiz.document?._id || ''}`} 
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Document Studies
        </Link>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Quiz Results Dashboard
        </span>
      </div>

      {/* Analytics Score Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-850 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-3 max-w-sm text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={12} className="animate-pulse" />
            Evaluation Completed
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {isPassed ? 'Excellent progress!' : 'Keep practicing!'}
          </h1>
          <p className="text-sm text-slate-400 font-light leading-relaxed">
            {isPassed 
              ? 'You have a solid understanding of the document material. Review the AI explanations below to clarify fine details.'
              : 'Review the explanations below to study the concepts and retake the quiz to improve your score.'}
          </p>
        </div>

        {/* Circular Progress Wheel */}
        <div className="flex flex-col items-center">
          <div className="relative h-32 w-32 flex items-center justify-center">
            {/* SVG circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="54"
                strokeWidth="10"
                stroke="#0f172a"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="54"
                strokeWidth="10"
                stroke={isPassed ? '#10b981' : '#f59e0b'}
                fill="transparent"
                strokeDasharray={2 * Math.PI * 54}
                strokeDashoffset={2 * Math.PI * 54 * (1 - quiz.score / 100)}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-white">{quiz.score}%</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                {correctCount} / {totalQuestions} Correct
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Score</p>
          <p className="text-2xl font-extrabold text-white mt-1">{quiz.score}%</p>
        </div>
        <div className="bg-slate-900 border border-slate-855 p-4 rounded-xl text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Questions</p>
          <p className="text-2xl font-extrabold text-indigo-400 mt-1">{totalQuestions}</p>
        </div>
        <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Correct</p>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">{correctCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Incorrect</p>
          <p className="text-2xl font-extrabold text-amber-500 mt-1">{incorrectCount}</p>
        </div>
      </div>

      {/* Review Questions Panel */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="text-indigo-400" size={18} />
          Detailed Questions Review
        </h2>

        <div className="space-y-4">
          {quiz.questions.map((question, qIdx) => {
            const userAnswer = quiz.userAnswers[qIdx];
            const isCorrect = userAnswer === question.correctOptionIndex;
            const isOpen = !!expandedExplanations[qIdx];

            return (
              <div 
                key={question._id || qIdx}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Accordion Header */}
                <div 
                  onClick={() => toggleExplanation(qIdx)}
                  className="px-5 py-4 flex justify-between items-start gap-4 cursor-pointer hover:bg-slate-950/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isCorrect ? (
                        <CheckCircle2 className="text-emerald-400" size={18} />
                      ) : (
                        <XCircle className="text-amber-500" size={18} />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white leading-relaxed">
                        {question.questionText}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1 font-light">
                        Selected: Option {String.fromCharCode(65 + userAnswer)} | Correct: Option {String.fromCharCode(65 + question.correctOptionIndex)}
                      </p>
                    </div>
                  </div>
                  <button className="text-slate-500 hover:text-slate-300 mt-0.5">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Accordion Body */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-950/80 bg-slate-950/30 space-y-4">
                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {question.options.map((option, optIdx) => {
                        const isSelected = userAnswer === optIdx;
                        const isAnswerKey = question.correctOptionIndex === optIdx;
                        
                        let optionStyle = 'bg-slate-950 border-slate-900 text-slate-400';
                        if (isAnswerKey) {
                          optionStyle = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-medium';
                        } else if (isSelected) {
                          optionStyle = 'bg-red-500/10 border-red-500/30 text-red-300 font-medium';
                        }

                        return (
                          <div 
                            key={optIdx}
                            className={`px-4 py-2.5 rounded-xl border text-xs flex items-center justify-between ${optionStyle}`}
                          >
                            <span className="truncate">{option}</span>
                            {isAnswerKey ? (
                              <CheckCircle2 size={12} className="text-emerald-400 shrink-0 ml-1" />
                            ) : isSelected ? (
                              <XCircle size={12} className="text-red-400 shrink-0 ml-1" />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>

                    {/* AI Explanation Box */}
                    <div className="p-4 bg-gradient-to-r from-slate-950 to-indigo-950/40 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                        <Sparkles size={12} className="text-purple-400" />
                        AI Tutor Explanation
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-light">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;

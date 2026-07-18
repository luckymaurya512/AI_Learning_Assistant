import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  MessageSquare, 
  Sparkles, 
  Layers, 
  FileQuestion, 
  Send, 
  Loader2, 
  BookOpen, 
  ChevronRight, 
  Trash2,
  Bookmark,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import documentService from '../../services/documentService';
import aiService from '../../services/aiService';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const DocumentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  
  // Chat States
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Summary & Explainer States
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [concept, setConcept] = useState('');
  const [explanation, setExplanation] = useState('');
  const [explainLoading, setExplainLoading] = useState(false);

  // Flashcards States
  const [flashcardCount, setFlashcardCount] = useState(5);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [generatedCards, setGeneratedCards] = useState([]);

  // Quiz States
  const [quizQuestionCount, setQuizQuestionCount] = useState(5);
  const [quizLoading, setQuizLoading] = useState(false);

  useEffect(() => {
    const fetchDocumentData = async () => {
      try {
        setLoading(true);
        const res = await documentService.getDocument(id);
        if (res.success) {
          setDoc(res.data);
          // Fetch chat history
          const chatRes = await aiService.getChatHistory(id);
          if (chatRes.success) {
            setChatMessages(chatRes.data);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load document details');
        navigate('/documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentData();
  }, [id, navigate]);

  // Scroll to bottom of chat when new message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const messageText = userInput;
    setUserInput('');
    
    // Add user message to state optimistically
    const tempUserMsg = { _id: Date.now().toString(), sender: 'user', message: messageText };
    setChatMessages(prev => [...prev, tempUserMsg]);

    try {
      setChatLoading(true);
      const res = await aiService.sendMessage(id, messageText);
      if (res.success) {
        setChatMessages(prev => {
          // Replace temp message or just append AI response
          return [...prev.filter(m => m._id !== tempUserMsg._id), tempUserMsg, res.data];
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('AI response error. Please check backend connection.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('Clear all conversation history for this document?')) {
      try {
        await aiService.clearChatHistory(id);
        setChatMessages([]);
        toast.success('Chat history cleared');
      } catch (err) {
        toast.error('Failed to clear chat history');
      }
    }
  };

  const handleGenerateSummary = async () => {
    try {
      setSummaryLoading(true);
      const res = await aiService.getSummary(id);
      if (res.success) {
        setSummary(res.summary);
      }
    } catch (err) {
      toast.error('Error generating summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleExplainConcept = async (e) => {
    e.preventDefault();
    if (!concept.trim()) {
      toast.error('Please enter a concept name');
      return;
    }

    try {
      setExplanation('');
      setExplainLoading(true);
      const res = await aiService.explainConcept(id, concept);
      if (res.success) {
        setExplanation(res.explanation);
      }
    } catch (err) {
      toast.error('Error explaining concept');
    } finally {
      setExplainLoading(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    try {
      setGeneratedCards([]);
      setCardsLoading(true);
      toast.loading('Generating flashcards from content...', { id: 'cards' });
      const res = await aiService.generateFlashcards(id, flashcardCount);
      if (res.success) {
        toast.success(`Generated ${res.count} flashcards successfully!`, { id: 'cards' });
        setGeneratedCards(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate flashcards', { id: 'cards' });
    } finally {
      setCardsLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    try {
      setQuizLoading(true);
      toast.loading('Generating your practice quiz...', { id: 'quiz' });
      const res = await aiService.generateQuiz(id, quizQuestionCount);
      if (res.success) {
        toast.success('Quiz generated! Redirecting to take it...', { id: 'quiz' });
        navigate(`/quizzes/take/${res.data._id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate quiz', { id: 'quiz' });
    } finally {
      setQuizLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const pdfUrl = `http://localhost:5000/${doc.filepath}`;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn h-[calc(100vh-140px)]">
      {/* Document Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 border border-slate-800 rounded-2xl p-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-600/10 text-indigo-400">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">{doc.title}</h1>
            <p className="text-xs text-slate-500 font-light mt-0.5">MERN AI Study Assistant Context Active</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/documents" className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            Back to Library
          </Link>
        </div>
      </div>

      {/* Main Workspace split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        
        {/* PDF Viewer Panel (Left) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full shadow-lg">
          <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2">
            <BookOpen size={16} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Embedded PDF Viewer</span>
          </div>
          <div className="flex-1 bg-slate-950">
            <iframe 
              src={`${pdfUrl}#toolbar=0`} 
              className="w-full h-full border-none"
              title={doc.title}
            >
              <p className="text-slate-400 p-8 text-center text-sm">
                Your browser does not support iframes. 
                <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-indigo-400 underline ml-1">
                  Click here to download PDF
                </a>.
              </p>
            </iframe>
          </div>
        </div>

        {/* AI Control Panel (Right) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full shadow-lg overflow-hidden">
          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-800 bg-slate-950/80 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-5 py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'chat' 
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare size={14} />
              AI Chat Q&A
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-1.5 px-5 py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'summary' 
                  ? 'border-purple-500 text-purple-400 bg-purple-500/5' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles size={14} />
              Summary & Explainer
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`flex items-center gap-1.5 px-5 py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'flashcards' 
                  ? 'border-pink-500 text-pink-400 bg-pink-500/5' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers size={14} />
              Flashcards
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-1.5 px-5 py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'quiz' 
                  ? 'border-teal-500 text-teal-400 bg-teal-500/5' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileQuestion size={14} />
              AI Quiz
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto p-5 min-h-0 bg-slate-900/40">
            
            {/* CHAT TAB */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                {/* Chat History Panel */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 min-h-0">
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center py-12 px-4">
                      <MessageSquare size={40} className="mb-2 text-indigo-400/40" />
                      <p className="text-sm font-semibold text-slate-400">Context-Aware Study Chat</p>
                      <p className="text-xs text-slate-500 max-w-xs mt-1 font-light">
                        Ask questions about chapters, diagrams, concepts or summarize paragraphs. The AI searches document content directly.
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div 
                        key={msg._id || idx}
                        className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-bl-none prose prose-invert max-w-none'
                        }`}>
                          {msg.sender === 'user' ? (
                            msg.message
                          ) : (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.message}</ReactMarkdown>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {chatLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 border border-slate-800/50 p-3 rounded-2xl mr-auto rounded-bl-none max-w-[85%]">
                      <Loader2 size={14} className="animate-spin text-indigo-500" />
                      Thinking...
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Form Inputs */}
                <form onSubmit={handleSendMessage} className="flex gap-2 items-center bg-slate-950/80 p-2 border border-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={handleClearChat}
                    disabled={chatMessages.length === 0}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-900 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Clear history"
                  >
                    <Trash2 size={16} />
                  </button>
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask standard questions about this PDF..."
                    className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-sm text-slate-200 placeholder-slate-500 py-1"
                  />
                  <button
                    type="submit"
                    disabled={!userInput.trim() || chatLoading}
                    className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            )}

            {/* SUMMARY & EXPLAINER TAB */}
            {activeTab === 'summary' && (
              <div className="space-y-6">
                
                {/* Document Summary Block */}
                <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={16} className="text-purple-400" />
                      Document Summary
                    </h3>
                    {!summary && (
                      <button
                        onClick={handleGenerateSummary}
                        disabled={summaryLoading}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg disabled:opacity-50 flex items-center gap-1 transition-all"
                      >
                        {summaryLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                        Generate Summary
                      </button>
                    )}
                  </div>

                  {summaryLoading && (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                      <Loader2 size={24} className="animate-spin text-purple-500" />
                      <span className="text-xs">Analyzing PDF content and drafting summary...</span>
                    </div>
                  )}

                  {summary && (
                    <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl max-h-[300px] overflow-y-auto text-sm leading-relaxed text-slate-300 prose prose-invert font-light">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
                    </div>
                  )}

                  {!summary && !summaryLoading && (
                    <p className="text-xs text-slate-500 font-light">Generate a structured learning outline of the document content including takeaways and core concepts.</p>
                  )}
                </div>

                {/* Concept Explainer Block */}
                <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl space-y-4">
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle size={16} className="text-indigo-400" />
                    Concept Explainer
                  </h3>
                  
                  <form onSubmit={handleExplainConcept} className="flex gap-2">
                    <input
                      type="text"
                      value={concept}
                      onChange={(e) => setConcept(e.target.value)}
                      placeholder="Enter a keyword or concept to explain..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="submit"
                      disabled={explainLoading || !concept.trim()}
                      className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-50 transition-colors whitespace-nowrap"
                    >
                      {explainLoading ? 'Explaining...' : 'Explain'}
                    </button>
                  </form>

                  {explainLoading && (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
                      <Loader2 size={24} className="animate-spin text-indigo-500" />
                      <span className="text-xs">Deep analyzing document context...</span>
                    </div>
                  )}

                  {explanation && !explainLoading && (
                    <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl text-sm leading-relaxed text-slate-300 prose prose-invert font-light">
                      <h4 className="text-white font-semibold mb-2">Explanation for "{concept}":</h4>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{explanation}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FLASHCARDS GENERATOR TAB */}
            {activeTab === 'flashcards' && (
              <div className="space-y-6">
                <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl space-y-4">
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider">Auto-Generate Study Flashcards</h3>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-400 mb-1">Number of cards (3 - 10)</label>
                      <input
                        type="number"
                        min="3"
                        max="10"
                        value={flashcardCount}
                        onChange={(e) => setFlashcardCount(parseInt(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={handleGenerateFlashcards}
                      disabled={cardsLoading}
                      className="mt-5 px-5 py-2 text-xs font-bold text-white bg-pink-600 hover:bg-pink-500 rounded-xl disabled:opacity-50 transition-all uppercase tracking-wider"
                    >
                      {cardsLoading ? 'Generating...' : 'Generate Set'}
                    </button>
                  </div>
                </div>

                {generatedCards.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-semibold text-white">Preview Set ({generatedCards.length} Cards)</h4>
                      <Link 
                        to={`/flashcards`} 
                        className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1 transition-colors"
                      >
                        Study Full Deck
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                    
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {generatedCards.map((card, i) => (
                        <div key={i} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex flex-col gap-1 text-xs">
                          <p className="text-slate-400 font-semibold">Q: {card.question}</p>
                          <p className="text-slate-300 font-light mt-1">A: {card.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* QUIZ GENERATOR TAB */}
            {activeTab === 'quiz' && (
              <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl space-y-4">
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">AI Practice Quiz Generator</h3>
                <p className="text-xs text-slate-500 font-light">Custom build multiple choice quizzes from the PDF text context to verify understanding and details retrieval.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Configure Question Count</label>
                    <div className="flex gap-2">
                      {[3, 5, 8, 10].map(cnt => (
                        <button
                          key={cnt}
                          onClick={() => setQuizQuestionCount(cnt)}
                          className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                            quizQuestionCount === cnt 
                              ? 'bg-teal-500/10 border-teal-500 text-teal-400' 
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {cnt} Qs
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateQuiz}
                    disabled={quizLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-transparent text-xs font-bold uppercase tracking-wider rounded-xl text-white bg-teal-600 hover:bg-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-teal-500/10"
                  >
                    {quizLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Generating Quiz...
                      </>
                    ) : (
                      'Generate & Start Quiz'
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default DocumentDetailPage;

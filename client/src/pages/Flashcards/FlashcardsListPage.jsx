import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Layers, 
  Star, 
  Trash2, 
  Search, 
  Loader2, 
  Play, 
  Filter, 
  Plus, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import flashCardService from '../../services/flashCardService';
import documentService from '../../services/documentService';
import toast from 'react-hot-toast';

const FlashcardsListPage = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedDoc, setSelectedDoc] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Manual Creation Modal/Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newDocId, setNewDocId] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const res = await flashCardService.getFlashcards(selectedDoc, showFavoritesOnly);
      if (res.success) {
        setFlashcards(res.data);
      }
    } catch (err) {
      toast.error('Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await documentService.getDocuments();
        if (res.success) {
          setDocuments(res.data);
          if (res.data.length > 0 && !newDocId) {
            setNewDocId(res.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Error fetching documents', err);
      }
    };
    fetchDocs();
  }, []);

  useEffect(() => {
    fetchFlashcards();
  }, [selectedDoc, showFavoritesOnly]);

  const handleToggleFavorite = async (id) => {
    try {
      const res = await flashCardService.toggleFavorite(id);
      if (res.success) {
        setFlashcards(flashcards.map(card => 
          card._id === id ? { ...card, isFavorite: res.data.isFavorite } : card
        ));
      }
    } catch (err) {
      toast.error('Failed to update favorite status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      try {
        const res = await flashCardService.deleteFlashcard(id);
        if (res.success) {
          toast.success('Flashcard deleted');
          setFlashcards(flashcards.filter(card => card._id !== id));
        }
      } catch (err) {
        toast.error('Failed to delete flashcard');
      }
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim() || !newDocId) {
      toast.error('Please enter a question, answer, and select a document');
      return;
    }

    try {
      setCreating(true);
      const res = await flashCardService.createFlashcard(newQuestion, newAnswer, newDocId);
      if (res.success) {
        toast.success('Flashcard created manually!');
        setNewQuestion('');
        setNewAnswer('');
        setShowAddForm(false);
        fetchFlashcards();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating flashcard');
    } finally {
      setCreating(false);
    }
  };

  const filteredCards = flashcards.filter(card => 
    card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Study Flashcards</h1>
          <p className="text-slate-400 font-light mt-1">Review terminology and concepts using interactive flipping cards.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
          >
            <Plus size={16} />
            Add Card
          </button>
          
          {filteredCards.length > 0 && (
            <Link
              to={`/flashcards/study?documentId=${selectedDoc}&favorite=${showFavoritesOnly}`}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-pink-600 hover:bg-pink-500 rounded-xl transition-all shadow-md hover:shadow-pink-500/10"
            >
              <Play size={14} />
              Study Deck ({filteredCards.length})
            </Link>
          )}
        </div>
      </div>

      {/* Manual Form (Conditional) */}
      {showAddForm && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl animate-slideDown max-w-xl">
          <h3 className="font-bold text-white mb-4 text-base">Create Custom Flashcard</h3>
          <form onSubmit={handleCreateCard} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Study Document Reference
              </label>
              <select
                value={newDocId}
                onChange={(e) => setNewDocId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none"
              >
                {documents.map(d => (
                  <option key={d._id} value={d._id}>{d.title}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Question
              </label>
              <input
                type="text"
                placeholder="E.g., What is ATP?"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Answer / Definition
              </label>
              <textarea
                placeholder="E.g., Adenosine triphosphate is the primary energy carrier in cells."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                rows="3"
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
              >
                {creating ? 'Saving...' : 'Save Card'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Document Filter */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 min-w-[200px]">
            <Filter size={14} className="text-slate-500" />
            <select
              value={selectedDoc}
              onChange={(e) => setSelectedDoc(e.target.value)}
              className="bg-transparent text-xs text-white border-none outline-none focus:ring-0 w-full"
            >
              <option value="">All Documents</option>
              {documents.map(d => (
                <option key={d._id} value={d._id}>{d.title}</option>
              ))}
            </select>
          </div>

          {/* Favorite Toggle Filter */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              showFavoritesOnly 
                ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400' 
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star size={14} fill={showFavoritesOnly ? "currentColor" : "none"} />
            Favorites Only
          </button>
        </div>

        {/* Text Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search size={14} />
          </div>
          <input
            type="text"
            placeholder="Search deck contents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Cards Table/List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 border border-slate-800 rounded-2xl text-slate-500 text-center">
          <Layers size={64} className="mb-4 opacity-10" />
          <p className="text-sm font-medium">No study flashcards found</p>
          <p className="text-xs mt-1 font-light max-w-xs">
            {selectedDoc || showFavoritesOnly 
              ? 'Try modifying your filters, or generate new cards in the document studies tab.'
              : 'Upload a study document to automatically generate cards using Gemini AI!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <div 
              key={card._id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl flex flex-col justify-between h-44 shadow-sm"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase truncate max-w-[150px]">
                    {card.document?.title || 'Manual Card'}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleToggleFavorite(card._id)}
                      className={`p-1 rounded hover:bg-slate-950 transition-colors ${
                        card.isFavorite ? 'text-yellow-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Star size={14} fill={card.isFavorite ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={() => handleDelete(card._id)}
                      className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-950 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <h4 className="text-sm font-semibold text-white mt-3 line-clamp-2">
                  {card.question}
                </h4>
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-light italic">Hover to see answer</span>
                <span className="text-indigo-400 font-medium opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                  {card.answer}
                </span>
                <span className="text-slate-400 font-light truncate max-w-[150px] line-clamp-1 block text-right">
                  {card.answer}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlashcardsListPage;

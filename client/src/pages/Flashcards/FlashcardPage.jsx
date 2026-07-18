import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Star, 
  Loader2, 
  Layers, 
  BookMarked,
  Sparkles
} from 'lucide-react';
import flashCardService from '../../services/flashCardService';
import toast from 'react-hot-toast';

const FlashcardPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const documentId = searchParams.get('documentId') || '';
  const favoriteParam = searchParams.get('favorite') === 'true';

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        setLoading(true);
        const res = await flashCardService.getFlashcards(documentId, favoriteParam);
        if (res.success) {
          setCards(res.data);
        }
      } catch (err) {
        toast.error('Failed to load flashcard deck');
      } finally {
        setLoading(false);
      }
    };
    fetchDeck();
  }, [documentId, favoriteParam]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      // Small timeout to allow flip-back transition before loading next question
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 200);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
      }, 200);
    }
  };

  const handleToggleFavorite = async (e, id) => {
    e.stopPropagation(); // prevent flipping the card when clicking the star
    try {
      const res = await flashCardService.toggleFavorite(id);
      if (res.success) {
        setCards(cards.map((card, idx) => 
          idx === currentIndex ? { ...card, isFavorite: res.data.isFavorite } : card
        ));
      }
    } catch (err) {
      toast.error('Failed to update favorite status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="animate-spin text-indigo-500" size={36} />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 space-y-6">
        <Layers size={64} className="mx-auto text-slate-600 opacity-20" />
        <h2 className="text-xl font-bold text-white">No Flashcards to Study</h2>
        <p className="text-sm text-slate-400 font-light">
          No cards matched your current filters. Generate flashcards from your documents, or create manual cards.
        </p>
        <Link 
          to="/flashcards" 
          className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition-colors"
        >
          Back to List
        </Link>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  // 3D Card Inline Styles
  const deckContainerStyle = {
    perspective: '1200px'
  };

  const cardInnerStyle = {
    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    transformStyle: 'preserve-3d',
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
  };

  const cardFaceCommonStyle = {
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRadius: '1.5rem',
    padding: '2rem'
  };

  const cardFaceBackStyle = {
    ...cardFaceCommonStyle,
    transform: 'rotateY(180deg)'
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Navbar */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <Link to="/flashcards" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium transition-colors">
          <ArrowLeft size={16} />
          All Flashcards
        </Link>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Study Deck ({currentIndex + 1} of {cards.length})
        </span>
        <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded">
          {Math.round(((currentIndex + 1) / cards.length) * 100)}% Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-pink-500 to-indigo-500 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        ></div>
      </div>

      {/* Interactive 3D Card Deck */}
      <div 
        onClick={handleFlip}
        style={deckContainerStyle}
        className="w-full h-80 sm:h-96 cursor-pointer select-none group"
      >
        <div 
          style={cardInnerStyle}
          className="w-full h-full relative"
        >
          {/* FRONT SIDE (Question) */}
          <div 
            style={cardFaceCommonStyle}
            className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 shadow-2xl relative"
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles size={12} className="text-indigo-400 animate-pulse" />
                Question Front
              </span>
              <button
                onClick={(e) => handleToggleFavorite(e, currentCard._id)}
                className={`p-2 rounded-lg hover:bg-slate-950 transition-colors ${
                  currentCard.isFavorite ? 'text-yellow-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Star size={18} fill={currentCard.isFavorite ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Question Text */}
            <div className="text-center my-auto px-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-relaxed tracking-wide">
                {currentCard.question}
              </h2>
            </div>

            {/* Footer */}
            <div className="flex justify-center items-center gap-2 text-xs text-slate-500 font-light">
              <RotateCw size={14} className="text-indigo-400" />
              Click card to reveal definition
            </div>
          </div>

          {/* BACK SIDE (Answer) */}
          <div 
            style={cardFaceBackStyle}
            className="bg-gradient-to-br from-slate-900 via-slate-900 to-pink-950 border border-slate-800 shadow-2xl relative"
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
                <BookMarked size={12} className="text-pink-400" />
                Answer Back
              </span>
              <button
                onClick={(e) => handleToggleFavorite(e, currentCard._id)}
                className={`p-2 rounded-lg hover:bg-slate-950 transition-colors ${
                  currentCard.isFavorite ? 'text-yellow-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Star size={18} fill={currentCard.isFavorite ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Answer Text */}
            <div className="text-center my-auto px-4 overflow-y-auto max-h-40 scrollbar-thin">
              <p className="text-base sm:text-lg text-slate-200 font-medium leading-relaxed">
                {currentCard.answer}
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-center items-center gap-2 text-xs text-slate-500 font-light">
              <RotateCw size={14} className="text-pink-400" />
              Click card to see question
            </div>
          </div>

        </div>
      </div>

      {/* Nav Controls */}
      <div className="flex items-center justify-between gap-4 max-w-xs mx-auto">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-850 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={20} />
        </button>

        <span className="text-xs font-semibold text-slate-400">
          Card {currentIndex + 1} of {cards.length}
        </span>

        <button
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-850 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default FlashcardPage;

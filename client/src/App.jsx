import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authContext';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// Layout & Common
import Navbar from './components/layout/Navbar';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import DocumentListPagge from './pages/Documents/DocumentListPagge';
import DocumentDetailPage from './pages/Documents/DocumentDetailPage';
import FlashcardPage from './pages/Flashcards/FlashcardPage';
import FlashcardsListPage from './pages/Flashcards/FlashcardsListPage';
import QuizTakePage from './pages/Quizzess/QuizTakePage';
import QuizResultPage from './pages/Quizzess/QuizResultPage';
import ProfilePage from './pages/Profile/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Private Route Guard
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

// Public Route Guard (prevents logged in users from visiting login/register)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />

          {/* Protected Study Assistant Routes */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/documents" 
            element={
              <PrivateRoute>
                <DocumentListPagge />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/documents/:id" 
            element={
              <PrivateRoute>
                <DocumentDetailPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/flashcards" 
            element={
              <PrivateRoute>
                <FlashcardsListPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/flashcards/study" 
            element={
              <PrivateRoute>
                <FlashcardPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/quizzes/take/:id" 
            element={
              <PrivateRoute>
                <QuizTakePage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/quizzes/result/:id" 
            element={
              <PrivateRoute>
                <QuizResultPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } 
          />

          {/* 404 Route */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen bg-slate-950 text-white flex flex-col">
                <Navbar />
                <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
                  <NotFoundPage />
                </main>
              </div>
            } 
          />
        </Routes>
      </Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'bg-slate-900 border border-slate-800 text-white rounded-xl text-xs font-medium',
          duration: 4000,
        }}
      />
    </AuthProvider>
  );
}

export default App;

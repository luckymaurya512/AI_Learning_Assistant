import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  Eye, 
  Loader2, 
  Search,
  BookOpen,
  Calendar,
  Layers
} from 'lucide-react';
import documentService from '../../services/documentService';
import toast from 'react-hot-toast';

const DocumentListPagge = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Upload States
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await documentService.getDocuments();
      if (res.success) {
        setDocuments(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Only PDF documents are supported');
        return;
      }
      setFile(selectedFile);
      if (!title) {
        // Auto populate title field with clean file name
        setTitle(selectedFile.name.replace('.pdf', ''));
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a PDF file first');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('title', title);

    try {
      setUploading(true);
      toast.loading('Uploading and analyzing PDF... This may take a few seconds.', { id: 'upload' });
      const res = await documentService.uploadDocument(formData);
      if (res.success) {
        toast.success('Document uploaded and processed successfully!', { id: 'upload' });
        setTitle('');
        setFile(null);
        // Reset file input value
        document.getElementById('file-upload').value = '';
        fetchDocuments();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error processing document', { id: 'upload' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This will delete all associated chats, quizzes, and flashcards.`)) {
      try {
        const res = await documentService.deleteDocument(id);
        if (res.success) {
          toast.success('Document deleted successfully');
          setDocuments(documents.filter(doc => doc._id !== id));
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete document');
      }
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Study Materials</h1>
          <p className="text-slate-400 font-light mt-1">Upload and manage your PDF study guides, textbooks, and notes.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Upload Panel */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <UploadCloud size={20} className="text-indigo-400" />
            Upload New Document
          </h2>
          
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Document Title
              </label>
              <input
                type="text"
                placeholder="E.g., Biology Chapter 3 Notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                PDF File (Max 10MB)
              </label>
              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 text-center cursor-pointer transition-colors relative group">
                <input
                  type="file"
                  id="file-upload"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="mx-auto text-slate-500 group-hover:text-indigo-400 transition-colors mb-2" size={36} />
                <p className="text-sm text-slate-300 font-medium truncate">
                  {file ? file.name : 'Select or drag study PDF'}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-light">
                  {file ? formatBytes(file.size) : 'PDF formats only'}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full flex items-center justify-center gap-2 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-indigo-500/10"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Analyzing text...
                </>
              ) : (
                'Upload and Analyze'
              )}
            </button>
          </form>
        </div>

        {/* Documents List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-purple-400" />
            Your Study Library ({filteredDocs.length})
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-20 bg-slate-900/20 border border-slate-800 rounded-2xl">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 border border-slate-800 rounded-2xl text-slate-500">
              <FileText size={64} className="mb-4 opacity-10" />
              <p className="text-sm font-medium">No study materials in your library</p>
              <p className="text-xs mt-1 font-light">Upload a PDF to get started with learning tools.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocs.map((doc) => (
                <div 
                  key={doc._id} 
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-lg shadow-sm group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2.5 rounded-lg bg-indigo-600/10 text-indigo-400">
                        <FileText size={20} />
                      </div>
                      <button 
                        onClick={() => handleDelete(doc._id, doc.title)}
                        className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-950 transition-colors"
                        title="Delete document"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <h3 className="text-base font-semibold text-white mt-3 group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {doc.title}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers size={12} />
                        {formatBytes(doc.fileSize)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-end">
                    <Link 
                      to={`/documents/${doc._id}`}
                      className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-indigo-600 hover:text-white border border-slate-800 hover:border-transparent text-xs font-semibold text-slate-300 transition-all flex items-center gap-1.5"
                    >
                      <Eye size={14} />
                      Study with AI
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentListPagge;

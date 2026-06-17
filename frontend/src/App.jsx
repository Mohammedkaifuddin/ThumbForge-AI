import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Image, History, Wand2, Trash2, Loader2, LogOut } from 'lucide-react';
import Auth from './Auth'; // Import the new Login controller

// const API_BASE_URL = 'http://localhost:5000/api/thumbnail';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/thumbnail`;

function App() {
  const [token, setToken] = useState(localStorage.getItem('thumbforge_token') || '');
  const [title, setTitle] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  const handleLogout = () => {
    setToken('');
    setHistory([]);
    setCurrentImage(null);
  };

  const fetchHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history`);
      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (err) {
      if (err.response?.status === 401) handleLogout(); // Clear invalid tokens
    }
  }, []);

  // Automatically configure Axios base header when token shifts
  useEffect(() => {
    if (!token) {
      localStorage.removeItem('thumbforge_token');
      delete axios.defaults.headers.common['Authorization'];
      return;
    }

    localStorage.setItem('thumbforge_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const loadHistory = async () => {
      await fetchHistory();
    };

    loadHistory();
  }, [token, fetchHistory]);

  const handleLoginSuccess = (userToken) => {
    setToken(userToken);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError('');
    setCurrentImage(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/generate`, { title, style });
      if (response.data.success) {
        setCurrentImage(response.data.data.imageUrl);
        setTitle('');
        fetchHistory();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Generation failed.');
    } {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`);
      if (response.data.success) {
        fetchHistory();
        if (currentImage === history.find(item => item._id === id)?.imageUrl) {
          setCurrentImage(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 🛡️ Guard Clause: Route to login page instantly if unauthenticated
  if (!token) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* Navigation Header */}
      <header className="max-w-6xl mx-auto mb-10 border-b border-slate-800 pb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">
            <Image size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            THUMBFORGE AI
          </h1>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white px-4 py-2 rounded-xl border border-slate-700 transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Column */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-slate-800/50 border border-slate-800 p-6 rounded-2xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Wand2 size={18} className="text-indigo-400" /> Configure Thumbnail
            </h2>
            
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Ertugrul Ghazi or Python Tutorial"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors text-white"
                />
              </div>

              <div>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors text-white"
                >
                  <option value="cinematic">Cinematic Portrait</option>
                  <option value="vibrant 3d render">Vibrant 3D Render</option>
                  <option value="neon cyberpunk">Neon Cyberpunk</option>
                </select>
              </div>

              {error && <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-xl">{error}</div>}

              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Forge Thumbnail'}
              </button>
            </form>
          </div>

          {/* Canvas Rendering Preview Area */}
          <div className="bg-slate-800/30 border border-slate-800/60 p-4 rounded-2xl flex flex-col items-center justify-center min-h-[260px]">
            {currentImage ? (
              <img src={currentImage} alt="Live Output" className="w-full h-auto aspect-video object-cover rounded-xl border border-slate-700" />
            ) : (
              <p className="text-sm text-slate-500">Submit a title to generate thumbnail mockups</p>
            )}
          </div>
        </section>

        {/* Right Gallery Column */}
        <section className="lg:col-span-7 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <History size={18} className="text-slate-400" /> Generation Archive ({history.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[640px] overflow-y-auto pr-2">
            {history.map((item) => (
              <div key={item._id} className="bg-slate-800/40 border border-slate-800 rounded-xl overflow-hidden group relative">
                <img src={item.imageUrl} alt={item.title} className="w-full aspect-video object-cover" />
                <button
                  onClick={() => handleDelete(item._id)}
                  className="absolute top-2 right-2 bg-slate-950/80 text-slate-400 hover:text-red-400 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
                <div className="p-3 bg-slate-900/40">
                  <p className="text-sm font-semibold truncate capitalize">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
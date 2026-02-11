import { useEffect, useMemo, useState } from 'react';
import { Heart, Image as ImageIcon, Plus, Smile } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import client from '../lib/axios';

const moodOptions = ['happy', 'excited', 'loved', 'calm', 'tired', 'sad', 'stressed'];

const Dashboard = ({ setUser }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');

  const [mood, setMood] = useState('happy');
  const [savingMood, setSavingMood] = useState(false);

  const [memoryForm, setMemoryForm] = useState({
    image_path: '',
    caption: '',
    date_occurred: new Date().toISOString().slice(0, 10),
  });
  const [savingMemory, setSavingMemory] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await client.get('/api/dashboard');
      setDashboard(response.data);
      setMood(response.data?.user?.mood || 'happy');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = async () => {
    try {
      await client.get('/sanctum/csrf-cookie');
      await client.post('/logout');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setUser(null);
      navigate('/login', { replace: true });
    }
  };

  const handleMoodSubmit = async (event) => {
    event.preventDefault();
    setSavingMood(true);
    setError('');

    try {
      await client.get('/sanctum/csrf-cookie');
      await client.post('/api/mood', { mood });
      setDashboard((prev) => ({
        ...prev,
        user: { ...prev.user, mood },
      }));
      setUser((prev) => ({ ...prev, mood }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update mood.');
    } finally {
      setSavingMood(false);
    }
  };

  const handleMemorySubmit = async (event) => {
    event.preventDefault();
    setSavingMemory(true);
    setError('');

    try {
      await client.get('/sanctum/csrf-cookie');
      const response = await client.post('/api/memories', memoryForm);

      setDashboard((prev) => ({
        ...prev,
        couple: {
          ...prev.couple,
          memories: [response.data.memory, ...(prev?.couple?.memories || [])],
        },
      }));

      setMemoryForm((prev) => ({
        ...prev,
        image_path: '',
        caption: '',
      }));
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0]?.[0];
        setError(firstError || 'Please check your memory details.');
      } else {
        setError(err.response?.data?.message || 'Failed to save memory.');
      }
    } finally {
      setSavingMemory(false);
    }
  };

  const partnerMoodText = useMemo(() => {
    if (!dashboard?.partner) return 'No partner linked yet.';
    return `${dashboard.partner.name} is feeling ${dashboard.partner.mood || 'happy'} today.`;
  }, [dashboard]);

  const memories = dashboard?.couple?.memories || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-love-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-love-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-love-50 text-slate-800">
      <nav className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            <h1 className="text-2xl font-serif font-bold text-love-600">OurSpace</h1>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto py-8 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 shadow-xl mb-8 flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-love-100 via-love-500 to-love-100"></div>
          <h2 className="text-3xl font-serif mb-2 text-gray-800">
            Welcome, {dashboard?.user?.name}
          </h2>
          <p className="text-slate-500">
            <Heart size={16} className="inline mr-1 text-love-500 fill-love-500" />
            {partnerMoodText}
          </p>
        </motion.div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Smile size={18} className="text-love-500" />
              Your Mood
            </h3>
            <form onSubmit={handleMoodSubmit} className="space-y-4">
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-love-300"
              >
                {moodOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={savingMood}
                className="w-full rounded-xl bg-rose-400 py-2.5 font-medium text-white hover:bg-rose-500 disabled:opacity-50"
              >
                {savingMood ? 'Saving...' : 'Update Mood'}
              </button>
            </form>
          </section>

          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Plus size={18} className="text-love-500" />
              Add Couple Memory
            </h3>
            <form onSubmit={handleMemorySubmit} className="space-y-3">
              <input
                type="url"
                placeholder="Image URL (https://...)"
                value={memoryForm.image_path}
                onChange={(e) => setMemoryForm((prev) => ({ ...prev, image_path: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-love-300"
                required
              />
              <input
                type="date"
                value={memoryForm.date_occurred}
                onChange={(e) => setMemoryForm((prev) => ({ ...prev, date_occurred: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-love-300"
                required
              />
              <textarea
                placeholder="Caption"
                value={memoryForm.caption}
                onChange={(e) => setMemoryForm((prev) => ({ ...prev, caption: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-love-300"
                rows={3}
              />
              <button
                type="submit"
                disabled={savingMemory}
                className="w-full rounded-xl bg-rose-400 py-2.5 font-medium text-white hover:bg-rose-500 disabled:opacity-50"
              >
                {savingMemory ? 'Saving...' : 'Save Memory'}
              </button>
            </form>
          </section>
        </div>

        <section className="bg-white rounded-2xl p-6 shadow-sm mt-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <ImageIcon size={18} className="text-love-500" />
            Couple Memories
          </h3>
          {memories.length === 0 ? (
            <p className="text-sm text-gray-500">No memories yet. Add your first memory above.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {memories.map((memory) => (
                <article key={memory.id} className="rounded-xl border border-gray-100 overflow-hidden">
                  <img src={memory.image_path} alt={memory.caption || 'Memory'} className="h-48 w-full object-cover" />
                  <div className="p-3">
                    <p className="font-medium text-sm text-gray-800">{memory.caption || 'Untitled memory'}</p>
                    <p className="text-xs text-gray-500 mt-1">{memory.date_occurred}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Link as LinkIcon, Copy, Check } from 'lucide-react';
import client from '../lib/axios';
import { useNavigate } from 'react-router-dom';

const PartnerLink = ({ setUser }) => {
  const [mode, setMode] = useState('invite');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Form States
  const [email, setEmail] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [copied, setCopied] = useState(false);

  // Sending Invite
  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await client.get('/sanctum/csrf-cookie');
      const res = await client.post('/api/couple/invite', { email });
      setGeneratedCode(res.data.code); // Backend should return the code
    } catch (err) {
      console.log(err.response); // Validation Errors
      if (err.response?.status === 422) {
        const firstError = Object.values(err.response.data.errors)[0][0];
        setError(firstError);
      } 
      else if (err.response?.data?.message) { // Server Message
        setError(err.response.data.message);
      } 
      else { // Fallback
        setError('Server error. Check console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Joining via Code
  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await client.get('/sanctum/csrf-cookie');
      const res = await client.post('/couple/link', { code: joinCode });
      // Update local user state to reflect they are now linked
      // Assuming res.data.couple_id exists
      setUser(prev => ({ ...prev, couple_id: res.data.couple_id }));

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-love-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden relative">
        <div className="flex border-b border-gray-100">
          <button onClick={() => setMode('invite')} className={`flex-1 p-4 font-medium text-sm transition-colors cursor-pointer ${mode === 'invite' ? 'text-rose-500 bg-rose-100' : 'text-gray-400 hover:text-gray-600'}`} >
            Invite Partner
          </button>
          <button onClick={() => setMode('join')} className={`flex-1 p-4 font-medium text-sm transition-colors cursor-pointer ${mode === 'join' ? 'text-rose-500 bg-rose-100' : 'text-gray-400 hover:text-gray-600'}`} >
            I Have a Code
          </button>
        </div>

        {/* Content Area */}
        <div className="p-8 min-h-80 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {mode === 'invite' ? (
              <motion.div key="invite" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} >
                <div className="text-center mb-6">
                  <div className="bg-love-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="text-love-500" size={24} />
                  </div>
                  <h2 className="text-xl font-serif font-bold text-gray-800">Start Your Journey</h2>
                  <p className="text-sm text-gray-500 mt-2">Enter your partner's email to generate a unique connection code.</p>
                </div>

                {!generatedCode ? (
                  <form onSubmit={handleInvite} className="space-y-4">
                    <input type="email"
                      placeholder="partner@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-300 outline-none transition-all font-mono" required
                    />
                    <button disabled={loading}
                      className="w-full bg-rose-400 hover:bg-rose-500 text-white cursor-pointer font-medium py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? 'Sending...' : 'Send Invite'}
                    </button>
                  </form>
                ) :
                  (
                    <div className="bg-love-50 border border-love-100 rounded-xl p-4 text-center">
                      <p className="text-sm text-gray-600 mb-2"> Share this code with your partner: </p>
                      <div onClick={copyToClipboard} className="flex items-center justify-between bg-white border border-dashed border-love-300 rounded-lg px-4 py-3 cursor-pointer hover:border-love-500 transition-colors group">
                        <span className="font-mono text-xl font-bold text-gray-700 tracking-widest"> {generatedCode} </span>
                        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-gray-400 group-hover:text-love-500" />}
                      </div>
                      <p className="text-xs text-love-500 mt-2">Waiting for partner to connect...</p>
                    </div>
                  )}
              </motion.div>
            ) : (

              // join section
              <motion.div key="join"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}>
                <div className="text-center mb-6">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LinkIcon className="text-purple-500" size={24} />
                  </div>
                  <h2 className="text-xl font-serif font-bold text-gray-800">Connect Accounts</h2>
                  <p className="text-sm text-gray-500 mt-2">Enter the code your partner sent you to link your accounts forever.</p>
                </div>

                <form onSubmit={handleJoin} className="space-y-4">
                  <div className="relative">
                    <input type="text"
                      placeholder="e.g. A7X-99"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-300 outline-none transition-all font-mono tracking-widest text-center uppercase"
                      required
                      maxLength={8}
                    />
                  </div>
                  <button disabled={loading} className="w-full bg-rose-400 hover:bg-rose-500 text-white cursor-pointer font-medium py-3 rounded-xl transition-colors disabled:opacity-50">
                    {loading ? 'Connecting...' : 'Link Accounts'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerLink;
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import client from '../lib/axios';
import { Link } from 'react-router-dom';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      // get CSRF cookie => make sure XSRF-TOKEN cookie is set in the browser
      console.log('Step 1: Getting CSRF cookie...');
      await client.get('/sanctum/csrf-cookie');
      console.log('CSRF cookie obtained');

      // submit credentials - try /api/login first, fallback to /login
      console.log('Step 2: Attempting login...');
      let loginSuccess = false;
      try {
        const loginResponse = await client.post('/login', { email, password });
        console.log('Login successful via /login', loginResponse);
        loginSuccess = true;
      } catch (loginErr) {
        // If /api/login fails with 404, try /login (web route)
        if (loginErr.response?.status === 404) {
          console.log('Trying /login instead...');
          const loginResponse = await client.post('/login', { email, password });
          console.log('Login successful via /login', loginResponse);
          loginSuccess = true;
        } else {
          throw loginErr;
        }
      }

      if (!loginSuccess) {
        throw new Error('Login failed');
      }

      // Log cookies after login to verify session is set
      console.log('Cookies after login:', document.cookie);
      
      // Small delay to ensure session is fully established
      await new Promise(resolve => setTimeout(resolve, 100));

      // Fetch the authenticated user data
      console.log('Step 3: Fetching user data...');
      console.log('Cookies before /api/user request:', document.cookie);
      
      try {
        const userResponse = await client.get('/api/user');
        console.log('User data fetched:', userResponse.data);
        setUser(userResponse.data);
      } catch (userErr) {
        console.error('Error fetching user:', userErr);
        console.error('User error response:', userErr.response?.data);
        console.error('User error status:', userErr.response?.status);
        
        // If /api/user fails, try /user (web route)
        if (userErr.response?.status === 401 || userErr.response?.status === 404) {
          console.log('Trying /user instead of /api/user...');
          try {
            const userResponse = await client.get('/user');
            console.log('User data fetched via /user:', userResponse.data);
            setUser(userResponse.data);
          } catch (fallbackErr) {
            throw userErr; // Throw original error
          }
        } else {
          throw userErr;
        }
      }

    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error message:', err.message);
      console.error('Request URL:', err.config?.url);
      console.error('Base URL:', err.config?.baseURL);
      console.error('Full URL:', err.config?.baseURL + err.config?.url);

      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;

        if (status === 422) {
          const validationError = data.errors?.email?.[0] || data.errors?.password?.[0] || data.message;
          setError(validationError || 'Validation failed. Please check your input.');
        } 
        else if (status === 401) { // wrong credentials or unauthenticated
          const errorUrl = err.config?.url || 'unknown endpoint';
          if (errorUrl.includes('/user')) {
            setError('Authentication failed after login. Session may not be persisting. Check backend session configuration.');
          } else {
            setError(data.message || 'Invalid email or password. Please try again.');
          }
        } 
        else if (status === 404) { // route not found
          setError(`Login endpoint not found (404). Trying: ${err.config?.baseURL}${err.config?.url}. Check your backend routes.`);
        } 
        else if (status === 500) { // Server error
          setError(data.message || 'Server error. Please try again later.');
        } 
        else { // other
          setError(data.message || data.error || `Login failed (${status}). Please try again.`);
        }
      } else if (err.request) { // Network error
        const baseURL = err.config?.baseURL || 'http://localhost:8000';
        const attemptedURL = baseURL + (err.config?.url || '/login');
        setError(`Network error: Cannot reach ${attemptedURL}. Check: 1) Backend is running on port 8000, 2) CORS is configured, 3) No firewall blocking.`);
      } else {
        setError(err.message || 'Login failed. Check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-love-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <Heart className="mx-auto text-rose-500 fill-rose-100" size={36} />
          <h1 className="text-3xl font-serif font-bold text-gray-800 mt-3">Welcome Back</h1>
          <p className="text-sm text-gray-500">Sign in to OurSpace</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-start font-medium text-gray-700 mb-1" htmlFor="email">Email Address</label>
            <input
              type="email"
              name='email'
              id="email"
              placeholder='yourname@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-rose-500 outline-none transition-all"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm text-start font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
            <input
              type="password"
              name='password'
              id="password"
              placeholder='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-rose-500 outline-none transition-all"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="px-3 bg-red-50 text-red-600 text-sm rounded-xl text-center">
              {error}
            </div>
          )}
    
          <button type="submit"
            disabled={loading}
            className="w-full bg-rose-400 hover:bg-rose-500 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-6 cursor-pointer"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account? <Link to="/register" className="text-rose-400 font-medium hover:underline">Register Here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
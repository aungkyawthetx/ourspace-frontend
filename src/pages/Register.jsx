import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import client from '../lib/axios';
import { Link } from 'react-router-dom';

const Register = ({ setUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({}); // clear errors

    try {
      // Get CSRF Cookie
      await client.get('/sanctum/csrf-cookie');
      // submit credentials
      await client.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation
      });

      // fetch user
      const userResponse = await client.get('/api/user');
      setUser(userResponse.data);

    } 
    catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error message:', err.message);
      console.error('Error status:', err.response?.status);

      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;

        if (status === 422) { 
          setErrors(data.errors || { general: ['Validation failed. Please check your input.'] });
        } 
        else if (status === 400) { // bad request
          setErrors({ general: [data.message || 'Invalid request. Please check your input.'] });
        } 
        else if (status === 500) {
          const errorMessage = data?.message || data?.error || 'Server error. Please try again later.';
          console.error('Server error details:', errorMessage);
          setErrors({ general: [errorMessage] });
        } 
        // other http errors
        else {
          setErrors({
            general: [data.message || data.error || `Error ${status}: An unexpected error occurred.`]
          });
        }
      } 
      else if (err.request) {
        setErrors({
          general: ['Network error. Check that the API server is running and CORS is configured correctly.'],
        });
      } else {
        // Something else happened
        setErrors({ general: [err.message || 'An unexpected error occurred during registration.'] });
      }
    }
  };

  return (
    <div className="min-h-screen bg-love-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-800 mt-3">Create Account</h1>
          <p className="text-sm text-gray-500">Start your shared space today.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-start">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Name</label>
            <input
              type="text"
              name='name'
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Enter your name'
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-rose-500 outline-none transition-all"
              required
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email Address</label>
            <input
              type="email"
              name='email'
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='yourname@example.com'
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-rose-500 outline-none transition-all"
              required
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
            <input
              type="password"
              name='password'
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='password'
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-rose-500 outline-none transition-all"
              required
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password_confirmation">Confirm Password</label>
            <input
              type="password"
              name='comfirm-password'
              id="password_confirmation"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder='Comfirm password'
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-rose-500 outline-none transition-all"
              required
            />
          </div>

          {errors.general && <p className="p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center">{errors.general[0]}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-6 cursor-pointer"
          >
            {loading ? 'Loading...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-rose-400 font-medium hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;

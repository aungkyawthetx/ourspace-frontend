import './App.css';
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import Login from './pages/Login';
import PartnerLink from './pages/PartnerLink';
import ProtectedRoute from './components/ProtectedRoute';
import client from './lib/axios';
import Register from './pages/Register';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // auth check on load
  useEffect(() => {
    //fetches logged-in user data from Laravel
    const fetchUser = async () => {
      try {
        const response = await client.get('/api/user');
        setUser(response.data);
      } catch (error) {
        console.log('User is not authenticated.', error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  //loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-love-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-love-500"></div>
      </div>
    );
  }

  // main routing
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login setUser={setUser} />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register setUser={setUser} />} />

        <Route element={<ProtectedRoute user={user} />}>
          <Route path="/" element={user?.couple_id ? <Navigate to="/dashboard" replace /> : <Navigate to="/link-partner" replace />} />
          <Route path="/link-partner" element={user?.couple_id ? <Navigate to="/dashboard" replace /> : <PartnerLink setUser={setUser} />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<h1>404 | Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getToken, api, setToken, removeToken } from './api';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SetDetail from './pages/SetDetail';
import Study from './pages/Study';
import StudySet from './pages/StudySet';
import FocusMode from './pages/FocusMode';
import CreateTopic from './pages/CreateTopic';


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      api.getMe(token)
        .then(res => setUser(res.user))
        .catch(() => removeToken())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/" element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/sets/:setId" element={user ? <SetDetail user={user} /> : <Navigate to="/login" />} />
        <Route path="/sets/:setId/study" element={user ? <StudySet user={user} /> : <Navigate to="/login" />} />
        <Route path="/sets/:setId/focus" element={user ? <FocusMode user={user} /> : <Navigate to="/login" />} />
        <Route path="/create-topic" element={user ? <CreateTopic user={user} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;

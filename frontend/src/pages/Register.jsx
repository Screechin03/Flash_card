import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, setToken } from '../api';
import Navbar from '../components/Navbar';

function Register({ setUser }) {
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.register(form);
            setToken(res.token);
            setUser(res.user);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0a0a23] text-[#e0f7fa]">
            <Navbar />
            <form onSubmit={handleSubmit} className="bg-[#1e293b] p-10 rounded-2xl shadow-neon w-96 mt-10 animate-pop-in border border-[#00f0ff55]">
                <h2 className="text-3xl font-extrabold mb-6 text-[#00f0ff] drop-shadow-neon">Register</h2>
                {error && <div className="text-pink-400 mb-4 animate-shake">{error}</div>}
                <input name="username" placeholder="Username" value={form.username} onChange={handleChange} className="mb-4 w-full p-3 bg-[#0f172a] border border-[#00f0ff55] rounded text-[#00f0ff] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]" required />
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="mb-4 w-full p-3 bg-[#0f172a] border border-[#00f0ff55] rounded text-[#00f0ff] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]" required />
                <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="mb-6 w-full p-3 bg-[#0f172a] border border-[#00f0ff55] rounded text-[#00f0ff] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]" required />
                <button type="submit" className="w-full bg-[#00f0ff] text-[#0f172a] py-3 rounded shadow hover:bg-pink-500 hover:text-white transition-all duration-200">Register</button>
                <div className="mt-4 text-sm text-[#94a3b8]">Already have an account? <Link to="/login" className="text-[#00f0ff] hover:text-pink-500 transition">Login</Link></div>
            </form>
        </div>
    );
}

export default Register;

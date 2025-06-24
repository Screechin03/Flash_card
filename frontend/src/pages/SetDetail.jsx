import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../api';
import Navbar from '../components/Navbar';

function SetDetail({ user }) {
    const { setId } = useParams();
    const [set, setSet] = useState(null);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ front: '', back: '' });
    const navigate = useNavigate();

    const fetchSet = async () => {
        // Validate setId before making API call
        if (!setId || setId === 'undefined') {
            setError("Invalid set ID. This set may have been deleted or doesn't exist. Please return to the dashboard.");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const res = await api.getSetById(setId, getToken());
            setSet(res.set);
            setCards(res.set.cards);
        } catch (err) {
            setError(err.message || "Failed to load the flashcard set. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSet(); }, [setId]);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleCreate = async e => {
        e.preventDefault();
        setError('');
        try {
            await api.createCard(setId, form, getToken());
            setForm({ front: '', back: '' });
            setShowForm(false);
            fetchSet();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteCard = async (cardId) => {
        await api.deleteCard(cardId, getToken());
        fetchSet();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0a0a23] text-[#e0f7fa]">
            <Navbar user={user} />
            <div className="max-w-4xl mx-auto mt-10 animate-fade-in">
                <div className="flex justify-between items-center mb-8">
                    <button onClick={() => navigate(-1)} className="text-[#00f0ff] hover:text-pink-500 transition">&larr; Back</button>
                    <div className="font-bold text-2xl text-[#00f0ff] drop-shadow-neon">{set?.title}</div>
                    <Link to={`/sets/${setId}/study`} className="bg-pink-500 text-white px-4 py-2 rounded shadow hover:bg-[#00f0ff] hover:text-[#0f172a] transition">Study</Link>
                </div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-[#00f0ff] drop-shadow-neon">Cards</h2>
                    <button onClick={() => setShowForm(f => !f)} className="bg-[#00f0ff] text-[#0f172a] px-4 py-2 rounded shadow hover:bg-pink-500 hover:text-white transition-all duration-200">{showForm ? 'Cancel' : 'Add Card'}</button>
                </div>
                {showForm && (
                    <form onSubmit={handleCreate} className="mb-8 bg-[#1e293b] p-6 rounded-xl shadow-lg border border-[#00f0ff55] animate-pop-in">
                        <input name="front" placeholder="Front" value={form.front} onChange={handleChange} className="mb-3 w-full p-3 bg-[#0f172a] border border-[#00f0ff55] rounded text-[#00f0ff] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]" required />
                        <input name="back" placeholder="Back" value={form.back} onChange={handleChange} className="mb-3 w-full p-3 bg-[#0f172a] border border-[#00f0ff55] rounded text-[#00f0ff] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]" required />
                        <button type="submit" className="bg-[#00f0ff] text-[#0f172a] px-4 py-2 rounded shadow hover:bg-pink-500 hover:text-white transition-all duration-200">Add</button>
                    </form>
                )}
                {error && (
                    <div className="text-pink-400 mb-4 animate-shake bg-[#1e293b] p-4 rounded-xl border border-pink-500/30">
                        <div className="mb-2 font-semibold">{error}</div>
                        {(error.includes("Invalid set ID") || error.includes("deleted") || error.includes("exist")) && (
                            <button
                                onClick={() => navigate('/')}
                                className="bg-[#00f0ff] text-[#0f172a] px-4 py-2 rounded shadow hover:bg-pink-500 hover:text-white transition-all duration-200"
                            >
                                Return to Dashboard
                            </button>
                        )}
                    </div>
                )}
                {loading ? <div className="text-[#00f0ff] animate-pulse">Loading...</div> : (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {cards.map(card => (
                            <li key={card.id} className="bg-[#1e293b] p-6 rounded-xl shadow-lg border border-[#00f0ff33] flex flex-col gap-2 hover:scale-105 hover:shadow-neon transition-transform duration-200 animate-fade-in">
                                <div>
                                    <div className="font-semibold text-[#00f0ff] drop-shadow-neon">{card.front}</div>
                                    <div className="text-[#94a3b8]">{card.back}</div>
                                </div>
                                <button onClick={() => handleDeleteCard(card.id)} className="bg-red-500 text-white px-3 py-1 rounded shadow hover:bg-pink-700 transition">Delete</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default SetDetail;

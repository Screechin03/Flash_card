import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, getToken } from '../api';
import Navbar from '../components/Navbar';
import CardModule from '../components/CardModule';
import CardControls from '../components/CardControls';
import ProgressBar from '../components/ProgressBar';

function Study({ user }) {
    const { setId } = useParams();
    const [cards, setCards] = useState([]);
    const [index, setIndex] = useState(0);
    const [showBack, setShowBack] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        api.getRandomCards(setId, getToken())
            .then(res => {
                setCards(res);
                setIndex(0);
                setShowBack(false);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [setId]);

    if (loading) return <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0a0a23] text-[#00f0ff] animate-pulse">Loading...</div>;
    if (error) return <div className="text-pink-400 bg-[#0f172a] h-screen flex items-center justify-center animate-shake">{error}</div>;
    if (!cards.length) return <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0a0a23] text-[#00f0ff]">No cards to study.</div>;

    const card = cards[index];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0a0a23] flex flex-col items-center justify-center text-[#e0f7fa]">
            <Navbar user={user} />
            <button onClick={() => navigate(-1)} className="absolute top-4 left-4 text-[#00f0ff] hover:text-pink-500 transition">&larr; Back</button>
            <div className="bg-[#1e293b] p-10 rounded-2xl shadow-neon w-96 flex flex-col items-center border border-[#00f0ff55] animate-pop-in">
                <div className="text-lg font-bold mb-4 text-[#00f0ff] drop-shadow-neon">Card {index + 1} / {cards.length}</div>

                <ProgressBar
                    completed={index}
                    total={cards.length - 1}
                    barColor="bg-[#00f0ff]"
                    height="h-1"
                    showPercentage={false}
                />

                <div className="my-4 w-full mb-10"> {/* Added bottom margin for separation */}
                    <CardModule
                        card={card}
                        showBack={showBack}
                        onFlip={() => setShowBack(!showBack)}
                        size="md"
                        clickable={true}
                    />
                </div>

                {/* Controls with separate answer button for better user experience */}
                <div className="controls-container pt-4 relative z-10 w-full">
                    {!showBack ? (
                        <div className="text-center mb-4">
                            <button
                                onClick={() => setShowBack(true)}
                                className="px-5 py-2 bg-[#00f0ff] text-[#0f172a] rounded-lg hover:bg-[#00dcff] hover:text-[#081120] transition min-w-[140px] shadow-neon"
                            >
                                Show Answer
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-center gap-4 mb-4">
                            <button
                                onClick={() => setShowBack(false)}
                                className="px-5 py-2 bg-[#00f0ff] text-[#0f172a] rounded-lg hover:bg-[#00dcff] transition shadow-neon"
                            >
                                Hide Answer
                            </button>
                        </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex justify-center gap-4 mt-3">
                        <button
                            onClick={() => {
                                setShowBack(false);
                                setIndex(i => Math.max(i - 1, 0));
                            }}
                            disabled={index === 0}
                            className="px-4 py-2 bg-[#334155] text-[#00f0ff] rounded-lg hover:bg-[#475569] transition disabled:opacity-50"
                        >
                            Previous Card
                        </button>
                        <button
                            onClick={() => {
                                setShowBack(false);
                                setIndex(i => Math.min(i + 1, cards.length - 1));
                            }}
                            disabled={index === cards.length - 1}
                            className="px-4 py-2 bg-[#00f0ff] text-[#0f172a] rounded-lg hover:bg-[#00dcff] transition disabled:opacity-50"
                        >
                            Next Card
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Study;

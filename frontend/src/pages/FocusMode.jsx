import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getToken } from '../api';
import Navbar from '../components/Navbar';
import CardModule from '../components/CardModule';
import CardControls from '../components/CardControls';
import ProgressBar from '../components/ProgressBar';

function FocusMode({ user }) {
    const { setId } = useParams();
    const [cards, setCards] = useState([]);
    const [currentCard, setCurrentCard] = useState(null);
    const [showBack, setShowBack] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [setInfo, setSetInfo] = useState(null);
    const [progress, setProgress] = useState({
        correct: 0,
        incorrect: 0,
        remaining: 0,
        total: 0
    });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [cardIndex, setCardIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        // Validate setId before making API call
        if (!setId || setId === 'undefined') {
            setError("Invalid set ID. This set may have been deleted or doesn't exist. Please go back to the dashboard and try again.");
            setLoading(false);
            return;
        }

        setLoading(true);
        api.getSetById(setId, getToken())
            .then(res => {
                setSetInfo(res.set);
                // Shuffle cards for focus mode
                const shuffledCards = [...res.set.cards].sort(() => Math.random() - 0.5);
                setCards(shuffledCards);
                setCurrentCard(shuffledCards[0] || null);
                setCardIndex(0);
                setProgress({
                    correct: 0,
                    incorrect: 0,
                    remaining: shuffledCards.length,
                    total: shuffledCards.length
                });
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [setId]);

    const handleResponse = async (status) => {
        if (!currentCard) return;

        // Record progress for analytics
        try {
            await api.saveProgress(setId, currentCard.id, status, getToken());
        } catch (err) {
            console.error('Failed to save progress:', err);
        }

        // Update local progress
        setProgress(prev => ({
            ...prev,
            [status]: prev[status] + 1,
            remaining: prev.remaining - 1
        }));

        // Move to next card
        if (cardIndex < cards.length - 1) {
            setCardIndex(cardIndex + 1);
            setCurrentCard(cards[cardIndex + 1]);
            setShowBack(false);
        } else {
            // End of deck
            setCurrentCard(null);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const restartSession = () => {
        const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
        setCards(shuffledCards);
        setCurrentCard(shuffledCards[0] || null);
        setShowBack(false);
        setCardIndex(0);
        setProgress({
            correct: 0,
            incorrect: 0,
            remaining: shuffledCards.length,
            total: shuffledCards.length
        });
    };

    if (loading) return <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 text-blue-700 dark:text-blue-400 animate-pulse">Loading...</div>;
    if (error) return (
        <div className="text-red-500 dark:text-red-400 bg-gray-50 dark:bg-gray-900 h-screen flex flex-col items-center justify-center animate-shake">
            <div className="mb-4 text-xl">{error}</div>
            <Link to="/" className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                Return to Dashboard
            </Link>
        </div>
    );
    if (!cards.length) return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 text-blue-700 dark:text-blue-400">
            <div className="mb-4">No cards in this set.</div>
            <Link to="/" className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                Return to Dashboard
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Navbar user={user} />

            <div className="max-w-3xl mx-auto w-full p-4 mt-16">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400">{setInfo?.title}</h1>
                        <p className="text-gray-600 dark:text-gray-400">{setInfo?.description}</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => navigate(-1)} className="text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition">Exit</button>
                        <button onClick={toggleFullscreen} className="text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition">
                            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
                    <div className="flex justify-between mb-4">
                        <div className="text-gray-700 dark:text-gray-300">
                            Remaining: <span className="font-bold text-blue-700 dark:text-blue-400">{progress.remaining}</span>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-green-600 dark:text-green-400">
                                Correct: <span className="font-bold">{progress.correct}</span>
                            </div>
                            <div className="text-red-600 dark:text-red-400">
                                Incorrect: <span className="font-bold">{progress.incorrect}</span>
                            </div>
                        </div>
                    </div>

                    <ProgressBar
                        completed={progress.correct + progress.incorrect}
                        total={cards.length}
                        barColor="bg-blue-700 dark:bg-blue-600"
                        height="h-2"
                        showPercentage={false}
                    />
                    <div className="mb-6"></div>

                    {currentCard ? (
                        <div className="flex flex-col items-center">
                            <div className="w-full h-[350px] mb-4"> {/* Increased height container */}
                                <CardModule
                                    card={currentCard}
                                    showBack={showBack}
                                    onFlip={() => setShowBack(!showBack)}
                                    size="lg"
                                    clickable={true}
                                    className="animate-fade-in"
                                    containMonospaceContent={true}
                                    frontStyles={{
                                        gradient: "bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-800 dark:to-blue-950",
                                        custom: { boxShadow: "0 8px 20px -5px rgba(0, 0, 0, 0.1)" }
                                    }}
                                    backStyles={{
                                        gradient: "bg-gradient-to-br from-blue-100 to-white dark:from-blue-900 dark:to-gray-900",
                                        custom: { boxShadow: "0 8px 20px -5px rgba(0, 0, 0, 0.1)" }
                                    }}
                                />
                            </div>

                            <div className="controls-container pt-4 relative z-10 mt-8"> {/* Added margin-top */}
                                {!showBack ? (
                                    <button
                                        onClick={() => setShowBack(true)}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition min-w-[180px] shadow-md"
                                    >
                                        Show Answer
                                    </button>
                                ) : (
                                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                        <button
                                            onClick={() => handleResponse('incorrect')}
                                            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white rounded-lg hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 transition min-w-[180px] shadow-md"
                                        >
                                            I Got It Wrong
                                        </button>
                                        <button
                                            onClick={() => handleResponse('correct')}
                                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-600 dark:to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 dark:hover:from-green-700 dark:hover:to-green-800 transition min-w-[180px] shadow-md"
                                        >
                                            I Got It Right
                                        </button>
                                    </div>
                                )}

                                <div className="flex justify-center gap-4 mt-2">
                                    <button
                                        onClick={() => {
                                            const prevIndex = cardIndex > 0 ? cardIndex - 1 : 0;
                                            setCurrentCard(cards[prevIndex]);
                                            setCardIndex(prevIndex);
                                            setShowBack(false);
                                        }}
                                        disabled={cardIndex === 0}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 shadow-sm"
                                    >
                                        Previous Card
                                    </button>
                                    <button
                                        onClick={() => {
                                            const nextIndex = cardIndex < cards.length - 1 ? cardIndex + 1 : cardIndex;
                                            setCurrentCard(cards[nextIndex]);
                                            setCardIndex(nextIndex);
                                            setShowBack(false);
                                        }}
                                        disabled={cardIndex === cards.length - 1}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition disabled:opacity-50 shadow-sm"
                                    >
                                        Next Card
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4">Session Complete!</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">You've completed all cards in this set.</p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <button
                                    onClick={restartSession}
                                    className="px-6 py-3 bg-blue-700 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-800 dark:hover:bg-blue-700 transition"
                                >
                                    Restart Session
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                                >
                                    Back to Dashboard
                                </button>
                            </div>

                            <div className="mt-8 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                                <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Session Summary</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                                        <div className="text-green-600 dark:text-green-400 font-bold text-lg">{progress.correct}</div>
                                        <div className="text-gray-500 dark:text-gray-400">Correct</div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                                        <div className="text-red-600 dark:text-red-400 font-bold text-lg">{progress.incorrect}</div>
                                        <div className="text-gray-500 dark:text-gray-400">Incorrect</div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                                        <div className="text-blue-600 dark:text-blue-400 font-bold text-lg">{cards.length}</div>
                                        <div className="text-gray-500 dark:text-gray-400">Total Cards</div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                                        <div className="text-purple-600 dark:text-purple-400 font-bold text-lg">
                                            {progress.correct > 0 ? Math.round((progress.correct / (progress.correct + progress.incorrect)) * 100) : 0}%
                                        </div>
                                        <div className="text-gray-500 dark:text-gray-400">Accuracy</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FocusMode;

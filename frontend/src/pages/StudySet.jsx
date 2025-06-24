import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { api, getToken } from '../api';
import Navbar from '../components/Navbar';
import CardModule from '../components/CardModule';
import CardControls from '../components/CardControls';
import ProgressBar from '../components/ProgressBar';

function StudySet({ user }) {
    const { setId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [cards, setCards] = useState([]);
    const [index, setIndex] = useState(0);
    const [showBack, setShowBack] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [setInfo, setSetInfo] = useState(null);
    const [cardStatus, setCardStatus] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [completedCount, setCompletedCount] = useState(0);
    const [sessionState, setSessionState] = useState({
        changesDetected: false,
        totalCards: 0,
        cardsStudied: 0,
        correctCount: 0,
        incorrectCount: 0,
        lastCardStudied: null
    });
    const navigate = useNavigate();
    const location = useLocation();

    // Check if a specific card ID was requested in the URL
    const requestedCardId = searchParams.get('card');

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
                const fetchedCards = res.set.cards || [];
                setCards(fetchedCards);
                setSetInfo(res.set);

                // Initialize session state
                setSessionState(prev => ({
                    ...prev,
                    totalCards: fetchedCards.length,
                }));

                // If a specific card ID is in the URL, find its index
                if (requestedCardId) {
                    const cardIndex = fetchedCards.findIndex(c => c.id === requestedCardId);
                    if (cardIndex !== -1) {
                        setIndex(cardIndex);
                    } else {
                        setIndex(0);
                    }
                } else {
                    setIndex(0);
                }

                setShowBack(false);

                // Fetch card statuses to determine completed count
                api.getProgress(getToken())
                    .then(data => {
                        if (data?.progress) {
                            const setProgress = data.progress.find(p => p.set_id === setId);
                            if (setProgress) {
                                setCompletedCount(setProgress.cards_studied || 0);
                            }

                            // Create card status object for visual indicators
                            const statusMap = {};
                            data.progress.forEach(item => {
                                if (item.card_statuses) {
                                    Object.keys(item.card_statuses).forEach(cardId => {
                                        statusMap[cardId] = item.card_statuses[cardId];
                                    });
                                }
                            });
                            setCardStatus(statusMap);
                        }
                    })
                    .catch(err => console.error('Failed to get progress data:', err));
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [setId, requestedCardId]);

    // Update the session storage progress whenever completion count changes
    useEffect(() => {
        if (completedCount > 0 && setInfo && setInfo.id) {
            console.log('Updating progress tracking for set:', setInfo.id, 'Completed:', completedCount);

            // Store set-specific progress data in the format the sidebar expects
            const setSpecificProgress = {
                set_id: setInfo.id,
                cards_studied: completedCount,
                total_cards: cards.length,
                correct_count: sessionState.correctCount,
                incorrect_count: sessionState.incorrectCount
            };

            // Update all relevant session storage items
            sessionStorage.setItem('flashcard_set_progress', JSON.stringify(setSpecificProgress));
            sessionStorage.setItem('flashcard_last_studied_set_id', setInfo.id);
            sessionStorage.setItem('flashcard_dashboard_refresh', 'true');
        }
    }, [completedCount, setInfo, cards.length, sessionState.correctCount, sessionState.incorrectCount]);

    if (loading) return <div className="flex items-center justify-center h-screen bg-gray-50 text-blue-700 animate-pulse">Loading...</div>;
    if (error) return (
        <div className="text-red-500 bg-gray-50 h-screen flex flex-col items-center justify-center animate-shake">
            <div className="mb-4 text-xl">{error}</div>
            <button onClick={navigateToDashboard} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Return to Dashboard
            </button>
        </div>
    );
    if (!cards.length) return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-blue-700">
            <div className="mb-4">No cards in this set.</div>
            <button onClick={navigateToDashboard} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Return to Dashboard
            </button>
        </div>
    );

    const card = cards[index];

    const handleCardStatus = async (status) => {
        if (!card) return;

        // Update local state immediately
        setCardStatus(prev => {
            const newStatus = {
                ...prev,
                [card.id]: status
            };

            // Calculate new completion count
            const newCompletionCount = Object.keys(newStatus).length;
            // Update completion count immediately
            setCompletedCount(newCompletionCount);

            return newStatus;
        });

        // Calculate updated session stats
        // If the card was previously marked with a different status, we need to adjust counts
        let prevStatus = cardStatus[card.id];

        // Calculate the correct adjustment for card counts
        let correctDelta = 0;
        let incorrectDelta = 0;

        if (status === 'correct') {
            correctDelta = 1;
            // If it was previously marked incorrect, reduce incorrect count
            if (prevStatus === 'incorrect') {
                incorrectDelta = -1;
            }
        } else if (status === 'incorrect') {
            incorrectDelta = 1;
            // If it was previously marked correct, reduce correct count
            if (prevStatus === 'correct') {
                correctDelta = -1;
            }
        }

        const updatedCardsStudied = sessionState.cardsStudied + (cardStatus[card.id] ? 0 : 1);
        const updatedCorrectCount = Math.max(0, sessionState.correctCount + correctDelta);
        const updatedIncorrectCount = Math.max(0, sessionState.incorrectCount + incorrectDelta);

        console.log('Card status update:', {
            cardId: card.id,
            newStatus: status,
            prevStatus,
            correctDelta,
            incorrectDelta,
            updatedCorrect: updatedCorrectCount,
            updatedIncorrect: updatedIncorrectCount
        });

        // Update session state to track progress changes
        setSessionState(prev => ({
            ...prev,
            changesDetected: true,
            cardsStudied: updatedCardsStudied,
            correctCount: updatedCorrectCount,
            incorrectCount: updatedIncorrectCount,
            lastCardStudied: card.id
        }));

        // Save recent card data to sessionStorage
        const recentCardData = {
            setId: setId,
            cardId: card.id,
            front: card.front,
            back: card.back,
            set_title: setInfo?.title,
            timestamp: new Date().toISOString(),
            status: status // Add the status parameter to the recent card data
        };

        // Add this card to recent cards in session storage
        let recentCards = [];
        try {
            const storedRecentCards = sessionStorage.getItem('flashcard_recent_cards');
            if (storedRecentCards) {
                recentCards = JSON.parse(storedRecentCards);
            }

            // Add this card to the front of the array and keep up to 10 cards
            recentCards = [recentCardData, ...recentCards.filter(c => c.cardId !== card.id)].slice(0, 10);
            sessionStorage.setItem('flashcard_recent_cards', JSON.stringify(recentCards));

            // Debug output for recent card data
            console.log('Saved recent card with status:', recentCardData.status);
            console.log('All recent cards:', recentCards);

            // Signal that we need to refresh progress data
            sessionStorage.setItem('flashcard_dashboard_refresh', 'true');
            sessionStorage.setItem('flashcard_last_studied_set', setInfo?.title || 'Unknown Set');

            // Create a progress update for real-time updates
            const progressUpdate = {
                read: completedCount,
                total: cards.length,
                correct: sessionState.correctCount,
                incorrect: sessionState.incorrectCount,
                timestamp: new Date().toISOString()
            };

            sessionStorage.setItem('flashcard_progress_update', JSON.stringify(progressUpdate));

            // Also store the set ID to help with sidebar updates
            if (setInfo && setInfo.id) {
                // Store the actual set ID for direct progress updates
                sessionStorage.setItem('flashcard_last_studied_set_id', setInfo.id);

                // Also update a specific progress entry for this set ID
                const setSpecificProgress = {
                    set_id: setInfo.id,
                    cards_studied: completedCount,
                    total_cards: cards.length,
                    correct_count: sessionState.correctCount,
                    incorrect_count: sessionState.incorrectCount
                };
                sessionStorage.setItem('flashcard_set_progress', JSON.stringify(setSpecificProgress));
            }
        } catch (err) {
            console.error('Error updating recent cards in session storage:', err);
        }

        // Save progress to backend
        try {
            await api.saveProgress(setId, card.id, status, getToken());

            // Store progress update in sessionStorage to notify dashboard on return
            const progressUpdate = {
                read: updatedCardsStudied,
                total: cards.length,
                correct: updatedCorrectCount,
                incorrect: updatedIncorrectCount,
                timestamp: new Date().toISOString()
            };

            // Set the refresh flag and save progress update
            sessionStorage.setItem('flashcard_dashboard_refresh', 'true');
            sessionStorage.setItem('flashcard_last_studied_set', setInfo?.title || 'Unknown Set');
            sessionStorage.setItem('flashcard_progress_update', JSON.stringify(progressUpdate));
        } catch (err) {
            console.error('Failed to save progress:', err);
        }

        // Move to next card
        if (index < cards.length - 1) {
            setShowBack(false);
            setIndex(i => i + 1);

            // Update URL to reflect new card
            setSearchParams({ card: cards[index + 1].id });
        }
    };

    const handlePreviousCard = () => {
        if (index > 0) {
            setShowBack(false);
            setIndex(i => i - 1);
            setSearchParams({ card: cards[index - 1].id });
        }
    };

    const handleNextCard = () => {
        if (index < cards.length - 1) {
            setShowBack(false);
            setIndex(i => i + 1);
            setSearchParams({ card: cards[index + 1].id });
        }
    };

    const navigateToDashboard = () => {
        // Always send the current progress data to the dashboard
        // This ensures we have the most up-to-date information

        // Prepare progress update data with actual completion counts
        const progressUpdate = {
            read: completedCount,
            total: cards.length,
            correct: sessionState.correctCount,
            incorrect: sessionState.incorrectCount,
            timestamp: new Date().toISOString()
        };

        // Store session data for dashboard
        sessionStorage.setItem('flashcard_dashboard_refresh', 'true');
        sessionStorage.setItem('flashcard_last_studied_set', setInfo?.title || 'Unknown Set');
        sessionStorage.setItem('flashcard_progress_update', JSON.stringify(progressUpdate));

        // Also store the set ID to help the sidebar identify which set was updated
        if (setInfo && setInfo.id) {
            sessionStorage.setItem('flashcard_last_studied_set_id', setInfo.id);

            // Store set-specific progress data in the format the sidebar expects
            const setSpecificProgress = {
                set_id: setInfo.id,
                cards_studied: completedCount,
                total_cards: cards.length,
                correct_count: sessionState.correctCount,
                incorrect_count: sessionState.incorrectCount
            };
            sessionStorage.setItem('flashcard_set_progress', JSON.stringify(setSpecificProgress));
        }

        // Make sure we preserve any recent cards studied
        try {
            const storedRecentCards = sessionStorage.getItem('flashcard_recent_cards');

            if (storedRecentCards) {
                const parsedCards = JSON.parse(storedRecentCards);
                if (parsedCards && parsedCards.length > 0) {
                    console.log('Preserving recent cards before navigation:', parsedCards.length);
                    // Make sure recent cards are preserved for the dashboard to use
                    sessionStorage.setItem('flashcard_recent_cards', JSON.stringify(parsedCards));
                }
            }
        } catch (err) {
            console.error('Error handling recent cards before navigation:', err);
        }

        console.log('Saving progress before navigation:', progressUpdate, 'for set:', setInfo?.title);

        // Navigate to dashboard
        navigate('/');
    };

    const toggleCardFlip = () => {
        setShowBack(!showBack);
    };

    const handleResetStudySession = async () => {
        // Reset the state for a new study session
        setShowBack(false);
        setIndex(0);
        setCardStatus({});
        setCompletedCount(0);

        // Reset session state but mark that changes were made
        setSessionState({
            changesDetected: true,
            totalCards: cards.length,
            cardsStudied: 0,
            correctCount: 0,
            incorrectCount: 0,
            lastCardStudied: null
        });

        // Prepare progress update with reset values
        const progressUpdate = {
            read: 0,
            total: cards.length,
            correct: 0,
            incorrect: 0,
            timestamp: new Date().toISOString()
        };

        console.log('Resetting progress for set:', setId, setInfo?.title);

        // Since the backend might not support direct reset,
        // use the session storage mechanism to communicate the reset to the dashboard
        sessionStorage.setItem('flashcard_progress_update', JSON.stringify(progressUpdate));
        sessionStorage.setItem('flashcard_dashboard_refresh', 'true');
        sessionStorage.setItem('flashcard_last_studied_set', setInfo?.title || 'Unknown Set');
        sessionStorage.setItem('flashcard_progress_reset', 'true');

        // Also update the set-specific progress with reset values
        if (setInfo && setInfo.id) {
            sessionStorage.setItem('flashcard_last_studied_set_id', setInfo.id);

            // Store set-specific progress data with reset values
            const setSpecificProgress = {
                set_id: setInfo.id,
                cards_studied: 0,
                total_cards: cards.length,
                correct_count: 0,
                incorrect_count: 0
            };
            sessionStorage.setItem('flashcard_set_progress', JSON.stringify(setSpecificProgress));
        }

        // Also clear the recent cards associated with this set
        try {
            const storedRecentCards = sessionStorage.getItem('flashcard_recent_cards');
            if (storedRecentCards) {
                const recentCards = JSON.parse(storedRecentCards);
                // Filter out cards from this set
                const filteredCards = recentCards.filter(card => card.setId !== setId);
                sessionStorage.setItem('flashcard_recent_cards', JSON.stringify(filteredCards));
            }
        } catch (err) {
            console.error('Error clearing recent cards from session storage:', err);
        }

        // If the resetSetProgress API exists, try to use it
        try {
            if (typeof api.resetSetProgress === 'function') {
                await api.resetSetProgress(setId, getToken());
                console.log('Backend progress reset successful for:', setInfo?.title);
            } else {
                console.log('Backend reset API not available, using client-side reset only');
            }
        } catch (err) {
            console.error('Failed to reset progress on backend:', err);
            // Continue with local reset even if backend fails
        }

        // Update URL to reflect first card
        if (cards.length > 0) {
            setSearchParams({ card: cards[0].id });
        }
    };

    return (
        <div className="min-h-screen bg-primary dark:bg-gray-900 flex flex-col">
            <Navbar user={user} sets={[{ ...setInfo, cards }]} />
            <div className="flex flex-1 mt-0 ml-64">
                <main className="flex-1 flex flex-col items-center justify-center p-4 dark:text-gray-100 pt-10">
                    <div className="flex justify-between w-full max-w-xl mb-4">
                        <button onClick={navigateToDashboard} className="text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Dashboard
                        </button>
                        <span className="text-sm text-blue-700 dark:text-blue-400">{setInfo?.title || 'Study Set'}</span>
                        <button
                            onClick={handleResetStudySession}
                            className="text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition flex items-center gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            Reset
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-xl flex flex-col items-center border border-gray-200 dark:border-gray-700 animate-pop-in">
                        {/* Progress tracking information */}
                        <div className="w-full mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-blue-700 dark:text-blue-400">Progress</span>
                                <span className="text-sm text-blue-700 dark:text-blue-400">Card {index + 1} of {cards.length}</span>
                            </div>
                            <ProgressBar
                                completed={completedCount}
                                total={cards.length}
                                barColor="bg-blue-600 dark:bg-blue-500"
                            />
                        </div>

                        {/* Flip card using CardModule component */}
                        <div className="w-full mb-6 h-[300px]"> {/* Increased height for better content display */}
                            <CardModule
                                card={card}
                                showBack={showBack}
                                onFlip={toggleCardFlip}
                                size="md"
                                className="card-study-view"
                                containMonospaceContent={true}
                                status={cardStatus[card?.id]}
                                frontStyles={{
                                    gradient: "bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-blue-900/30",
                                    custom: { boxShadow: "0 8px 20px -5px rgba(0, 0, 0, 0.1)" }
                                }}
                                backStyles={{
                                    gradient: "bg-gradient-to-br from-blue-100 to-white dark:from-blue-900/50 dark:to-gray-800",
                                    custom: { boxShadow: "0 8px 20px -5px rgba(0, 0, 0, 0.1)" }
                                }}
                            />
                        </div>

                        {/* Card controls container with separate answer button */}
                        <div className="controls-container pt-4 relative z-10 w-full mt-6"> {/* Increased margin-top */}
                            {!showBack ? (
                                <div className="text-center mb-4">
                                    <button
                                        onClick={() => setShowBack(true)}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition min-w-[180px] shadow-md"
                                    >
                                        Show Answer
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
                                    <button
                                        onClick={() => handleCardStatus('incorrect')}
                                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white rounded-lg hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 transition min-w-[140px] shadow-md"
                                    >
                                        I Got It Wrong
                                    </button>
                                    <button
                                        onClick={() => handleCardStatus('correct')}
                                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-600 dark:to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 dark:hover:from-green-700 dark:hover:to-green-800 transition min-w-[140px] shadow-md"
                                    >
                                        I Got It Right
                                    </button>
                                </div>
                            )}

                            {/* Navigation buttons */}
                            <div className="flex justify-center gap-4 mt-3">
                                <button
                                    onClick={handlePreviousCard}
                                    disabled={index === 0}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
                                >
                                    Previous Card
                                </button>
                                <button
                                    onClick={handleNextCard}
                                    disabled={index === cards.length - 1}
                                    className="px-4 py-2 bg-blue-700 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-800 dark:hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    Next Card
                                </button>
                            </div>
                        </div>

                        {/* Study progress stats */}
                        <div className="mt-4 w-full">
                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                                <div>Completed: {completedCount}/{cards.length}</div>
                                <div>
                                    {cardStatus[card?.id] === 'correct' &&
                                        <span className="text-green-600 dark:text-green-400">✓ Correct</span>
                                    }
                                    {cardStatus[card?.id] === 'incorrect' &&
                                        <span className="text-red-600 dark:text-red-400">✗ Incorrect</span>
                                    }
                                </div>
                            </div>
                            <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                                Click card to flip or use the Show Answer button
                            </div>
                        </div>

                        {/* Expand button */}
                        <button
                            className="mt-3 text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition text-xs flex items-center gap-1"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 110-2h4a1 1 0 011 1v4a1 1 0 11-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 112 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 110 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Fullscreen
                        </button>

                        {/* Removed expand button */}
                    </div>
                </main>
            </div>

            {/* Modal view for current card */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content max-w-4xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                            <button
                                onClick={handleResetStudySession}
                                className="text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition flex items-center gap-1 ml-2 mt-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                </svg>
                                Reset Study Session
                            </button>
                            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400" onClick={() => setIsModalOpen(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Title and progress bar */}
                        <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-3">{setInfo?.title} - Card {index + 1} / {cards.length}</h3>

                        <div className="w-full mb-4">
                            <ProgressBar
                                completed={completedCount}
                                total={cards.length}
                                barColor="bg-blue-600 dark:bg-blue-500"
                            />
                        </div>

                        {/* Modal card using CardModule component */}
                        <div className="w-full mb-6 h-[400px]"> {/* Fixed height container for modal view */}
                            <CardModule
                                card={card}
                                showBack={showBack}
                                onFlip={toggleCardFlip}
                                size="lg"
                                containMonospaceContent={true}
                                status={cardStatus[card?.id]}
                                className="card-modal-view"
                                frontStyles={{
                                    gradient: "bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-blue-900/30",
                                    custom: { boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)" }
                                }}
                                backStyles={{
                                    gradient: "bg-gradient-to-br from-blue-100 to-white dark:from-blue-900/50 dark:to-gray-800",
                                    custom: { boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)" }
                                }}
                            />
                        </div>

                        {/* Modal card controls */}
                        <CardControls
                            onCorrect={() => handleCardStatus('correct')}
                            onIncorrect={() => handleCardStatus('incorrect')}
                            onPrevious={handlePreviousCard}
                            onNext={handleNextCard}
                            showAnswer={showBack}
                            onShowAnswer={() => setShowBack(true)}
                            isFirst={index === 0}
                            isLast={index === cards.length - 1}
                            size="lg"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudySet;

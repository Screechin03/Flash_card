import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CreateTopicModal from '../components/CreateTopicModal';
import { api, getToken, removeToken } from '../api';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import ProgressBar from '../components/ProgressBar';
import RecentCardItem from '../components/RecentCardItem';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

function Dashboard({ user, setUser }) {
    const [sets, setSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activity, setActivity] = useState([]);
    const [progress, setProgress] = useState({});
    const [dailyMap, setDailyMap] = useState([]);
    const [filter, setFilter] = useState('all');
    const [subjects, setSubjects] = useState([]);
    const [selectedSet, setSelectedSet] = useState(null);
    const [recentCards, setRecentCards] = useState([]);
    const [showCreateTopic, setShowCreateTopic] = useState(false);
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        try {
            // Get sets
            const setsRes = await api.getSets(getToken());

            // Fetch complete set data with cards for each set
            const completeSets = await Promise.all(
                setsRes.sets.map(async (set) => {
                    try {
                        const detailedSet = await api.getSetById(set.id, getToken());
                        return detailedSet.set;
                    } catch (err) {
                        console.error(`Error fetching details for set ${set.id}:`, err);
                        return set;
                    }
                })
            );

            setSets(completeSets);

            // Extract unique subjects
            const uniqueSubjects = [...new Set(completeSets.map(set => {
                const parts = set.title.split(':');
                return parts.length > 1 ? parts[0].trim() : 'General';
            }))];
            setSubjects(['all', ...uniqueSubjects]);

            // Get analytics
            try {
                const [progressRes, dailyRes, topicsRes] = await Promise.all([
                    api.getProgress(getToken()),
                    api.getDailyActivity(getToken()),
                    api.getTopicProgress(getToken())
                ]);

                if (progressRes?.progress) {
                    const progressData = {};
                    progressRes.progress.forEach(item => {
                        progressData[item.set_title] = {
                            read: item.cards_studied || 0,
                            total: item.total_cards || 0,
                            correct: item.correct_count || 0,
                            incorrect: item.incorrect_count || 0
                        };
                    });
                    setProgress(progressData);
                }

                if (dailyRes?.activity) {
                    setDailyMap(dailyRes.activity.map(a => ({
                        date: a.date,
                        count: Number(a.total_count)
                    })));
                }

                // If no real data yet, use placeholder data
                if (!dailyMap.length) {
                    setDailyMap([
                        { date: '2025-06-15', count: 2 },
                        { date: '2025-06-16', count: 4 },
                        { date: '2025-06-17', count: 1 },
                        { date: '2025-06-18', count: 5 },
                        { date: '2025-06-19', count: 3 },
                        { date: '2025-06-20', count: 6 },
                        { date: '2025-06-21', count: 8 },
                        { date: '2025-06-22', count: 5 },
                    ]);
                }

                // If no progress data yet, create placeholders
                if (Object.keys(progress).length === 0) {
                    const placeholderProgress = {};
                    setsRes.sets.forEach(s => {
                        placeholderProgress[s.title] = {
                            read: Math.floor(Math.random() * (s.card_count || 1)),
                            total: s.card_count,
                            correct: Math.floor(Math.random() * (s.card_count || 1) * 0.7),
                            incorrect: Math.floor(Math.random() * (s.card_count || 1) * 0.3)
                        };
                    });
                    setProgress(placeholderProgress);
                }

            } catch (analyticsErr) {
                console.error('Analytics error:', analyticsErr);
                // Continue with app even if analytics fail
            }

            // Try to get recent cards
            try {
                const recentRes = await api.getRecentCards(getToken());
                if (recentRes?.cards?.length) {
                    // Filter out cards with undefined or 'undefined' setId
                    const validCards = recentRes.cards.filter(card =>
                        card.setId && card.setId !== 'undefined'
                    );
                    setRecentCards(validCards);
                }
            } catch (recentErr) {
                console.error('Recent cards error:', recentErr);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("Dashboard mounting, initializing data...");
        // Initial data fetch
        fetchData().then(() => {
            console.log("Initial fetch complete");
            // After fetch is complete, check for progress updates
            refreshProgress();
        });

        // Setup navigation event listener to refresh data when returning via browser navigation
        const handleNavigation = () => {
            console.log("Navigation detected, refreshing progress...");
            refreshProgress();
        };

        // Set up a focus event listener to check for updates when window regains focus
        const handleFocus = () => {
            console.log("Window focus detected, refreshing progress...");
            refreshProgress();
        };

        // Check for recent cards in session storage
        const checkSessionRecentCards = () => {
            try {
                const storedRecentCards = sessionStorage.getItem('flashcard_recent_cards');
                if (storedRecentCards) {
                    const recentCardsData = JSON.parse(storedRecentCards);
                    if (recentCardsData.length > 0) {
                        console.log('Found recent cards in session storage:', recentCardsData.length);
                        console.log('Recent cards status data:', recentCardsData.map(card => ({ id: card.cardId, status: card.status })));
                        setRecentCards(recentCardsData);
                    }
                }
            } catch (err) {
                console.error('Error loading recent cards from session storage:', err);
            }
        };

        // Check for recent cards in session storage immediately
        checkSessionRecentCards();

        window.addEventListener('focus', handleFocus);
        window.addEventListener('popstate', handleNavigation);

        // Set up an interval to periodically check for updates (every 15 seconds)
        const refreshInterval = setInterval(() => {
            console.log("Interval refresh triggered");
            refreshProgress();
        }, 15000);

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('popstate', handleNavigation);
            clearInterval(refreshInterval);
        };
    }, []);

    // Add to recent cards when a set is selected for study
    useEffect(() => {
        // Only proceed if selectedSet is valid and has a valid ID
        if (selectedSet &&
            selectedSet.cards &&
            selectedSet.cards.length > 0 &&
            selectedSet.id &&
            selectedSet.id !== 'undefined') {

            const lastCard = selectedSet.cards[0];
            setRecentCards(prev => [{
                setId: selectedSet.id,
                cardId: lastCard.id,
                front: lastCard.front,
                back: lastCard.back,
                set_title: selectedSet.title,
                timestamp: new Date().toISOString()
            }, ...prev.slice(0, 9)]); // keep last 10
        }
    }, [selectedSet]);

    const handleLogout = () => {
        removeToken();
        setUser(null);
        navigate('/login');
    };

    const handleTopicCreated = (newSet) => {
        // Add the new set to the sets list
        setSets(prev => [newSet, ...prev]);

        // Extract subject from the new set title
        const parts = newSet.title.split(':');
        const subject = parts.length > 1 ? parts[0].trim() : 'General';

        // Update subjects list if this is a new subject
        setSubjects(prev => {
            if (!prev.includes(subject) && subject !== 'all') {
                return [...prev, subject];
            }
            return prev;
        });

        // Create placeholder progress for the new set
        setProgress(prev => ({
            ...prev,
            [newSet.title]: {
                read: 0,
                total: newSet.card_count || 0,
                correct: 0,
                incorrect: 0
            }
        }));

        // Close the modal
        setShowCreateTopic(false);
    };

    // Refresh progress data and recent cards
    const refreshProgress = async () => {
        try {
            // Check if there's any session storage progress updates first
            const needsRefresh = sessionStorage.getItem('flashcard_dashboard_refresh') === 'true';
            const lastStudiedSetId = sessionStorage.getItem('flashcard_last_studied_set');
            const progressUpdateString = sessionStorage.getItem('flashcard_progress_update');
            const isProgressReset = sessionStorage.getItem('flashcard_progress_reset') === 'true';

            // Create a local copy to store our progress data
            let progressData = {};

            // Get fresh progress data from the API
            const progressRes = await api.getProgress(getToken());
            if (progressRes?.progress) {
                progressRes.progress.forEach(item => {
                    progressData[item.set_title] = {
                        read: item.cards_studied || 0,
                        total: item.total_cards || 0,
                        correct: item.correct_count || 0,
                        incorrect: item.incorrect_count || 0
                    };
                });
            }

            // If we have session storage updates, apply them on top of the API data
            if (needsRefresh && progressUpdateString && lastStudiedSetId) {
                try {
                    const progressUpdate = JSON.parse(progressUpdateString);

                    // If this was a reset operation, completely replace the progress
                    if (isProgressReset) {
                        console.log('Resetting progress for:', lastStudiedSetId);
                        progressData[lastStudiedSetId] = {
                            read: 0,
                            total: progressUpdate.total || 0,
                            correct: 0,
                            incorrect: 0,
                            timestamp: new Date().toISOString()
                        };
                        sessionStorage.removeItem('flashcard_progress_reset');
                    } else {
                        // Normal update
                        progressData[lastStudiedSetId] = {
                            ...progressUpdate,
                            // Make sure we preserve the data structure
                            read: progressUpdate.read || 0,
                            total: progressUpdate.total || 0,
                            correct: progressUpdate.correct || 0,
                            incorrect: progressUpdate.incorrect || 0
                        };
                    }

                    console.log('Applied progress update from session:', lastStudiedSetId, progressUpdate);

                    // Clear session storage after applying updates                        sessionStorage.removeItem('flashcard_dashboard_refresh');
                    sessionStorage.removeItem('flashcard_progress_update');
                    // Also clear the set ID and set-specific progress after we've used it
                    sessionStorage.removeItem('flashcard_last_studied_set_id');
                    sessionStorage.removeItem('flashcard_set_progress');
                } catch (error) {
                    console.error('Error processing progress update:', error);
                }
            }

            // Set the progress data once with all updates applied
            setProgress(progressData);

            // Refresh recent cards data - first try the API
            try {
                console.log('Refreshing recent cards data');
                const recentRes = await api.getRecentCards(getToken());

                // Check if API returned valid cards
                if (recentRes?.cards?.length) {
                    // Filter out cards with undefined or 'undefined' setId
                    const validCards = recentRes.cards.filter(card =>
                        card.setId && card.setId !== 'undefined'
                    );

                    if (validCards.length > 0) {
                        console.log('Got recent cards from API:', validCards.length);
                        setRecentCards(validCards);
                        return; // Successfully got cards from API, exit the function
                    }
                }

                // If no cards from API, check session storage as fallback
                console.log('No recent cards from API, checking session storage');
                const storedRecentCards = sessionStorage.getItem('flashcard_recent_cards');
                if (storedRecentCards) {
                    try {
                        const parsedCards = JSON.parse(storedRecentCards);
                        if (parsedCards && parsedCards.length > 0) {
                            console.log('Using recent cards from session storage:', parsedCards.length);
                            setRecentCards(parsedCards);
                        } else {
                            console.log('No recent cards found in session storage');
                        }
                    } catch (parseErr) {
                        console.error('Error parsing recent cards from session storage:', parseErr);
                    }
                }
            } catch (recentErr) {
                console.error('Recent cards refresh error:', recentErr);

                // On API error, try session storage as backup
                try {
                    const storedRecentCards = sessionStorage.getItem('flashcard_recent_cards');
                    if (storedRecentCards) {
                        const parsedCards = JSON.parse(storedRecentCards);
                        if (parsedCards && parsedCards.length > 0) {
                            console.log('Using recent cards from session storage after API error:', parsedCards.length);
                            setRecentCards(parsedCards);
                        }
                    }
                } catch (storageErr) {
                    console.error('Error accessing session storage:', storageErr);
                }
            }
        } catch (err) {
            console.error('Error refreshing progress:', err);
        }
    };

    // Chart data for topic progress
    const barData = {
        labels: Object.keys(progress).map(label => {
            // Truncate long labels and add ellipsis
            return label.length > 15 ? label.substring(0, 15) + '...' : label;
        }),
        datasets: [
            {
                label: 'Cards Read',
                data: Object.values(progress).map(p => p.read),
                backgroundColor: '#3b82f6', // TailwindCSS blue-500
                borderRadius: 6,
                barThickness: 16,
                maxBarThickness: 25,
            },
            {
                label: 'Total Cards',
                data: Object.values(progress).map(p => p.total),
                backgroundColor: '#94a3b8', // TailwindCSS slate-400
                borderRadius: 6,
                barThickness: 16,
                maxBarThickness: 25,
            },
        ],
    };

    // Chart data for daily activity
    const lineData = {
        labels: dailyMap.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [
            {
                label: 'Cards Studied',
                data: dailyMap.map(d => d.count),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#ffffff',
                pointHoverBackgroundColor: '#2563eb',
                pointHoverBorderColor: '#ffffff',
                pointHoverRadius: 6,
                pointRadius: 4,
                borderWidth: 3,
            }
        ]
    };

    // Chart data for activity distribution
    const doughnutData = {
        labels: ['Correct', 'Incorrect'],
        datasets: [
            {
                data: [
                    Object.values(progress).reduce((acc, p) => acc + ((p && p.correct) || 0), 0),
                    Object.values(progress).reduce((acc, p) => acc + ((p && p.incorrect) || 0), 0),
                ],
                backgroundColor: ['#22c55e', '#ef4444'], // TailwindCSS green-500, red-500
                hoverBackgroundColor: ['#16a34a', '#dc2626'], // TailwindCSS green-600, red-600
                borderWidth: 0,
                borderRadius: 3,
                hoverOffset: 5,
            },
        ],
    };

    // Check if setId is defined before rendering links
    const renderSetLinks = (set) => {
        // Check for undefined, null, or 'undefined' string
        if (!set || !set.id || set.id === 'undefined') {
            return (
                <button className="flex items-center justify-center bg-gray-400 dark:bg-gray-600 text-white px-3 py-1.5 rounded-lg shadow-md text-xs cursor-not-allowed">
                    Unavailable
                </button>
            );
        }

        return (
            <>
                <Link to={`/sets/${set.id}/study`} className="flex items-center justify-center bg-blue-600 dark:bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-md text-xs hover:bg-blue-700 dark:hover:bg-blue-700 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 005.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    Study
                </Link>
                <Link to={`/sets/${set.id}/focus`} className="flex items-center justify-center bg-green-600 dark:bg-green-600 text-white px-3 py-1.5 rounded-lg shadow-md text-xs hover:bg-green-700 dark:hover:bg-green-700 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Focus
                </Link>
            </>
        );
    };

    return (
        <div className="min-h-screen bg-primary dark:bg-gray-900 flex flex-col">
            <Navbar user={user} sets={sets} onLogout={handleLogout} onSelectSet={setSelectedSet} />
            <div className="ml-64 max-w-7xl mx-auto mt-10 px-4 pb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-400 font-['Inter'] mb-1">Welcome, {user.username}!</h1>
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-['Inter']">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateTopic(true)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-400 dark:hover:from-blue-600 dark:hover:to-blue-500 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 font-medium text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Create Topic
                    </button>
                </div>
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 animate-shake">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-700 dark:text-red-300 font-medium">{error}</span>
                        </div>
                    </div>
                )}
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-blue-700 dark:text-blue-400">Loading analytics...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* User Progress */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 flex flex-col gap-3 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 md:col-span-2">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold text-blue-700 dark:text-blue-400">Progress by Topic</h2>
                                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full font-medium">{Object.keys(progress).length} Topics</span>
                            </div>
                            <div className="chart-container h-52 mt-2">
                                {Object.keys(progress).length > 0 ? (
                                    <Bar
                                        data={barData}
                                        options={{
                                            maintainAspectRatio: false,
                                            responsive: true,
                                            plugins: {
                                                legend: {
                                                    labels: {
                                                        color: document.documentElement.classList.contains('dark') ? '#a3b3c9' : '#4b5563',
                                                        usePointStyle: true,
                                                        pointStyle: 'circle',
                                                        padding: 15,
                                                        font: {
                                                            family: "'Inter', sans-serif",
                                                            size: 12
                                                        }
                                                    },
                                                    position: 'bottom'
                                                },
                                                tooltip: {
                                                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                                                    titleFont: {
                                                        family: "'Inter', sans-serif",
                                                        size: 13
                                                    },
                                                    bodyFont: {
                                                        family: "'Inter', sans-serif",
                                                        size: 12
                                                    },
                                                    padding: 12,
                                                    cornerRadius: 6
                                                }
                                            },
                                            scales: {
                                                x: {
                                                    grid: {
                                                        display: false
                                                    },
                                                    ticks: {
                                                        color: document.documentElement.classList.contains('dark') ? '#a3b3c9' : '#4b5563'
                                                    }
                                                },
                                                y: {
                                                    beginAtZero: true,
                                                    grid: {
                                                        color: 'rgba(148, 163, 184, 0.1)'
                                                    },
                                                    ticks: {
                                                        color: document.documentElement.classList.contains('dark') ? '#a3b3c9' : '#4b5563',
                                                        precision: 0
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                        No progress data available yet
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Daily Activity */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 flex flex-col gap-3 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold text-blue-700 dark:text-blue-400">Daily Activity</h2>
                                <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full font-medium">Last {dailyMap.length} days</span>
                            </div>
                            <div className="chart-container h-40 mt-2">
                                {dailyMap.length > 0 ? (
                                    <Line
                                        data={lineData}
                                        options={{
                                            maintainAspectRatio: false,
                                            responsive: true,
                                            plugins: {
                                                legend: {
                                                    display: false
                                                },
                                                tooltip: {
                                                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                                                    titleFont: {
                                                        family: "'Inter', sans-serif",
                                                        size: 13
                                                    },
                                                    bodyFont: {
                                                        family: "'Inter', sans-serif",
                                                        size: 12
                                                    },
                                                    padding: 12,
                                                    cornerRadius: 6
                                                }
                                            },
                                            scales: {
                                                x: {
                                                    grid: {
                                                        display: false
                                                    },
                                                    ticks: {
                                                        color: document.documentElement.classList.contains('dark') ? '#a3b3c9' : '#4b5563',
                                                        font: {
                                                            size: 10
                                                        }
                                                    }
                                                },
                                                y: {
                                                    beginAtZero: true,
                                                    grid: {
                                                        color: 'rgba(148, 163, 184, 0.1)'
                                                    },
                                                    ticks: {
                                                        color: document.documentElement.classList.contains('dark') ? '#a3b3c9' : '#4b5563',
                                                        precision: 0,
                                                        stepSize: 1
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                        No activity data available yet
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Study Accuracy */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 flex flex-col gap-3 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold text-blue-700 dark:text-blue-400">Study Accuracy</h2>
                            </div>
                            <div className="chart-container h-40 mt-2 flex items-center justify-center">
                                {Object.values(progress).length > 0 && Object.values(progress).reduce((acc, p) => acc + ((p && p.correct) || 0) + ((p && p.incorrect) || 0), 0) > 0 ? (
                                    <Doughnut
                                        data={doughnutData}
                                        options={{
                                            maintainAspectRatio: false,
                                            responsive: true,
                                            cutout: '70%',
                                            plugins: {
                                                legend: {
                                                    position: 'bottom',
                                                    labels: {
                                                        color: document.documentElement.classList.contains('dark') ? '#a3b3c9' : '#4b5563',
                                                        usePointStyle: true,
                                                        pointStyle: 'circle',
                                                        padding: 15,
                                                        font: {
                                                            family: "'Inter', sans-serif",
                                                            size: 12
                                                        }
                                                    }
                                                },
                                                tooltip: {
                                                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                                                    padding: 12,
                                                    cornerRadius: 6
                                                }
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="text-gray-500 dark:text-gray-400">
                                        No accuracy data available yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Bento grid for sets */}
                <div className="mt-12">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h2 className="text-xl font-bold text-blue-700 dark:text-blue-400 font-['Inter'] flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                            </svg>
                            Your Topics
                            <span className="ml-3 text-xs px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                                {sets.length} {sets.length === 1 ? 'Topic' : 'Topics'}
                            </span>
                        </h2>
                        <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-1.5">
                            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium px-2 font-['Inter']">Filter:</span>
                            <div className="relative">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg py-1.5 px-3 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 dark:text-gray-200 font-['Inter']"
                                >
                                    {subjects.map(subject => (
                                        <option key={subject} value={subject}>
                                            {subject === 'all' ? 'All Subjects' : subject}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-600 dark:text-blue-400">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-grid">
                        {sets
                            .filter(set => {
                                if (filter === 'all') return true;
                                const parts = set.title.split(':');
                                const subject = parts.length > 1 ? parts[0].trim() : 'General';
                                return subject === filter;
                            })
                            .map(set => (
                                <div key={set.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 flex flex-col gap-3 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 compact-card animate-fade-in">
                                    <div className="flex justify-between items-center">
                                        <Link to={`/sets/${set.id}`} className="text-lg font-bold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition line-clamp-1 font-['Inter']">{set.title}</Link>
                                        <span className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-full font-medium">{set.card_count} cards</span>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-auto font-['Inter']">{set.description}</div>
                                    <div className="mt-2 mb-2">
                                        <ProgressBar
                                            completed={progress[set.title]?.read || 0}
                                            total={progress[set.title]?.total || 0}
                                            barColor="bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-300"
                                            height="h-2"
                                            showPercentage={true}
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                        {renderSetLinks(set)}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Recently Read Cards */}
                <div className="mt-12 mb-10">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-xl font-bold text-blue-700 dark:text-blue-400 font-['Inter']">Recently Studied Cards</h2>
                        {recentCards.length > 0 && (
                            <span className="text-xs px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 rounded-full font-medium">
                                {recentCards.length} {recentCards.length === 1 ? 'Card' : 'Cards'}
                            </span>
                        )}
                    </div>
                    {recentCards.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <p className="text-gray-600 dark:text-gray-300 font-['Inter']">No cards studied yet. Start studying to see your recent cards here!</p>
                            {sets.length > 0 && (
                                <Link to={`/sets/${sets[0].id}/study`} className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 mt-6 font-medium text-sm">
                                    Start Studying
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {recentCards.map((card, i) => (
                                <RecentCardItem
                                    key={card.cardId + '-' + i}
                                    card={card}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Dynamic Set Info Panel */}
                {selectedSet && (
                    <div className="modal-overlay" onClick={() => setSelectedSet(null)}>
                        <div className="modal-content max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                            <div className="relative">
                                <div className="absolute top-0 right-0 p-3">
                                    <button className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors" onClick={() => setSelectedSet(null)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="p-6">
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-2 font-['Inter']">{selectedSet.title}</h3>
                                        <div className="text-gray-600 dark:text-gray-300 mb-3 font-['Inter']">{selectedSet.description}</div>

                                        <div className="flex flex-wrap gap-3 mt-4 mb-4">
                                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2 text-sm flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                                </svg>
                                                <span className="text-blue-700 dark:text-blue-300 font-medium">{selectedSet.card_count || 0} Cards</span>
                                            </div>

                                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2 text-sm flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-green-700 dark:text-green-300 font-medium">
                                                    {progress[selectedSet.title]?.correct || 0} Correct
                                                </span>
                                            </div>

                                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 text-sm flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-red-700 dark:text-red-300 font-medium">
                                                    {progress[selectedSet.title]?.incorrect || 0} Incorrect
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-['Inter']">Progress</h4>
                                            <ProgressBar
                                                completed={progress[selectedSet.title]?.read || 0}
                                                total={progress[selectedSet.title]?.total || 0}
                                                barColor="bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-500 dark:to-indigo-400"
                                                height="h-3"
                                                showPercentage={true}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Link to={`/sets/${selectedSet.id}/study`}
                                            className="flex-1 flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-600 dark:to-blue-500 dark:hover:from-blue-500 dark:hover:to-blue-400 text-white px-4 py-3 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm font-medium">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 005.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                            </svg>
                                            Study Mode
                                        </Link>
                                        <Link to={`/sets/${selectedSet.id}/focus`}
                                            className="flex-1 flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-600 dark:to-green-500 dark:hover:from-green-500 dark:hover:to-green-400 text-white px-4 py-3 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm font-medium">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                            Focus Mode
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create Topic Modal */}
                {showCreateTopic && (
                    <div className="modal-overlay" onClick={() => setShowCreateTopic(false)}>
                        <div className="modal-content max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                            <div className="relative p-6">
                                <div className="absolute top-0 right-0 p-3">
                                    <button className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors" onClick={() => setShowCreateTopic(false)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 mb-5">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400 font-['Inter']">Create a New Topic</h3>
                                </div>

                                <CreateTopicModal onClose={() => setShowCreateTopic(false)} onTopicCreated={handleTopicCreated} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../api';
import ProgressBar from './ProgressBar';

/**
 * Enhanced sidebar navigation component that displays topics and cards
 * @param {Object} props
 * @param {Array} props.sets - Array of set objects
 * @param {Function} props.onSelectSet - Function to call when a set is selected
 * @param {string} props.activeSetId - ID of the currently active set
 * @param {string} props.activeCardId - ID of the currently active card
 */
function SidebarNav({ sets, onSelectSet, activeSetId, activeCardId }) {
    const [expandedSets, setExpandedSets] = useState({});
    const [progresses, setProgresses] = useState({});
    const [subjects, setSubjects] = useState([]);
    const [expandedSubjects, setExpandedSubjects] = useState({});

    // Extract unique subjects and organize sets by subject
    useEffect(() => {
        if (sets && sets.length) {
            const subjectsMap = {};
            sets.forEach(set => {
                const parts = set.title.split(':');
                const subject = parts.length > 1 ? parts[0].trim() : 'General';

                if (!subjectsMap[subject]) {
                    subjectsMap[subject] = [];
                }
                subjectsMap[subject].push(set);
            });

            setSubjects(Object.keys(subjectsMap).map(name => ({
                name,
                sets: subjectsMap[name]
            })));

            // Auto-expand the active set
            if (activeSetId) {
                setExpandedSets(prev => ({ ...prev, [activeSetId]: true }));

                // Find and auto-expand the subject containing the active set
                const activeSet = sets.find(s => s.id === activeSetId);
                if (activeSet) {
                    const parts = activeSet.title.split(':');
                    const subject = parts.length > 1 ? parts[0].trim() : 'General';
                    setExpandedSubjects(prev => ({ ...prev, [subject]: true }));
                }
            }
        }
    }, [sets, activeSetId]);

    // Fetch progress data for all sets
    const fetchProgressData = () => {
        if (sets && sets.length) {
            api.getProgress(getToken())
                .then(data => {
                    const progressMap = {};
                    if (data?.progress) {
                        data.progress.forEach(item => {
                            progressMap[item.set_id] = {
                                completed: item.cards_studied || 0,
                                total: item.total_cards || 0,
                                correct: item.correct_count || 0,
                                incorrect: item.incorrect_count || 0
                            };
                        });
                        setProgresses(progressMap);
                    }
                })
                .catch(err => console.error('Error fetching progress:', err));
        }
    };

    // Fetch progress data when sets change
    useEffect(() => {
        fetchProgressData();
    }, [sets]);

    // Set up a refresh interval to keep progress data updated
    useEffect(() => {
        // Check for progress updates every 5 seconds for more responsive UI
        const refreshInterval = setInterval(() => {
            fetchProgressData();
            checkSessionProgress(); // Also check session storage on each interval
        }, 5000);

        // Check session storage for recent progress updates
        const checkSessionProgress = () => {
            const needsRefresh = sessionStorage.getItem('flashcard_dashboard_refresh') === 'true';
            if (needsRefresh) {
                // Check if we have specific set progress information
                const lastStudiedSetId = sessionStorage.getItem('flashcard_last_studied_set_id');
                const setProgressString = sessionStorage.getItem('flashcard_set_progress');
                const progressUpdateString = sessionStorage.getItem('flashcard_progress_update');

                // First try to use the specific set progress data
                if (setProgressString) {
                    try {
                        const setProgress = JSON.parse(setProgressString);

                        if (setProgress && setProgress.set_id) {
                            console.log('Applying specific set progress update for:', setProgress.set_id);
                            // Update the specific set's progress in our local state
                            setProgresses(prev => ({
                                ...prev,
                                [setProgress.set_id]: {
                                    completed: setProgress.cards_studied || 0,
                                    total: setProgress.total_cards || 0,
                                    correct: setProgress.correct_count || 0,
                                    incorrect: setProgress.incorrect_count || 0
                                }
                            }));
                        }
                    } catch (err) {
                        console.error('Error updating from specific set progress:', err);
                    }
                }
                // Fall back to using the more generic progress update
                else if (lastStudiedSetId && progressUpdateString) {
                    try {
                        // Apply immediate update to the specific set
                        const progressUpdate = JSON.parse(progressUpdateString);

                        // Update the specific set's progress in our local state
                        setProgresses(prev => ({
                            ...prev,
                            [lastStudiedSetId]: {
                                completed: progressUpdate.read || 0,
                                total: progressUpdate.total || 0,
                                correct: progressUpdate.correct || 0,
                                incorrect: progressUpdate.incorrect || 0
                            }
                        }));
                    } catch (err) {
                        console.error('Error updating progress from session storage:', err);
                    }
                }

                // Still fetch the complete progress data
                fetchProgressData();
            }
        };

        // Add event listeners to refresh on focus
        window.addEventListener('focus', checkSessionProgress);

        return () => {
            clearInterval(refreshInterval);
            window.removeEventListener('focus', checkSessionProgress);
        };
    }, []);

    const toggleSetExpanded = (setId) => {
        setExpandedSets(prev => ({ ...prev, [setId]: !prev[setId] }));
    };

    const toggleSubjectExpanded = (subject) => {
        setExpandedSubjects(prev => ({ ...prev, [subject]: !prev[subject] }));
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400">Topics</h3>
                <Link to="/create-topic" className="text-sm text-blue-700 dark:text-blue-400 hover:underline">+ New</Link>
            </div>

            {subjects.map(subject => (
                <div key={subject.name} className="mb-4">
                    <div
                        className="flex justify-between items-center cursor-pointer py-1 border-b border-gray-200 dark:border-gray-700"
                        onClick={() => toggleSubjectExpanded(subject.name)}
                    >
                        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">{subject.name}</h4>
                        <span className="text-gray-500 dark:text-gray-400">
                            {expandedSubjects[subject.name] ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </span>
                    </div>

                    {expandedSubjects[subject.name] && (
                        <ul className="pl-2 space-y-1 mt-2">
                            {subject.sets.map(set => (
                                <li key={set.id} className="group">
                                    <div className="mb-1">
                                        <div
                                            className={`flex justify-between items-center py-1 px-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition
                        ${activeSetId === set.id ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                                        >
                                            <button
                                                className="w-full text-left text-gray-600 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 
                          transition text-sm font-medium flex justify-between items-center"
                                                onClick={() => {
                                                    onSelectSet(set);
                                                    toggleSetExpanded(set.id);
                                                }}
                                            >
                                                <span className="line-clamp-1">{set.title.split(':')[1]?.trim() || set.title}</span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">{set.card_count || 0}</span>
                                            </button>

                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`h-4 w-4 text-gray-400 dark:text-gray-500 ml-1 transform transition-transform
                          ${expandedSets[set.id] ? 'rotate-90' : ''}`}
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleSetExpanded(set.id);
                                                }}
                                            >
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>

                                        <div className="px-1 mt-1">
                                            {/* Progress bar for this set */}
                                            <ProgressBar
                                                completed={progresses[set.id]?.completed || 0}
                                                total={set.card_count || 0}
                                                showPercentage={false}
                                                barColor="bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-300"
                                                height="h-1.5"
                                            />
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 text-right">
                                                {progresses[set.id]?.completed || 0}/{set.card_count || 0}
                                            </div>
                                        </div>

                                        <div className="flex justify-between px-1 mt-1 space-x-1">
                                            <Link to={`/sets/${set.id}`} className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400">
                                                Edit
                                            </Link>
                                            <Link to={`/sets/${set.id}/study`} className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400">
                                                Study
                                            </Link>
                                            <Link to={`/sets/${set.id}/focus`} className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400">
                                                Focus
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Show cards if set is expanded */}
                                    {expandedSets[set.id] && set.cards && (
                                        <ul className="pl-4 space-y-1 mb-2">
                                            {set.cards.map(card => (
                                                <li key={card.id}>
                                                    <Link
                                                        to={`/sets/${set.id}/study?card=${card.id}`}
                                                        className={`block py-1 px-2 text-xs rounded-sm
                              ${activeCardId === card.id ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                                                                'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                                    >
                                                        {card.front.length > 30 ? card.front.substring(0, 30) + '...' : card.front}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    );
}

export default SidebarNav;

import React from 'react';
import { Link } from 'react-router-dom';
import './StatusIndicator.css';

/**
 * Reusable component for displaying a recent card item in the dashboard
 */
function RecentCardItem({ card }) {
    // No longer need flip state or handler as we'll only show front content

    // Create metadata element for reuse
    const MetadataDisplay = ({ position = 'bottom' }) => (
        <div className={`absolute ${position}-0 left-0 right-0 w-full bg-white/80 dark:bg-gray-800/80 p-2 border-t border-gray-100 dark:border-gray-700`}>
            <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 text-xs truncate max-w-[100px]">
                    {new Date(card.timestamp).toLocaleString()}
                </span>
                <div className="flex gap-2 ml-auto">
                    {position === 'bottom' ? (
                        <>
                            {card.setId && card.setId !== 'undefined' ? (
                                <Link
                                    to={`/sets/${card.setId}/study`}
                                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-xs rounded-md transition-colors duration-200 z-10 relative"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Study
                                </Link>
                            ) : (
                                <span className="px-2 py-1 bg-gray-400 dark:bg-gray-600 text-white text-xs rounded-md cursor-not-allowed">
                                    Unavailable
                                </span>
                            )}
                        </>
                    ) : (
                        <>
                            {card.setId && card.setId !== 'undefined' ? (
                                <Link
                                    to={`/sets/${card.setId}/focus`}
                                    className="px-2 py-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white text-xs rounded-md transition-colors duration-200 z-10 relative"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Focus
                                </Link>
                            ) : (
                                <span className="px-2 py-1 bg-gray-400 dark:bg-gray-600 text-white text-xs rounded-md cursor-not-allowed">
                                    Unavailable
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    // No longer need card data or style objects since we're directly rendering the card

    return (
        <div className="compact-card recently-studied-card bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 animate-fade-in hover-lift">
            <div className="card-content relative">
                {card.status && (
                    <div className={`absolute top-2 right-2 z-10 px-3 py-1 rounded-full text-xs font-bold shadow-md status-badge ${card.status === 'correct'
                            ? 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100 border-2 border-green-300 dark:border-green-600 status-badge-correct'
                            : 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-100 border-2 border-red-300 dark:border-red-600 status-badge-incorrect'
                        }`}>
                        {card.status === 'correct' ? 'Correct' : 'Incorrect'}
                    </div>
                )}
                {/* Debug output - remove after testing */}
                {!card.status && (
                    <div className="absolute top-0 left-0 bg-yellow-100 text-yellow-800 text-xs p-1 z-20">
                        No status
                    </div>
                )}
                <div className="card-content-text text-blue-700 dark:text-blue-400 font-bold font-['Inter']">
                    {card.front}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded-md text-center w-full mt-2">
                    From: {card.set_title || 'Unknown Topic'}
                </div>
            </div>
            <MetadataDisplay position="bottom" />
        </div>
    );
}

export default RecentCardItem;

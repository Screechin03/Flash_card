import React from 'react';

/**
 * Reusable progress bar component
 * @param {Object} props
 * @param {number} props.completed - Number of completed items
 * @param {number} props.total - Total number of items
 * @param {string} props.barColor - Color class for the progress bar
 * @param {string} props.height - Height class for the progress bar
 * @param {boolean} props.showPercentage - Whether to show percentage text
 */
function ProgressBar({ completed, total, barColor = 'bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-300', height = 'h-2', showPercentage = true }) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="w-full font-['Inter']">
            <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${height} mb-1.5`}>
                <div
                    className={`${height} rounded-full transition-all duration-500 ease-out ${barColor}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            {showPercentage && (
                <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{completed} of {total} completed</span>
                    <span className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${percentage >= 75 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                            percentage >= 40 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}>{percentage}%</span>
                </div>
            )}
        </div>
    );
}

export default ProgressBar;

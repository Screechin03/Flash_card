import React from 'react';

/**
 * Card navigation and status controls component
 * @param {Object} props
 * @param {Function} props.onCorrect - Function to call when card is marked correct
 * @param {Function} props.onIncorrect - Function to call when card is marked incorrect
 * @param {Function} props.onPrevious - Function to call when navigating to previous card
 * @param {Function} props.onNext - Function to call when navigating to next card
 * @param {boolean} props.showAnswer - Whether answer is currently shown
 * @param {Function} props.onShowAnswer - Function to call to show answer
 * @param {boolean} props.isFirst - Whether this is the first card
 * @param {boolean} props.isLast - Whether this is the last card
 * @param {string} props.size - 'sm', 'md', or 'lg' for button size
 */
function CardControls({
    onCorrect,
    onIncorrect,
    onPrevious,
    onNext,
    showAnswer,
    onShowAnswer,
    isFirst = false,
    isLast = false,
    size = 'md'
}) {
    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-2 text-base'
    };

    return (
        <div className="flex flex-wrap gap-2 justify-center">
            <button
                onClick={onPrevious}
                disabled={isFirst}
                className={`${sizeClasses[size]} bg-gray-200 dark:bg-gray-700 text-blue-700 dark:text-blue-300 rounded shadow hover:bg-blue-100 dark:hover:bg-gray-600 transition disabled:opacity-50`}
            >
                Previous Card
            </button>

            {showAnswer ? (
                <>
                    <button
                        onClick={onIncorrect}
                        className={`${sizeClasses[size]} bg-red-500 dark:bg-red-600 text-white rounded shadow hover:bg-red-600 dark:hover:bg-red-700 transition`}
                    >
                        I Got It Wrong
                    </button>
                    <button
                        onClick={onCorrect}
                        className={`${sizeClasses[size]} bg-green-600 dark:bg-green-700 text-white rounded shadow hover:bg-green-700 dark:hover:bg-green-800 transition`}
                    >
                        I Got It Right
                    </button>
                </>
            ) : (
                <button
                    onClick={onShowAnswer}
                    className={`${sizeClasses[size]} bg-blue-700 dark:bg-blue-600 text-white rounded shadow hover:bg-blue-800 dark:hover:bg-blue-700 transition`}
                >
                    Show Answer
                </button>
            )}

            <button
                onClick={onNext}
                disabled={isLast}
                className={`${sizeClasses[size]} bg-blue-700 dark:bg-blue-600 text-white rounded shadow hover:bg-blue-900 dark:hover:bg-blue-700 transition disabled:opacity-50`}
            >
                Next Card
            </button>
        </div>
    );
}

export default CardControls;

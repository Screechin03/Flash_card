import React from 'react';
import './StatusIndicator.css';

/**
 * Reusable card component that handles flipping animation
 * @param {Object} props
 * @param {Object} props.card - Card object with front and back properties
 * @param {boolean} props.showBack - Whether to show back of card
 * @param {Function} props.onFlip - Function to call when card is flipped
 * @param {string} props.size - 'sm', 'md', or 'lg' for card size
 * @param {boolean} props.clickable - Whether card can be clicked to flip
 * @param {string} props.className - Additional classes to apply to container
 * @param {Object} props.frontStyles - Custom styles for front of card
 * @param {Object} props.backStyles - Custom styles for back of card
 * @param {boolean} props.containMonospaceContent - Whether to apply monospace font
 * @param {string} props.status - 'correct', 'incorrect', or undefined for card status
 */
function CardModule({
    card,
    showBack,
    onFlip,
    size = 'md',
    clickable = true,
    className = '',
    frontStyles = {},
    backStyles = {},
    containMonospaceContent = false,
    status
}) {
    // Updated size classes with more tailwind utility classes for better styling
    const sizeClasses = {
        sm: 'min-h-[10rem] h-full max-h-full text-lg',
        md: 'min-h-[16rem] h-full max-h-full text-xl',
        lg: 'min-h-[20rem] h-full max-h-full text-2xl'
    };

    // Handle content that might be monospaced code or text blocks
    const contentClasses = containMonospaceContent ? 'font-mono text-left whitespace-pre-wrap' : 'font-sans';

    const handleClick = (e) => {
        if (clickable && onFlip) {
            e.stopPropagation(); // Prevent event bubbling
            onFlip();
        }
    };

    // Default gradient styles that can be overridden
    const defaultFrontGradient = "bg-gradient-to-br from-gray-50 to-blue-50/20 dark:from-gray-700 dark:to-blue-900/20";
    const defaultBackGradient = "bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/70 dark:to-gray-800/90";

    // Combine default styles with custom styles
    const frontClasses = `flip-card-front border-2 border-blue-700 dark:border-blue-500 rounded-xl ${frontStyles.gradient || defaultFrontGradient} text-blue-700 dark:text-blue-300 shadow-lg transition-shadow hover:shadow-xl overflow-hidden ${containMonospaceContent ? 'font-mono' : ''}`;
    const backClasses = `flip-card-back border-2 border-blue-700 dark:border-blue-500 rounded-xl ${backStyles.gradient || defaultBackGradient} text-blue-800 dark:text-blue-200 shadow-lg transition-shadow hover:shadow-xl overflow-hidden ${containMonospaceContent ? 'font-mono' : ''}`;

    // Check if card content is a string or a React component
    const renderContent = (content) => {
        if (React.isValidElement(content)) {
            return content;
        }
        return <div className={`card-content-text ${contentClasses} w-full h-full flex items-center justify-center`}>{content}</div>;
    };

    return (
        <div className={`flip-card w-full h-full ${showBack ? 'flipped' : ''} ${className}`} onClick={handleClick}>
            <div className={`flip-card-inner ${sizeClasses[size]} flip-transition`}>
                <div className={frontClasses} style={frontStyles.custom}>
                    <div className="flip-card-content relative h-full">
                        {status && (
                            <div className={`absolute top-2 right-2 z-10 px-3 py-1 rounded-full text-xs font-bold shadow-md status-badge ${status === 'correct'
                                    ? 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100 border-2 border-green-300 dark:border-green-600 status-badge-correct'
                                    : 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-100 border-2 border-red-300 dark:border-red-600 status-badge-incorrect'
                                }`}>
                                {status === 'correct' ? 'Correct' : 'Incorrect'}
                            </div>
                        )}
                        {/* Debug indicator */}
                        {status === undefined && card?.id && (
                            <div className="absolute top-0 left-0 bg-yellow-100 text-yellow-800 text-xs px-1">
                                Missing status
                            </div>
                        )}
                        <div className="w-full h-full text-center break-words py-2 flex items-center justify-center content-display-area">
                            {renderContent(card?.front)}
                        </div>
                        {clickable && <div className="absolute bottom-0 right-0 left-0 w-full flex justify-center text-xs text-gray-600 dark:text-gray-400 bg-white/70 dark:bg-gray-800/70 p-1.5 border-t border-gray-100 dark:border-gray-700">
                            <span className="px-3 py-1 rounded-full bg-white/80 dark:bg-gray-700/80 shadow-sm border border-gray-100 dark:border-gray-600">
                                Click to flip
                            </span>
                        </div>}
                    </div>
                </div>
                <div className={backClasses} style={backStyles.custom}>
                    <div className="flip-card-content relative h-full">
                        {status && (
                            <div className={`absolute top-2 right-2 z-10 px-3 py-1 rounded-full text-xs font-bold shadow-md status-badge ${status === 'correct'
                                    ? 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100 border-2 border-green-300 dark:border-green-600 status-badge-correct'
                                    : 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-100 border-2 border-red-300 dark:border-red-600 status-badge-incorrect'
                                }`}>
                                {status === 'correct' ? 'Correct' : 'Incorrect'}
                            </div>
                        )}
                        {/* Debug indicator */}
                        {status === undefined && card?.id && (
                            <div className="absolute top-0 left-0 bg-yellow-100 text-yellow-800 text-xs px-1">
                                Missing status
                            </div>
                        )}
                        <div className="w-full h-full text-center break-words py-2 flex items-center justify-center content-display-area">
                            {renderContent(card?.back)}
                        </div>
                        {clickable && <div className="absolute bottom-0 right-0 left-0 w-full flex justify-center text-xs text-gray-600 dark:text-gray-400 bg-white/70 dark:bg-gray-800/70 p-1.5 border-t border-gray-100 dark:border-gray-700">
                            <span className="px-3 py-1 rounded-full bg-white/80 dark:bg-gray-700/80 shadow-sm border border-gray-100 dark:border-gray-600">
                                Click to flip
                            </span>
                        </div>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CardModule;


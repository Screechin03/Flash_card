import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import SidebarNav from './SidebarNav';

function Navbar({ user, sets, onLogout, onSelectSet }) {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('All');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(
        localStorage.getItem('darkMode') === 'true' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
    );
    const location = useLocation();

    useEffect(() => {
        // Extract unique subjects from sets (assuming set.title = "Subject: Topic")
        const allSubjects = sets
            ? Array.from(new Set(sets.map(s => (s.title.split(':')[0] || 'General').trim())))
            : [];
        setSubjects(['All', ...allSubjects]);
    }, [sets]);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', isDarkMode);
    }, [isDarkMode]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 lg:px-8 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow z-30">
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="text-gray-600 hover:text-blue-600 transition mr-2 dark:text-gray-300 dark:hover:text-blue-400"
                        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                    >
                        {isSidebarOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                    <span className="text-xl md:text-2xl font-extrabold text-blue-600 tracking-widest dark:text-blue-400">FlashCardPro</span>
                    <Link to="/" className={`ml-2 md:ml-6 text-gray-600 hover:text-blue-600 transition dark:text-gray-300 dark:hover:text-blue-400 ${location.pathname === '/' ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}>Dashboard</Link>
                    <div className="hidden md:block ml-4">
                        <select
                            className="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                            value={selectedSubject}
                            onChange={e => setSelectedSubject(e.target.value)}
                        >
                            {subjects.map(subj => (
                                <option key={subj} value={subj}>{subj}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <button
                        onClick={toggleDarkMode}
                        className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {isDarkMode ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                        )}
                    </button>
                    {user && <span className="text-blue-600 font-semibold dark:text-blue-400 hidden md:inline">{user.username}</span>}
                    {user && <button onClick={onLogout} className="bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700 transition dark:bg-blue-500 dark:hover:bg-blue-600">Logout</button>}
                </div>
            </nav>

            {/* Side navbar for topics/sets */}
            <aside className={`fixed left-0 top-12 h-[calc(100vh-3rem)] ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-md p-4 overflow-y-auto transition-all duration-300 z-10`}>
                <SidebarNav
                    sets={sets}
                    onSelectSet={onSelectSet}
                    activeSetId={location.pathname.split('/').length > 2 ? location.pathname.split('/')[2] : null}
                    activeCardId={location.search ? new URLSearchParams(location.search).get('card') : null}
                />
            </aside>
        </>
    );
}

export default Navbar;

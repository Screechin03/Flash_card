// src/api.js
// Utility for interacting with backend API

// Use environment variable in production, fallback to localhost in development
const API_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : 'http://localhost:3001/api';

export const getToken = () => localStorage.getItem('token');

export const setToken = (token) => localStorage.setItem('token', token);

export const removeToken = () => localStorage.removeItem('token');

const request = async (endpoint, { method = 'GET', body, token, ...custom } = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        credentials: 'include',
        ...(body ? { body: JSON.stringify(body) } : {}),
        ...custom
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API error');
    return data;
};

export const api = {
    // Auth
    register: (body) => request('/auth/register', { method: 'POST', body }),
    login: (body) => request('/auth/login', { method: 'POST', body }),
    getMe: (token) => request('/auth/me', { token }),

    // Flashcard Sets
    getSets: (token) => request('/flashcards/sets', { token }),
    createSet: (body, token) => request('/flashcards/sets', { method: 'POST', body, token }),
    updateSet: (setId, body, token) => request(`/flashcards/sets/${setId}`, { method: 'PUT', body, token }),
    deleteSet: (setId, token) => request(`/flashcards/sets/${setId}`, { method: 'DELETE', token }),
    getSetById: (setId, token) => request(`/flashcards/sets/${setId}`, { token }),

    // Flashcards
    createCard: (setId, body, token) => request(`/flashcards/sets/${setId}/cards`, { method: 'POST', body, token }),
    updateCard: (cardId, body, token) => request(`/flashcards/cards/${cardId}`, { method: 'PUT', body, token }),
    deleteCard: (cardId, token) => request(`/flashcards/cards/${cardId}`, { method: 'DELETE', token }),

    // Study
    getRandomCards: (setId, token) => request(`/flashcards/sets/${setId}/study`, { token }),

    // Analytics
    saveProgress: (setId, cardId, status, token) => request(`/flashcards/analytics/progress`, {
        method: 'POST',
        body: { setId, cardId, status },
        token
    }),
    resetSetProgress: (setId, token) => request(`/flashcards/analytics/reset/${setId}`, {
        method: 'POST',
        token
    }),
    getProgress: (token) => request(`/flashcards/analytics/progress`, { token }),
    getDailyActivity: (token) => request(`/flashcards/analytics/daily`, { token }),
    getTopicProgress: (token) => request(`/flashcards/analytics/topics`, { token }),
    getRecentCards: (token) => request(`/flashcards/analytics/recent`, { token })
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api, getToken } from '../api';

function CreateTopic({ user }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        subject: 'General'
    });
    const [subjects, setSubjects] = useState([
        'Math', 'Science', 'Language', 'History', 'Programming', 'Arts', 'General'
    ]);
    const [customSubject, setCustomSubject] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleAddCustomSubject = () => {
        if (customSubject && !subjects.includes(customSubject)) {
            setSubjects([...subjects, customSubject]);
            setForm(f => ({ ...f, subject: customSubject }));
            setCustomSubject('');
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Format title with subject
            const topicTitle = `${form.subject}: ${form.title}`;

            const res = await api.createSet({
                title: topicTitle,
                description: form.description
            }, getToken());

            navigate(`/sets/${res.set.id}`);
        } catch (err) {
            setError(err.message || 'Failed to create topic');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <Navbar user={user} />
            <div className="ml-64 max-w-7xl mx-auto mt-10 px-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-blue-700 mb-6">Create New Topic</h1>
                    {error && <div className="text-red-500 mb-4 p-3 bg-red-50 rounded border border-red-200">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Subject</label>
                                <select
                                    name="subject"
                                    value={form.subject}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {subjects.map(subject => (
                                        <option key={subject} value={subject}>{subject}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Add Custom Subject</label>
                                <div className="flex">
                                    <input
                                        type="text"
                                        value={customSubject}
                                        onChange={e => setCustomSubject(e.target.value)}
                                        placeholder="Enter custom subject"
                                        className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddCustomSubject}
                                        className="bg-blue-700 text-white p-3 rounded-r-lg hover:bg-blue-800"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Topic Name</label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="E.g. Algebra, JavaScript Basics, Spanish Verbs"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Will be formatted as "{form.subject}: {form.title}"
                            </p>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Brief description of this topic..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="4"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="text-blue-700 hover:underline"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Topic'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateTopic;

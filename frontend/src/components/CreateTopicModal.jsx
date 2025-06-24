import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getToken } from '../api';

function CreateTopicModal({ onTopicCreated, onClose }) {
  const [form, setForm] = useState({ title: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Add subject prefix if not already present
      let topicTitle = form.title;
      if (!topicTitle.includes(':')) {
        topicTitle = `General: ${topicTitle}`;
      }

      const res = await api.createSet({
        title: topicTitle,
        description: form.description
      }, getToken());

      if (onTopicCreated) {
        onTopicCreated(res.set);
      } else {
        navigate(`/sets/${res.set.id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-blue-700">Create New Topic</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition"
            aria-label="Close"
          >
            &times;
          </button>
        )}
      </div>

      {error && <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Topic Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="E.g. Math: Algebra or Programming: JavaScript"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Format as "Subject: Topic" for better organization</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Brief description of this topic..."
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            rows="3"
          />
        </div>
        <div className="flex justify-between">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-blue-700 hover:underline"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Topic'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTopicModal;
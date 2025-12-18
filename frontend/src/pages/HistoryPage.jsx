import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { ClockIcon, LinkIcon, SparklesIcon, ChatBubbleBottomCenterTextIcon, HeartIcon } from '@heroicons/react/24/outline';

const HistoryPage = () => {
    const [searchHistory, setSearchHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSearchHistory = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Not authenticated');
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.get('http://localhost:5000/api/search-history', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setSearchHistory(response.data);
                setIsLoading(false);
            } catch (err) {
                setError('Failed to fetch search history');
                setIsLoading(false);
            }
        };

        fetchSearchHistory();
    }, []);

    if (!localStorage.getItem('isLoggedIn')) {
        return <Navigate to="/login" />;
    }

    const getSentimentColor = (sentiment) => {
        if (sentiment?.toLowerCase().includes('positive')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
        if (sentiment?.toLowerCase().includes('negative')) return 'bg-red-100 text-red-800 border-red-300';
        return 'bg-blue-100 text-blue-800 border-blue-300';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading your search history...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md">
                    <p className="text-red-800 font-semibold text-lg">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 mb-4 shadow-lg">
                        <ClockIcon className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3">
                        Search History
                    </h1>
                    <p className="text-gray-600 text-lg">View all your previous analyses</p>
                </div>

                {searchHistory.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-12 text-center">
                        <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-xl font-medium">No search history found.</p>
                        <p className="text-gray-400 mt-2">Start analyzing products to see your history here!</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                        {searchHistory.map((item, index) => (
                            <div
                                key={index}
                                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                            >
                                {/* Header with URL and Timestamp */}
                                <div className="mb-6 pb-4 border-b border-gray-200">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
                                                <LinkIcon className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-semibold text-gray-500 mb-1">Product URL</h3>
                                                <a
                                                    href={item.searchUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-indigo-600 hover:text-indigo-800 break-all line-clamp-2 font-medium"
                                                >
                                                    {item.searchUrl}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <ClockIcon className="w-4 h-4 mr-1" />
                                        {new Date(item.timestamp).toLocaleString()}
                                    </div>
                                </div>

                                {/* Search Response Data */}
                                {item.searchResponse && (
                                    <div className="space-y-4">
                                        {/* Key Phrases */}
                                        {item.searchResponse.keyphrases?.length > 0 && (
                                            <div>
                                                <div className="flex items-center mb-2">
                                                    <SparklesIcon className="w-4 h-4 text-indigo-600 mr-2" />
                                                    <h4 className="text-sm font-bold text-gray-700">Key Insights</h4>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {item.searchResponse.keyphrases.slice(0, 5).map((phrase, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200"
                                                        >
                                                            {phrase}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Sentiment */}
                                        {item.searchResponse.overall_sentiment && (
                                            <div>
                                                <div className="flex items-center mb-2">
                                                    <HeartIcon className="w-4 h-4 text-indigo-600 mr-2" />
                                                    <h4 className="text-sm font-bold text-gray-700">Sentiment</h4>
                                                </div>
                                                <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold border-2 ${getSentimentColor(item.searchResponse.overall_sentiment)}`}>
                                                    {item.searchResponse.overall_sentiment}
                                                </div>
                                            </div>
                                        )}

                                        {/* Summary */}
                                        {item.searchResponse.summary && (
                                            <div>
                                                <div className="flex items-center mb-2">
                                                    <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-indigo-600 mr-2" />
                                                    <h4 className="text-sm font-bold text-gray-700">Summary</h4>
                                                </div>
                                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                                    {item.searchResponse.summary}
                                                </p>
                                            </div>
                                        )}

                                        {/* Total Reviews */}
                                        {item.searchResponse.total_reviews && (
                                            <div className="pt-3 border-t border-gray-200">
                                                <span className="text-xs text-gray-500">
                                                    {item.searchResponse.total_reviews} reviews analyzed
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;

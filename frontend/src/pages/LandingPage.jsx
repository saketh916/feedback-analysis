import React, { useState } from 'react';
import axios from 'axios';
import { ChartBarIcon, ChatBubbleBottomCenterTextIcon, BoltIcon, SparklesIcon, LinkIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const features = [
  { name: 'Advanced Analytics', description: 'Get deep insights into customer sentiment and key topics.', icon: ChartBarIcon, gradient: 'from-purple-500 to-pink-500' },
  { name: 'Real-time Processing', description: 'Analyze feedback as it comes in, staying ahead of trends.', icon: BoltIcon, gradient: 'from-blue-500 to-cyan-500' },
  { name: 'AI-Powered Summaries', description: 'Generate concise, actionable summaries from complex feedback.', icon: ChatBubbleBottomCenterTextIcon, gradient: 'from-orange-500 to-red-500' },
];

const testimonials = [
  { name: 'Sarah Johnson', role: 'Product Manager at TechCorp', image: '/sarah.jpeg', quote: 'This tool has revolutionized how we handle customer feedback. It is like having a team of analysts working 24/7.' },
  { name: 'Michael Chen', role: 'CEO of E-commerce Solutions', image: '/michael.jpeg', quote: 'The insights we have gained have directly contributed to a 30% increase in customer satisfaction scores.' },
];

export default function LandingPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [reviews, setReviews] = useState([]);
  const [keyphrases, setKeyphrases] = useState([]);
  const [overallSentiment, setOverallSentiment] = useState('');
  const [summary, setSummary] = useState('');
  const [expandedReviews, setExpandedReviews] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setReviews([]);
    setKeyphrases([]);
    setOverallSentiment('');
    setSummary('');

    const userEmail = localStorage.getItem('userEmail');

    try {
      const HF_SPACE_URL = 'http://localhost:8000';
      const API_ENDPOINT = '/scrape';

      const response = await axios.post(`${HF_SPACE_URL}${API_ENDPOINT}`, { productUrl: url });

      await axios.post(
        'http://localhost:5000/api/search-history',
        {
          userEmail,
          searchUrl: url,
          searchResponse: response.data,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      setReviews(response.data.reviews || []);
      setKeyphrases(response.data.keyphrases || []);
      setOverallSentiment(response.data.overall_sentiment || '');
      setSummary(response.data.summary || '');
      setMessage(response.data.message || `Successfully analyzed ${response.data.total_reviews || 0} reviews.`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to analyze reviews. Please try again.';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment?.toLowerCase().includes('positive')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (sentiment?.toLowerCase().includes('negative')) return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold mb-6 shadow-lg">
              <SparklesIcon className="w-5 h-5 mr-2" />
              AI-Powered Feedback Analysis
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-6 leading-tight">
              Unlock Customer Insights
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 font-light">
              Transform customer feedback into actionable intelligence with cutting-edge AI analysis
            </p>
          </div>
        </div>
      </div>

      {/* URL Input Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-16">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <LinkIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="url"
                  id="url"
                  className="w-full pl-12 pr-12 py-4 text-lg rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all bg-white/50 backdrop-blur-sm placeholder-gray-400"
                  placeholder="Paste product URL from Amazon or Flipkart..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                {url && (
                  <button
                    type="button"
                    onClick={() => setUrl('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg min-w-[180px]"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  'Analyze Now'
                )}
              </button>
            </div>
            {message && (
              <div className={`p-4 rounded-xl ${message.includes('Successfully') || message.includes('success') ? 'bg-emerald-50 border-2 border-emerald-200 text-emerald-800' : 'bg-red-50 border-2 border-red-200 text-red-800'}`}>
                <div className="flex items-center">
                  {message.includes('Successfully') || message.includes('success') ? (
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                  ) : null}
                  <span className="font-medium">{message}</span>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Results Section */}
      {(summary || keyphrases?.length > 0 || overallSentiment || reviews?.length > 0) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 space-y-8">
          {/* Summary Card */}
          {summary && (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center">
                <ChatBubbleBottomCenterTextIcon className="w-8 h-8 mr-3 text-indigo-600" />
                Review Summary
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Key Phrases & Sentiment Row */}
          {(keyphrases?.length > 0 || overallSentiment) && (
            <div className="grid md:grid-cols-2 gap-6">
              {keyphrases?.length > 0 && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Key Insights</h2>
                  <div className="flex flex-wrap gap-3">
                    {keyphrases.map((phrase, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {overallSentiment && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Overall Sentiment</h2>
                  <div className={`inline-flex items-center px-6 py-3 rounded-xl text-lg font-bold border-2 ${getSentimentColor(overallSentiment)} shadow-md`}>
                    {overallSentiment}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reviews Grid */}
          {reviews?.length > 0 && (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Analyzed Reviews ({reviews.length})
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {reviews.map((review, index) => {
                  const reviewText = review?.review_text ?? 'No review';
                  const shortText = reviewText.slice(0, 200);
                  const expanded = expandedReviews[index] || false;
                  const rating = review?.rating ?? 0;

                  const toggleExpand = () => {
                    const newExpanded = [...expandedReviews];
                    newExpanded[index] = !newExpanded[index];
                    setExpandedReviews(newExpanded);
                  };

                  return (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1 rounded-lg font-bold text-sm ${
                            rating >= 4 ? 'bg-emerald-100 text-emerald-700' :
                            rating >= 3 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            ⭐ {rating || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">{review?.review_title ?? 'No title'}</h3>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {expanded ? reviewText : shortText}
                        {reviewText.length > 200 && !expanded ? '...' : ''}
                      </p>
                      {reviewText.length > 200 && (
                        <button
                          className="text-indigo-600 font-semibold text-sm hover:text-indigo-800 transition-colors flex items-center"
                          onClick={toggleExpand}
                          type="button"
                        >
                          {expanded ? 'Show Less' : 'Read More'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Features Section */}
      <div id="features" className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to understand your customers at a glance
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-indigo-200">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.gradient} rounded-t-2xl`}></div>
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.name}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-16">
            What Our Customers Say
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all">
                <div className="flex items-center mb-6">
                  <img className="h-16 w-16 rounded-full ring-4 ring-indigo-100 mr-4" src={testimonial.image} alt={testimonial.name} />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{testimonial.name}</h3>
                    <p className="text-indigo-600 font-medium">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

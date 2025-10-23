import React, { useState } from 'react';
import axios from 'axios';
import { ChartBarIcon, ChatBubbleBottomCenterTextIcon, BoltIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const features = [
  { name: 'Advanced Analytics', description: 'Get deep insights into customer sentiment and key topics.', icon: ChartBarIcon },
  { name: 'Real-time Processing', description: 'Analyze feedback as it comes in, staying ahead of trends.', icon: BoltIcon },
  { name: 'AI-Powered Summaries', description: 'Generate concise, actionable summaries from complex feedback.', icon: ChatBubbleBottomCenterTextIcon },
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
      const HF_SPACE_URL = 'https://saketh916-model.hf.space';
      const API_ENDPOINT = '/scrape'; // Or whatever your Flask route is

      const response = await axios.post(`${HF_SPACE_URL}${API_ENDPOINT}`, { productUrl: url });

      await axios.post(
        'https://fdb-node.vercel.app/api/search-history',
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

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Unlock the power of</span>{' '}
                  <span className="block text-indigo-600 xl:inline">customer feedback</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Our AI-powered feedback analysis tool helps you understand your customers better than ever before.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                    >
                      Get started
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <a
                      href="#how-it-works"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
                    >
                      Learn more
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* URL Input Section */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="mt-8 sm:flex relative">
              <label htmlFor="url" className="sr-only">
                Product URL
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  name="url"
                  id="url"
                  className="block w-full py-3 px-3 text-base rounded-md placeholder-gray-500 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 pr-10"
                  placeholder="Enter product URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                {url && (
                  <button
                    type="button"
                    onClick={() => setUrl('')}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-black-400 hover:text-black-800"
                  >
                    X
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="mt-3 w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:flex-shrink-0 sm:inline-flex sm:items-center sm:w-auto"
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Analyze Feedbacks'}
              </button>
            </form>
            {message && <p className="mt-4 text-green-500">{message}</p>}
          </div>
        </div>
      </div>


      {/* Summary */}
      {summary && (
        <div className="bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Review Summary</h2>
            <p className="text-gray-700 text-lg">{summary}</p>
          </div>
        </div>
      )}

      {/* Key Phrases */}
      {keyphrases?.length > 0 && (
        <div className="bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Phrases</h2>
            <div className="flex flex-wrap gap-2">
              {keyphrases.map((phrase, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                >
                  {phrase}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overall Sentiment */}
      {overallSentiment && (
        <div className="bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overall Sentiment</h2>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-lg font-medium bg-indigo-100 text-indigo-800">
              {overallSentiment}
            </span>
          </div>
        </div>
      )}

      {/* Reviews */}
      {reviews?.length > 0 && (
        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Analyzed Reviews</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {reviews.map((review, index) => {
                const reviewText = review?.review_text ?? 'No review';
                const shortText = reviewText.slice(0, 300);
                const expanded = expandedReviews[index] || false;

                const toggleExpand = () => {
                  const newExpanded = [...expandedReviews];
                  newExpanded[index] = !newExpanded[index];
                  setExpandedReviews(newExpanded);
                };

                return (
                  <div key={index} className="bg-gray-50 rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600 mb-2">Rating: {review?.rating ?? 'N/A'}</p>
                    <p className="text-sm font-bold mb-2">{review?.review_title ?? 'No title'}</p>
                    <p className="text-gray-800 mb-2">
                      {expanded ? reviewText : shortText}
                      {reviewText.length > 300 && !expanded ? '...' : ''}
                    </p>
                    {reviewText.length > 300 && (
                      <button
                        className="text-indigo-600 font-medium text-sm hover:underline"
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
        </div>
      )}

      {/* Features Section */}
      <div id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to understand your customers
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform uses cutting-edge AI to analyze and summarize customer feedback, giving you actionable insights.
            </p>
          </div>
          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {features.map((feature) => (
                <div key={feature.name} className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                      <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">What our customers are saying</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="bg-gray-50 rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <img className="h-12 w-12 rounded-full mr-4" src={testimonial.image} alt={testimonial.name} />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{testimonial.name}</h3>
                    <p className="text-indigo-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

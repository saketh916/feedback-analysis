# FeedbackAnalysisUsingGenAI-G228-PS24
# Feedback Analysis Using GenAI

This project provides a full-stack solution for analyzing customer feedback from e-commerce websites. It leverages web scraping to gather reviews and utilizes generative AI and machine learning models to perform sentiment analysis, extract key phrases, and generate concise summaries.

## Features

-   **User Authentication**: Secure registration and login functionality for users.
-   **E-commerce Site Scraping**: Gathers product reviews from Amazon and Flipkart product pages.
-   **Sentiment Analysis**: A PyTorch-based model predicts the sentiment (Positive, Negative, Neutral) for each review.
-   **Overall Sentiment**: Calculates and displays the most common sentiment across all analyzed reviews.
-   **Key Phrase Extraction**: Uses spaCy and BERT embeddings to identify and extract the most relevant noun phrases from reviews.
-   **AI-Powered Summarization**: Employs a Hugging Face language model to generate a coherent and concise summary of the feedback.
-   **Search History**: Users can view a history of their past analyses.
-   **Result Caching**: Caches recent analysis results in MongoDB to provide instant responses for previously searched URLs.

## Architecture

The application is built with a microservices-oriented architecture, comprising three main components:

1.  **Frontend**: A React-based single-page application built with Vite and styled with Tailwind CSS. It serves as the user interface for registration, login, submitting product URLs, and viewing the analysis results and search history.

2.  **Backend (Node.js)**: An Express.js server responsible for user management. It handles user registration and login, issues JWTs for authentication, and manages user search history stored in a MongoDB database.

3.  **ML Service (Python)**: A Flask server that acts as the core analysis engine. When it receives a product URL from the frontend, it:
    *   Checks a MongoDB cache for recent results for that URL.
    *   If not cached, uses Selenium and Undetected Chromedriver to scrape reviews from the live site.
    *   Performs sentiment analysis using a pre-trained PyTorch model.
    *   Extracts key phrases using spaCy and BERT.
    *   Generates a summary via the Hugging Face Inference API.
    *   Returns the complete analysis to the frontend and caches the result.

## Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS, Axios, React Router
-   **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, Bcrypt
-   **Machine Learning/AI**: Python, Flask, PyTorch, Selenium, spaCy, Hugging Face Transformers, Scikit-learn, Pandas

## Setup and Installation

### Prerequisites

-   Node.js and npm
-   Python 3.8+ and pip
-   MongoDB
-   Google Chrome browser

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install
```

Create a `.env` file in the `backend` directory and add your MongoDB connection string:

```env
mongoURI=mongodb://localhost:27017/Feedback_Analysis
```

Run the backend server:

```bash
node server.js
# Server will be running on http://localhost:5005
```

### 2. ML Service Setup

```bash
# Navigate to the ml directory
cd ml

# Install Python dependencies
pip install -r requirements.txt

# Download the spaCy language model
python -m spacy download en_core_web_sm
```

Create a `.env` file in the `ml` directory and add your Hugging Face API token and the summarization model URL:

```env
HF_API_TOKEN=your_hugging_face_api_token
API_URL=https://api-inference.huggingface.co/models/facebook/bart-large-cnn
```

Run the ML service:

```bash
python app.py
# Server will be running on http://localhost:5000
```

### 3. Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
# Application will be available at http://localhost:5173 (or another port if 5173 is in use)
```

## How to Use

1.  Open the application in your browser (e.g., `http://localhost:5173`).
2.  Register for a new account and then log in.
3.  On the home page, enter a product URL from `amazon.in` or `flipkart.com` into the input field.
4.  Click the "Analyze Feedbacks" button.
5.  Wait for the analysis to complete. The results, including a summary, key phrases, and overall sentiment, will be displayed on the page.
6.  Navigate to the "Search History" page from the navbar to view your previous analysis requests.

## License

This project is licensed under the MIT License.

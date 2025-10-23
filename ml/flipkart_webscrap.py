# ---------------------------
# Feedback Analysis API
# ---------------------------

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import warnings
import torch
import torch.nn as nn
import joblib
import pandas as pd
import spacy
import numpy as np
from statistics import mode
from sklearn.metrics.pairwise import cosine_similarity
from transformers import AutoTokenizer, AutoModel
from dotenv import load_dotenv
import requests
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from time import sleep

# ---------------------------
# Load environment variables
# ---------------------------
load_dotenv()
API_TOKEN = os.getenv("HF_API_TOKEN")
API_URL = os.getenv("API_URL")
BACKEND_API_URL = os.getenv("BACKEND_API_URL")

# ---------------------------
# Flask App Setup
# ---------------------------
app = Flask(__name__)
CORS(app)
warnings.filterwarnings("ignore", category=ResourceWarning)

# ---------------------------
# NLP Setup
# ---------------------------
nlp = spacy.load("en_core_web_sm")
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
bert_model = AutoModel.from_pretrained("bert-base-uncased")

headers = {"Authorization": f"Bearer {API_TOKEN}"}

# ---------------------------
# Helper Functions
# ---------------------------

def generate_review_summary(reviews):
    """Generate a summary for a list of reviews using Hugging Face API."""
    try:
        combined_reviews = " ".join(reviews)
        review_word_count = len(combined_reviews.split())
        max_length = min(150, review_word_count // 2)
        min_length = max(40, max_length // 2)

        if len(combined_reviews.split()) > 1024:
            combined_reviews = " ".join(combined_reviews.split()[:1024])

        payload = {
            "inputs": combined_reviews,
            "parameters": {
                "min_length": min_length,
                "max_length": max_length,
                "do_sample": False,
            },
        }

        response = requests.post(API_URL, headers=headers, json=payload)

        if response.status_code == 200:
            return response.json()[0]["summary_text"]
        else:
            return "Unable to create summary"

    except Exception as e:
        print(f"Error generating summary: {str(e)}")
        return "Unable to create summary"


def extract_noun_phrases(text):
    """Extract noun phrases from text using spaCy."""
    doc = nlp(text)
    return [chunk.text for chunk in doc.noun_chunks]


def get_bert_embedding(text):
    """Generate BERT embedding for a given text."""
    inputs = tokenizer(
        text, return_tensors="pt", padding=True, truncation=True, max_length=512
    )
    with torch.no_grad():
        outputs = bert_model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).squeeze().numpy()


def extract_keyphrases(text, top_n=5):
    """Extract top N keyphrases from text using cosine similarity with BERT embeddings."""
    noun_phrases = extract_noun_phrases(text)
    if not noun_phrases:
        return []
    doc_embedding = get_bert_embedding(text)
    phrase_embeddings = [get_bert_embedding(phrase) for phrase in noun_phrases]
    similarities = cosine_similarity([doc_embedding], phrase_embeddings)[0]
    sorted_indices = np.argsort(similarities)[::-1]
    return [noun_phrases[i] for i in sorted_indices[:top_n]]


# ---------------------------
# Sentiment Analysis Model
# ---------------------------
class SentimentModel(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super(SentimentModel, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, output_dim)
        self.relu = nn.ReLU()

    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.fc2(x)
        return x


def load_model(
    model_path="sentiment_model.pth",
    tfidf_path="tfidf_vectorizer.pkl",
    label_encoder_path="label_encoder.pkl",
):
    input_dim = 4140
    hidden_dim = 128
    output_dim = 3
    model = SentimentModel(input_dim, hidden_dim, output_dim)
    model.load_state_dict(
        torch.load(model_path, map_location=torch.device("cpu"), weights_only=True)
    )
    model.eval()
    tfidf_vectorizer = joblib.load(tfidf_path)
    label_encoder = joblib.load(label_encoder_path)
    return model, tfidf_vectorizer, label_encoder


# ---------------------------
# Web Scraping Functions
# ---------------------------
def setup_browser():
    options = uc.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--no-sandbox")
    options.add_argument("--window-size=1920,1080")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    )
    return uc.Chrome(options=options)


def get_reviews_ratings(browser, url):
    """Scrape reviews, ratings, and titles from Flipkart product page."""
    reviews = {"review_text": [], "rating": [], "review_title": []}
    browser.get(url)
    sleep(3)

    try:
        wait = WebDriverWait(browser, 20)

        # Click "All Reviews" if present
        try:
            all_reviews_button = wait.until(
                EC.element_to_be_clickable(
                    (By.XPATH, '//div[@class="_23J90q RcXBOT"]/span[contains(text(),"All")]')
                )
            )
            all_reviews_button.click()
            sleep(3)
        except:
            all_reviews_link = wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "div.col.pPAw9M a"))
            )
            review_url = all_reviews_link.get_attribute("href")
            browser.get(review_url)
            sleep(3)

        for _ in range(2):
            review_elements = browser.find_elements(By.CLASS_NAME, "ZmyHeo")
            for review in review_elements:
                try:
                    review_text = review.find_element(By.CSS_SELECTOR, "div div").text.strip()
                    reviews["review_text"].append(review_text)
                except:
                    continue

            rating_elements = browser.find_elements(By.CLASS_NAME, "XQDdHH")
            for rating in rating_elements:
                try:
                    rating_value = float(rating.text.split()[0])
                    reviews["rating"].append(rating_value)
                except:
                    reviews["rating"].append(None)

            title_elements = browser.find_elements(By.CSS_SELECTOR, "p.z9E0IG")
            for title in title_elements:
                reviews["review_title"].append(title.text.strip())

            try:
                next_button = wait.until(
                    EC.element_to_be_clickable(
                        (By.XPATH, '//a[@class="_9QVEpD"]/span[contains(text(),"Next")]')
                    )
                )
                browser.execute_script("arguments[0].scrollIntoView();", next_button)
                sleep(2)
                next_button.click()
                sleep(3)
            except:
                break

    except Exception as e:
        print(f"Scraping stopped: {e}")

    # Trim lists to the same length
    min_length = min(len(reviews["review_text"]), len(reviews["rating"]), len(reviews["review_title"]))
    for key in reviews:
        reviews[key] = reviews[key][:min_length]

    return reviews


# ---------------------------
# Sentiment Analysis
# ---------------------------
def apply_sentiment_analysis(reviews_df, model, tfidf_vectorizer, label_encoder):
    review_features = tfidf_vectorizer.transform(reviews_df["review_text"])
    review_tensor = torch.tensor(review_features.toarray(), dtype=torch.float32)

    with torch.no_grad():
        predictions = model(review_tensor)
        _, predicted_labels = torch.max(predictions, 1)

    predicted_sentiments = label_encoder.inverse_transform(predicted_labels.numpy())
    reviews_df["predicted_sentiment"] = predicted_sentiments
    overall_sentiment = mode(predicted_sentiments)
    return reviews_df, overall_sentiment


# ---------------------------
# Load ML Model
# ---------------------------
model, tfidf_vectorizer, label_encoder = load_model()


# ---------------------------
# API Route
# ---------------------------
@app.route("/scrape", methods=["POST"])
def scrape():
    data = request.json
    product_url = data.get("productUrl")

    if not product_url:
        return jsonify({"status": "error", "message": "No product URL provided"}), 400

    try:
        browser = setup_browser()
        reviews = get_reviews_ratings(browser, product_url)
        reviews_df = pd.DataFrame(reviews)

        if reviews_df.empty:
            return jsonify(
                {
                    "status": "warning",
                    "message": "No reviews found",
                    "reviews": [],
                    "total_reviews": 0,
                    "overall_sentiment": None,
                    "keyphrases": [],
                    "summary": "",
                }
            )

        # Extract keyphrases and sentiment
        all_reviews_text = " ".join(reviews_df["review_text"].fillna("").tolist())
        keyphrases = extract_keyphrases(all_reviews_text, top_n=10)
        reviews_df["review_text"] = reviews_df["review_text"].fillna("")
        reviews_df = reviews_df[reviews_df["review_text"].str.strip().str.len() > 0]

        reviews_df, overall_sentiment = apply_sentiment_analysis(
            reviews_df, model, tfidf_vectorizer, label_encoder
        )
        results = reviews_df.to_dict(orient="records")

        review_summary = generate_review_summary(reviews_df["review_text"].tolist())

        response_data = {
            "status": "success",
            "reviews": results,
            "total_reviews": len(results),
            "keyphrases": keyphrases,
            "overall_sentiment": str(overall_sentiment),
            "summary": review_summary,
            "message": f"Successfully analyzed {len(results)} reviews",
        }

        return jsonify(response_data)

    except Exception as e:
        return jsonify(
            {
                "status": "error",
                "message": "Failed to process reviews. Please check the URL and try again.",
                "error_details": str(e),
                "overall_sentiment": None,
                "summary": "",
            }
        ), 500

    finally:
        if "browser" in locals():
            browser.quit()


# ---------------------------
# Run Flask App
# ---------------------------
if __name__ == "__main__":
    app.run(debug=True, port=7860)

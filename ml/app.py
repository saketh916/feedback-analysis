from flask import Flask, request, jsonify
import torch
import pandas as pd
import warnings
import time
import numpy as np
from statistics import mode
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import undetected_chromedriver as uc
from selenium.webdriver.chrome.options import Options
from flask_cors import CORS
import spacy
from transformers import AutoTokenizer, AutoModel, pipeline
from sklearn.metrics.pairwise import cosine_similarity
import pymongo
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import traceback

# ----------------------------------------------------------------------------- #
# 🧠  SETUP
# ----------------------------------------------------------------------------- #
load_dotenv()
warnings.filterwarnings("ignore", category=ResourceWarning)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# ----------------------------------------------------------------------------- #
# ⚙️ MongoDB setup
# ----------------------------------------------------------------------------- #
mongo_uri = os.getenv("MONGO_URI","YOUR_URI")
mongo_db = os.getenv("MONGO_DB", "Feedback_Analysis")
mongo_collection = os.getenv("MONGO_COLLECTION", "searchhistories")

mongo_client = pymongo.MongoClient(mongo_uri)
db = mongo_client[mongo_db]
search_history = db[mongo_collection]

# ----------------------------------------------------------------------------- #
# 🧠 Load NLP + Sentiment models once at startup
# ----------------------------------------------------------------------------- #
print("[INFO] Loading SpaCy and HuggingFace models (this may take a while)...")
try:
    nlp = spacy.load("en_core_web_sm")
    tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
    bert_model = AutoModel.from_pretrained("bert-base-uncased")
    sentiment_pipeline = pipeline("sentiment-analysis")
    MODELS_LOADED = True
    print("[INFO] Models loaded successfully ✅")
except Exception as e:
    MODELS_LOADED = False
    print(f"[ERROR] Model loading failed: {e}")

# ----------------------------------------------------------------------------- #
# 🧰 Utility Functions
# ----------------------------------------------------------------------------- #
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

def check_cached_results(product_url):
    """Check MongoDB cache for a URL within the last 30 days."""
    try:
        cached_result = search_history.find_one(
            {"searchUrl": product_url}, sort=[("timestamp", pymongo.DESCENDING)]
        )
        if cached_result:
            cache_time = cached_result["timestamp"]
            if cache_time > datetime.utcnow() - timedelta(days=30):
                return cached_result["searchResponse"]
    except Exception as e:
        print(f"[WARN] Cache check failed: {e}")
    return None


def resolve_redirects(url):
    """Resolve Amazon short links using a tiny headless browser."""
    try:
        if "amzn.in" not in url:
            return url

        print("[INFO] Resolving Amazon short link via headless browser...")

        options = uc.ChromeOptions()
        options.binary_location = CHROME_PATH
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")

        browser = uc.Chrome(
            options=options,
            browser_executable_path=CHROME_PATH
        )

        browser.get(url)
        time.sleep(3)
        resolved_url = browser.current_url
        browser.quit()

        print(f"[INFO] Short link resolved to: {resolved_url}")
        return resolved_url

    except Exception as e:
        print(f"[WARN] Redirect resolution failed: {e}")
        return url


def setup_browser():
    """Configure headless Chrome for scraping."""
    options = uc.ChromeOptions()
    options.binary_location = CHROME_PATH
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--no-sandbox")
    options.add_argument("--window-size=1920,1080")

    return uc.Chrome(
        options=options,
        browser_executable_path=CHROME_PATH
    )


def normalize_reviews(reviews):
    min_len = min(len(reviews["review_text"]), len(reviews["rating"]), len(reviews["review_title"]))
    for key in reviews:
        reviews[key] = reviews[key][:min_len]
    return reviews


def get_amazon_reviews(browser, url):
    reviews = {"review_text": [], "rating": [], "review_title": []}
    browser.get(url)
    time.sleep(3)

    for _ in range(3):
        try:
            review_elements = browser.find_elements(By.CSS_SELECTOR, 'span[data-hook="review-body"]')
            rating_elements = browser.find_elements(By.CLASS_NAME, "review-rating")
            title_elements = browser.find_elements(By.CSS_SELECTOR, 'a[data-hook="review-title"]')

            for review in review_elements:
                reviews["review_text"].append(review.text.strip())

            for rating in rating_elements:
                val = rating.get_attribute("textContent").replace(" out of 5 stars", "")
                try:
                    reviews["rating"].append(float(val))
                except:
                    reviews["rating"].append(None)

            for title in title_elements:
                reviews["review_title"].append(title.text.strip())

        except Exception as e:
            print(f"[WARN] Error while scraping reviews: {e}")
            break

    return normalize_reviews(reviews)


def get_flipkart_reviews(browser, url):
    reviews = {"review_text": [], "rating": [], "review_title": []}
    browser.get(url)
    time.sleep(3)
    wait = WebDriverWait(browser, 15)

    for _ in range(2):
        try:
            review_elements = browser.find_elements(By.CLASS_NAME, "ZmyHeo")
            for review in review_elements:
                reviews["review_text"].append(review.text.strip())

            rating_elements = browser.find_elements(By.CLASS_NAME, "XQDdHH")
            for rating in rating_elements:
                try:
                    reviews["rating"].append(float(rating.text.split()[0]))
                except:
                    reviews["rating"].append(None)

            title_elements = browser.find_elements(By.CSS_SELECTOR, "p.z9E0IG")
            for title in title_elements:
                reviews["review_title"].append(title.text.strip())

            try:
                next_button = wait.until(
                    EC.element_to_be_clickable((By.XPATH, '//a[@class="_9QVEpD"]/span[contains(text(),"Next")]'))
                )
                browser.execute_script("arguments[0].scrollIntoView();", next_button)
                time.sleep(2)
                next_button.click()
                time.sleep(3)
            except:
                break

        except Exception as e:
            print(f"[WARN] Flipkart scraping stopped: {e}")
            break

    return normalize_reviews(reviews)


def get_reviews_ratings(product_url):
    browser = setup_browser()
    try:
        if "amazon" in product_url:
            print(f"[INFO] Launching browser for: {product_url}")
            return get_amazon_reviews(browser, product_url)
        elif "flipkart" in product_url:
            return get_flipkart_reviews(browser, product_url)
        else:
            raise ValueError("Unsupported website. Only Amazon and Flipkart are supported.")
    finally:
        browser.quit()


def extract_keyphrases(text, top_n=5):
    doc = nlp(text)
    noun_phrases = [chunk.text for chunk in doc.noun_chunks]
    if not noun_phrases:
        return []
    doc_emb = get_bert_embedding(text)
    phrase_embs = [get_bert_embedding(phrase) for phrase in noun_phrases]
    sims = cosine_similarity([doc_emb], phrase_embs)[0]
    top_idx = np.argsort(sims)[::-1][:top_n]
    return [noun_phrases[i] for i in top_idx]


def get_bert_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
    with torch.no_grad():
        outputs = bert_model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).squeeze().numpy()


def generate_review_summary(reviews):
    try:
        combined = " ".join(reviews)
        if not combined.strip():
            return ""
        return combined[:400]
    except Exception as e:
        print(f"[WARN] Summary generation failed: {e}")
        return ""


# ----------------------------------------------------------------------------- #
# 🚀 ROUTE
# ----------------------------------------------------------------------------- #
@app.route("/scrape", methods=["POST"])
def scrape():
    try:
        if not MODELS_LOADED:
            return jsonify({"status": "error", "message": "Models are still loading. Try again."}), 503

        data = request.json
        product_url = data.get("productUrl")
        if not product_url:
            return jsonify({"status": "error", "message": "No product URL provided"}), 400

        product_url = resolve_redirects(product_url)
        print(f"[DEBUG] Final resolved URL → {product_url}")

        cached = check_cached_results(product_url)
        if cached:
            return jsonify({"status": "success", "cached": True, **cached})

        reviews = get_reviews_ratings(product_url)
        df = pd.DataFrame(reviews)
        if df.empty:
            return jsonify({"status": "warning", "message": "No reviews found"}), 200

        keyphrases = extract_keyphrases(" ".join(df["review_text"].head(7)), top_n=10)
        summary = generate_review_summary(df["review_text"].head(7).tolist())

        sentiments = [sentiment_pipeline(text[:512])[0]["label"] for text in df["review_text"]]
        df["predicted_sentiment"] = sentiments
        overall_sentiment = mode(sentiments)

        response = {
            "status": "success",
            "total_reviews": len(df),
            "overall_sentiment": overall_sentiment,
            "keyphrases": keyphrases,
            "summary": summary,
            "reviews": df.to_dict(orient="records"),
        }

        search_history.insert_one(
            {"searchUrl": product_url, "searchResponse": response, "timestamp": datetime.utcnow()}
        )
        return jsonify(response)

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"status": "error", "message": str(e)}), 500


# ----------------------------------------------------------------------------- #
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)

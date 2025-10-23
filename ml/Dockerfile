# Use a lightweight Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install Chrome and necessary dependencies (Debian 12+ compatible)
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    wget \
    fonts-liberation \
    libnss3 \
    libxss1 \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgbm-dev \
    libgtk-3-0 \
    libu2f-udev \
    libvulkan1 \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install SpaCy English model
RUN python -m spacy download en_core_web_sm

# ----------------------------------------------------
# CRITICAL FIXES FOR HUGGING FACE SPACES DEPLOYMENT
# ----------------------------------------------------

# 1. Create a non-root user for security
# This is a general best practice for container security.
RUN useradd -m -u 1000 user
USER user

# 2. Fix the PermissionError (Model Loading)
# Setting HF_HOME tells the Hugging Face libraries where to safely cache models
# in a location the new 'user' has write access to, preventing "PermissionError at /.cache".
ENV HF_HOME /app/.cache/huggingface

# ----------------------------------------------------

# Copy application files, model weights, and scripts
# Use --chown to ensure the files belong to the new 'user'
COPY --chown=user:user . .

# Expose Hugging Face Space port
EXPOSE 7860

# Environment variables for Chromium/Chromedriver
# Use the paths set by the apt-get install
ENV CHROME_PATH=/usr/bin/chromium
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver

# Run Flask app on Hugging Face’s default port
CMD ["python", "app.py"]

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

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install SpaCy English model
RUN python -m spacy download en_core_web_sm

# ----------------------------------------------------
# CRITICAL FIXES FOR PERMISSION ERROR
# ----------------------------------------------------

# 1. Create non-root user
RUN useradd -m -u 1000 user

# 2. Set cache environment variable (to the user's home/work directory)
ENV HF_HOME /app/.cache/huggingface

# 3. Explicitly create the cache directory and set ownership to the new 'user'
# This step is the final measure to prevent the PermissionError.
RUN mkdir -p ${HF_HOME} && chown -R user:user ${HF_HOME}

# 4. Switch to the non-root user
USER user
# ----------------------------------------------------

# Copy application files, model weights, and scripts
# Use --chown to ensure the files belong to the non-root 'user'
COPY --chown=user:user . .

# Expose Hugging Face Space port
EXPOSE 7860

# Environment variables for Chromium/Chromedriver
ENV CHROME_PATH=/usr/bin/chromium
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver

# Run Flask app on Hugging Face’s default port
CMD ["python", "app.py"]

# Use a lightweight Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install Chrome + dependencies (Debian 12+ compatible)
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

# Copy app files
COPY . .

# Expose Hugging Face Space port
EXPOSE 7860

# Environment variable for Chromium (needed for undetected_chromedriver)
ENV CHROME_PATH=/usr/bin/chromium
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver

# Run Flask app on Hugging Face’s default port
CMD ["python", "app.py"]

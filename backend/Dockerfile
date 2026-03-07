# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
# Set a default port (Note: You used 7860 in CMD, so we match it here)
ENV PORT=7860

# Set the working directory in the container
WORKDIR /app

# 1. Install basic system tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 3. Install Playwright Browsers AND their System Dependencies
# This command handles 'install' and 'install-deps' automatically
RUN playwright install --with-deps chromium

# 4. Copy the rest of the application code
COPY . .

# Expose the port the app runs on (matching your CMD)
EXPOSE 7860

# Command to run the application
# Using 0.0.0.0 is critical for Docker/Cloud accessibility
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]

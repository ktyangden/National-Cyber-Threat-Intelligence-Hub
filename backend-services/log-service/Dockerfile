FROM python:3.11-slim

# Disable pyc files & buffering
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies only for geoip2 (very lightweight)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libmaxminddb0 \
    libmaxminddb-dev \
    mmdb-bin \
    && rm -rf /var/lib/apt/lists/*

# Pre-copy only requirements to leverage Docker layer caching
COPY requirements.txt .

# Install python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

EXPOSE 8001

CMD ["daphne", "-b", "0.0.0.0", "-p", "8001", "log_service.asgi:application"]

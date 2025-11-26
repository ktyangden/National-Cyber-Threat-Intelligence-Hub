FROM python:3.11-slim

# Prevent Python from buffering
ENV PYTHONUNBUFFERED=1

# Ensure system packages are updated
RUN apt-get update && apt-get install -y \
    build-essential \
    libssl-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# 2. Set Work Directory
WORKDIR /app

# 3. Copy Requirements
COPY requirements.txt /app/

# 4. Install Python Dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy Project Files
COPY . /app/

# 6. Expose Port
EXPOSE 8005

# 7. Run Django Server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8005"]

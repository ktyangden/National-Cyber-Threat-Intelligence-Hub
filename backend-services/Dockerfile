FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (sometimes needed for Python packages)
RUN apt-get update && apt-get install -y gcc libpq-dev

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . .

# Expose Django default port
EXPOSE 8000

# Run the server (Use Gunicorn for production, manage.py for dev)
# CMD ["gunicorn", "myproject.wsgi:application", "--bind", "0.0.0.0:8000"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
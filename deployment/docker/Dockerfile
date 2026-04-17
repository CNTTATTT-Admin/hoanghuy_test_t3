FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY backend/app ./app
COPY ml ./ml
COPY configs ./configs
COPY models ./models

# Set PYTHONPATH so that 'from api.xxx' imports resolve inside /app/app/
ENV PYTHONPATH=/app/app:/app

# Expose port
EXPOSE 8000

# Run app — workdir-relative: app/ contains main.py which uses 'from api...' imports
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

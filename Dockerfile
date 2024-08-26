FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

RUN apt-get update && apt-get install -y \
    libespeak1 \
    portaudio19-dev \
    python3-pyaudio \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir -r requirements.txt

COPY ./app .

CMD ["uvicorn" "main:app" "--host" "0.0.0.0" "--port" "8000"]

FROM python:3.10

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir fastapi uvicorn scikit-learn==1.3.2 pandas joblib numpy


CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# Secure Video Upload and Streaming Application

A secure video upload and streaming application built with React.js, Flask, Apache Kafka, and MySQL.

## Features

- Secure video upload with encryption
- Video streaming using Apache Kafka
- React.js frontend for smooth user experience
- Flask backend API
- MySQL database for metadata storage

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── routes.py
│   │   └── encryption.py
│   ├── uploads/
│   └── requirements.txt
└── frontend/
    └── src/
        └── components/
```

## Setup Instructions

### Backend Setup

1. Create and activate a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up MySQL database:
- Create a new MySQL database
- Update the database configuration in the Flask app

4. Set up Kafka:
- Install and start Apache Kafka
- Create necessary topics

5. Start the Flask server:
```bash
python run.py
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
DATABASE_URL=mysql://user:password@localhost/dbname
SECRET_KEY=your-secret-key
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

## Security Notes

- Videos are encrypted before storage using AES encryption
- Encryption keys are securely managed
- Streaming is handled through secure Kafka topics

## API Documentation

### Video Upload
- POST `/api/videos/upload`
  - Accepts multipart form data with video file
  - Returns video ID and metadata

### Video Streaming
- GET `/api/videos/stream/<video_id>`
  - Streams the decrypted video through Kafka

## License

MIT License

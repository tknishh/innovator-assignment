# Fluently Stream

A modern video streaming platform built with React and Flask, featuring a sleek dark mode interface and secure video handling capabilities.

## Features

- 🎥 Secure video streaming with encryption
- 🌓 Modern dark mode interface
- 📱 Responsive design for all devices
- 🔒 Encrypted video storage
- 📤 Easy video upload functionality
- 📚 Video library management
- 🔄 Automatic retry mechanism for network issues
- 🎮 Custom video player controls
- 🚀 Real-time video buffering status

## Tech Stack

### Frontend
- React.js with TypeScript
- Material UI (MUI) for UI components
- Axios for API communication

### Backend
- Flask (Python)
- SQLAlchemy for database management
- Cryptodome for video encryption
- Flask-CORS for cross-origin handling

## Prerequisites

Before running the application, make sure you have the following installed:
- Node.js (v14 or higher)
- Python 3.8 or higher
- pip (Python package manager)
- MySQL (or your preferred database)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd innovator-assignment
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# For Windows
venv\Scripts\activate
# For macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Update the .env file with your database credentials and other configurations

# Initialize the database
flask db upgrade

# Run the backend server
python run.py
```

The backend server will start at `http://localhost:5001`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend application will start at `http://localhost:3000`

## Environment Variables

### Backend (.env)
```
DATABASE_URL=mysql://user:password@localhost/dbname
SECRET_KEY=your-secret-key
UPLOAD_FOLDER=uploads
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5001
```

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── routes.py
│   │   ├── models.py
│   │   └── encryption.py
│   ├── uploads/
│   ├── requirements.txt
│   └── run.py
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── App.tsx
    │   └── index.tsx
    ├── package.json
    └── tsconfig.json
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Use the sidebar to navigate between video list and upload sections
3. Upload videos using the upload section
4. View and manage your videos in the video list section
5. Click on any video to start streaming

## Security Features

- Video files are encrypted at rest
- Secure streaming with chunk-based decryption
- Frontend-backend communication over HTTPS
- Protected API endpoints

## Error Handling

The application includes robust error handling for:
- Network issues
- Video decoding problems
- File format incompatibilities
- Server connection errors

## Performance Optimizations

- Chunk-based video streaming
- Automatic quality adjustment
- Efficient caching mechanisms
- Optimized video buffering

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Authored by [@tknishh](https://www.github.com/tknishh)

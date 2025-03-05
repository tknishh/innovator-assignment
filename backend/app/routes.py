from flask import request, jsonify, send_file, Response, stream_with_context
from app import app, db
from app.models import Video
from app.encryption import VideoEncryption
from werkzeug.utils import secure_filename
import os
import magic
from kafka import KafkaProducer, KafkaConsumer
import json
import threading
import time
import base64
import io
import logging
import re

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Configure Kafka
KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
KAFKA_TOPIC = 'video-stream'

# Initialize Kafka producer
producer = KafkaProducer(
    bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

def allowed_file(filename):
    """Check if the file extension is allowed"""
    ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/videos/upload', methods=['POST'])
def upload_video():
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400

    video_file = request.files['video']
    if video_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if not allowed_file(video_file.filename):
        return jsonify({'error': 'File type not allowed'}), 400

    try:
        # Generate secure filename and save temporarily
        original_filename = secure_filename(video_file.filename)
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], 'temp_' + original_filename)
        video_file.save(temp_path)

        # Generate encryption key and IV
        key, iv = VideoEncryption.generate_key()

        # Create encrypted filename
        encrypted_filename = f"encrypted_{int(time.time())}_{original_filename}"
        encrypted_path = os.path.join(app.config['UPLOAD_FOLDER'], encrypted_filename)

        # Encrypt video
        VideoEncryption.encrypt_video(temp_path, encrypted_path, key, iv)

        # Get file metadata
        file_size = os.path.getsize(encrypted_path)
        mime = magic.Magic(mime=True)
        content_type = mime.from_file(temp_path)

        # Create database entry
        video = Video(
            filename=encrypted_filename,
            original_filename=original_filename,
            encryption_key=key,
            iv=iv,
            content_type=content_type,
            file_size=file_size,
            status='ready'
        )
        db.session.add(video)
        db.session.commit()

        # Clean up temporary file
        os.remove(temp_path)

        return jsonify({
            'message': 'Video uploaded successfully',
            'video': video.to_dict()
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/videos/<int:video_id>', methods=['DELETE'])
def delete_video(video_id):
    try:
        video = Video.query.get_or_404(video_id)
        
        # Delete the encrypted file
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], video.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Delete database entry
        db.session.delete(video)
        db.session.commit()
        
        return jsonify({'message': 'Video deleted successfully'}), 200
    except Exception as e:
        logger.error(f"Error deleting video: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/videos/stream/<int:video_id>')
def stream_video(video_id):
    try:
        video = Video.query.get_or_404(video_id)
        
        if video.status != 'ready':
            return jsonify({'error': 'Video is not ready for streaming'}), 400

        video_path = os.path.join(app.config['UPLOAD_FOLDER'], video.filename)
        logger.debug(f"Streaming video: {video.original_filename}, path: {video_path}")
        logger.debug(f"Content type: {video.content_type}")
        
        if not os.path.exists(video_path):
            logger.error(f"Video file not found: {video_path}")
            return jsonify({'error': 'Video file not found'}), 404

        file_size = os.path.getsize(video_path)
        chunk_size = 1024 * 1024  # 1MB chunks

        # Handle range request
        range_header = request.headers.get('Range')
        
        if range_header:
            logger.debug(f"Range header received: {range_header}")
            byte1, byte2 = 0, None
            match = re.search('bytes=(\d+)-(\d*)', range_header)
            if match:
                groups = match.groups()
                if groups[0]:
                    byte1 = int(groups[0])
                if groups[1]:
                    byte2 = int(groups[1])
            
            if byte2 is None:
                byte2 = file_size - 1
            
            length = byte2 - byte1 + 1
            logger.debug(f"Serving bytes {byte1}-{byte2}/{file_size}")

            def generate_range():
                try:
                    with open(video_path, 'rb') as file:
                        file.seek(byte1)
                        remaining = length
                        while remaining > 0:
                            chunk_size_to_read = min(chunk_size, remaining)
                            chunk = file.read(chunk_size_to_read)
                            if not chunk:
                                break
                            try:
                                decrypted_chunk = VideoEncryption.decrypt_chunk(
                                    chunk, 
                                    video.encryption_key, 
                                    video.iv, 
                                    byte1 // chunk_size
                                )
                                if decrypted_chunk:
                                    yield decrypted_chunk
                            except Exception as e:
                                logger.error(f"Error decrypting chunk: {str(e)}")
                                break
                            remaining -= len(chunk)
                except Exception as e:
                    logger.error(f"Error reading file: {str(e)}")
                    return

            headers = {
                'Content-Type': video.content_type,
                'Accept-Ranges': 'bytes',
                'Content-Range': f'bytes {byte1}-{byte2}/{file_size}',
                'Content-Length': str(length),
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Range',
                'Access-Control-Expose-Headers': 'Content-Range, Content-Length'
            }
            
            logger.debug(f"Sending response with headers: {headers}")
            return Response(
                generate_range(),
                206,
                headers=headers,
                direct_passthrough=True
            )
        
        # Full file request
        def generate_full():
            try:
                with open(video_path, 'rb') as file:
                    chunk_number = 0
                    while True:
                        chunk = file.read(chunk_size)
                        if not chunk:
                            break
                        try:
                            decrypted_chunk = VideoEncryption.decrypt_chunk(
                                chunk,
                                video.encryption_key,
                                video.iv,
                                chunk_number
                            )
                            if decrypted_chunk:
                                yield decrypted_chunk
                        except Exception as e:
                            logger.error(f"Error decrypting chunk: {str(e)}")
                            break
                        chunk_number += 1
            except Exception as e:
                logger.error(f"Error reading file: {str(e)}")
                return

        headers = {
            'Content-Type': video.content_type,
            'Accept-Ranges': 'bytes',
            'Content-Length': str(file_size),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Range',
            'Access-Control-Expose-Headers': 'Content-Range, Content-Length'
        }
        
        logger.debug(f"Sending full file response with headers: {headers}")
        return Response(
            generate_full(),
            200,
            headers=headers,
            direct_passthrough=True
        )

    except Exception as e:
        logger.error(f"Error streaming video: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/videos/stream/<int:video_id>/events')
def stream_events(video_id):
    def event_stream():
        consumer = KafkaConsumer(
            KAFKA_TOPIC,
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            value_deserializer=lambda v: json.loads(v.decode('utf-8')),
            auto_offset_reset='latest',
            enable_auto_commit=True
        )

        try:
            for message in consumer:
                data = message.value
                if data['video_id'] == video_id:
                    yield f"data: {json.dumps(data)}\n\n"
        finally:
            consumer.close()

    return Response(
        stream_with_context(event_stream()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        }
    )

@app.route('/api/videos', methods=['GET'])
def list_videos():
    videos = Video.query.all()
    return jsonify({
        'videos': [video.to_dict() for video in videos]
    }), 200

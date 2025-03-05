from app import db
from datetime import datetime

class Video(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    encryption_key = db.Column(db.String(255), nullable=False)  # Stored securely
    iv = db.Column(db.String(255), nullable=False)  # Initialization vector for encryption
    content_type = db.Column(db.String(100), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='processing')  # processing, ready, error

    def to_dict(self):
        return {
            'id': self.id,
            'original_filename': self.original_filename,
            'content_type': self.content_type,
            'file_size': self.file_size,
            'upload_date': self.upload_date.isoformat(),
            'status': self.status
        }

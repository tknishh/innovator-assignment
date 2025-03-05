from Cryptodome.Cipher import AES
from Cryptodome.Random import get_random_bytes
import base64
import os

class VideoEncryption:
    @staticmethod
    def generate_key():
        """Generate a random encryption key and IV"""
        key = get_random_bytes(32)  # 256-bit key
        iv = get_random_bytes(16)   # 128-bit IV
        return base64.b64encode(key).decode('utf-8'), base64.b64encode(iv).decode('utf-8')

    @staticmethod
    def encrypt_video(input_path, output_path, key, iv):
        """Encrypt a video file using AES-256-CBC"""
        key = base64.b64decode(key)
        iv = base64.b64decode(iv)
        
        cipher = AES.new(key, AES.MODE_CBC, iv)
        
        # Read file in chunks to handle large files
        chunk_size = 64 * 1024  # 64KB chunks
        
        with open(input_path, 'rb') as infile, open(output_path, 'wb') as outfile:
            while True:
                chunk = infile.read(chunk_size)
                if len(chunk) == 0:
                    break
                elif len(chunk) % 16 != 0:
                    # Pad the last chunk if necessary
                    chunk += b' ' * (16 - (len(chunk) % 16))
                
                encrypted_chunk = cipher.encrypt(chunk)
                outfile.write(encrypted_chunk)

    @staticmethod
    def decrypt_chunk(chunk, key, iv, chunk_number=0):
        """Decrypt a chunk of video data"""
        key = base64.b64decode(key)
        iv = base64.b64decode(iv)
        
        # For CBC mode, we need to calculate the IV for each chunk
        current_iv = bytes(x ^ y for x, y in zip(iv, chunk_number.to_bytes(16, 'big')))
        cipher = AES.new(key, AES.MODE_CBC, current_iv)
        
        try:
            decrypted_chunk = cipher.decrypt(chunk)
            return decrypted_chunk
        except Exception as e:
            print(f"Error decrypting chunk: {e}")
            return None

    @staticmethod
    def get_chunk_size():
        """Return the chunk size used for encryption/decryption"""
        return 64 * 1024  # 64KB chunks

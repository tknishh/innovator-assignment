import React, { useState, useRef } from 'react';
import {
    Box,
    Button,
    Typography,
    LinearProgress,
    Alert,
    IconButton,
    Card,
    CardContent,
    styled,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

interface VideoUploadProps {
    onUploadSuccess: () => void;
}

const VisuallyHiddenInput = styled('input')`
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    bottom: 0;
    left: 0;
    white-space: nowrap;
    width: 1px;
`;

const VideoUpload: React.FC<VideoUploadProps> = ({ onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
            setSuccess(false);
            setUploadProgress(0);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a video file first');
            return;
        }

        const formData = new FormData();
        formData.append('video', selectedFile);

        try {
            setUploading(true);
            setError(null);
            setSuccess(false);

            await axios.post('http://localhost:5001/api/videos/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = progressEvent.total
                        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        : 0;
                    setUploadProgress(progress);
                },
            });

            setSuccess(true);
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            onUploadSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to upload video');
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        setError(null);
        setSuccess(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Card elevation={3}>
                <CardContent>
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        p: 3,
                        textAlign: 'center',
                        border: '2px dashed',
                        borderColor: 'grey.300',
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                        mb: 3
                    }}>
                        <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Upload Video
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Supported formats: MP4, AVI, MOV, MKV
                        </Typography>
                        <Button
                            component="label"
                            variant="contained"
                            startIcon={<CloudUploadIcon />}
                            disabled={uploading}
                        >
                            Select Video
                            <VisuallyHiddenInput
                                ref={fileInputRef}
                                type="file"
                                accept=".mp4,.avi,.mov,.mkv"
                                onChange={handleFileSelect}
                            />
                        </Button>
                    </Box>

                    {selectedFile && (
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                mb: 1
                            }}>
                                <Typography variant="body2">
                                    Selected file: {selectedFile.name}
                                </Typography>
                                <IconButton 
                                    size="small" 
                                    onClick={handleClearFile}
                                    disabled={uploading}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleUpload}
                                disabled={uploading}
                                fullWidth
                                sx={{ mt: 2 }}
                            >
                                {uploading ? 'Uploading...' : 'Upload Video'}
                            </Button>
                        </Box>
                    )}

                    {uploading && (
                        <Box sx={{ mt: 2 }}>
                            <LinearProgress 
                                variant="determinate" 
                                value={uploadProgress} 
                                sx={{ height: 8, borderRadius: 1 }}
                            />
                            <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                align="center"
                                sx={{ mt: 1 }}
                            >
                                {uploadProgress}% Uploaded
                            </Typography>
                        </Box>
                    )}

                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ mt: 2 }}
                            action={
                                <IconButton
                                    aria-label="close"
                                    color="inherit"
                                    size="small"
                                    onClick={() => setError(null)}
                                >
                                    <CloseIcon fontSize="inherit" />
                                </IconButton>
                            }
                        >
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert 
                            icon={<CheckCircleIcon fontSize="inherit" />}
                            severity="success" 
                            sx={{ mt: 2 }}
                        >
                            Video uploaded successfully!
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default VideoUpload; 
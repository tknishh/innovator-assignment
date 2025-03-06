import React, { useRef, useState } from 'react';
import {
    Box,
    Button,
    Typography,
    LinearProgress,
    Alert,
    IconButton,
    Card,
    styled,
    CircularProgress,
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Close as CloseIcon,
    PlayCircleOutline as PlayCircleOutlineIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface VideoUploadProps {
    onUploadSuccess: () => void;
}

const UploadBox = styled(Box)(({ theme }) => ({
    border: `2px dashed ${theme.palette.primary.main}`,
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(4),
    textAlign: 'center',
    backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(30, 30, 30, 0.6)'
        : 'rgba(33, 150, 243, 0.04)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
        backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(30, 30, 30, 0.8)'
            : 'rgba(33, 150, 243, 0.08)',
        borderColor: theme.palette.primary.light,
    }
}));

const PreviewCard = styled(Card)(({ theme }) => ({
    position: 'relative',
    marginTop: theme.spacing(2),
    backgroundColor: theme.palette.mode === 'dark'
        ? 'rgba(30, 30, 30, 0.6)'
        : 'rgba(0, 0, 0, 0.03)',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
}));

const VideoUpload: React.FC<VideoUploadProps> = ({ onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (!file) return;
        
        const allowedTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-matroska'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please select a valid video file (MP4, AVI, MOV, or MKV)');
            return;
        }

        setSelectedFile(file);
        setError(null);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
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
            setUploadProgress(0);
        }
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        setError(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
            <input
                ref={fileInputRef}
                type="file"
                accept=".mp4,.avi,.mov,.mkv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            {!selectedFile ? (
                <UploadBox
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                        transform: dragActive ? 'scale(1.02)' : 'scale(1)',
                        borderColor: dragActive ? 'primary.main' : 'inherit'
                    }}
                >
                    <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        Drag and drop your video here
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                        or click to select a file
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        Supported formats: MP4, AVI, MOV, MKV
                    </Typography>
                </UploadBox>
            ) : (
                <PreviewCard>
                    <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <PlayCircleOutlineIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="subtitle1" sx={{ flex: 1 }}>
                                {selectedFile.name}
                            </Typography>
                            <IconButton 
                                size="small" 
                                onClick={handleClearFile}
                                sx={{ ml: 1 }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        
                        {uploading && (
                            <Box sx={{ width: '100%', mt: 2 }}>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={uploadProgress} 
                                    sx={{ height: 8, borderRadius: 4 }}
                                />
                                <Typography 
                                    variant="body2" 
                                    color="textSecondary" 
                                    align="center"
                                    sx={{ mt: 1 }}
                                >
                                    Uploading... {uploadProgress}%
                                </Typography>
                            </Box>
                        )}

                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={handleUpload}
                            disabled={uploading}
                            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                            sx={{ mt: 2 }}
                        >
                            {uploading ? 'Uploading...' : 'Upload Video'}
                        </Button>
                    </Box>
                </PreviewCard>
            )}

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}
        </Box>
    );
};

export default VideoUpload; 
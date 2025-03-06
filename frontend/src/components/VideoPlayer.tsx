import React, { useEffect, useRef, useState } from 'react';
import { 
    Box, 
    Typography, 
    CircularProgress,
    Alert,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

interface VideoPlayerProps {
    videoId: number;
    onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, onClose }) => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [videoInfo, setVideoInfo] = useState<any>(null);
    const [isBuffering, setIsBuffering] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const retryTimeoutRef = useRef<number | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 3;

    useEffect(() => {
        setLoading(true);
        setError(null);
        setRetryCount(0);
        setIsBuffering(true);
        
        // Fetch video information
        axios.get(`http://localhost:5001/api/videos`)
            .then(response => {
                const video = response.data.videos.find((v: any) => v.id === videoId);
                if (video) {
                    setVideoInfo(video);
                    console.log('Video info:', video);
                }
            })
            .catch(err => {
                console.error('Error fetching video info:', err);
                setError('Error fetching video information');
            });

        // Cleanup function
        return () => {
            if (retryTimeoutRef.current) {
                window.clearTimeout(retryTimeoutRef.current);
            }
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.src = '';
                videoRef.current.load();
            }
        };
    }, [videoId]);

    const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        const video = e.target as HTMLVideoElement;
        let errorMessage = 'Error playing video: ';
        
        if (video.error) {
            console.error('Video element error:', video.error);
            switch (video.error.code) {
                case 1:
                    errorMessage += 'The video loading was aborted';
                    break;
                case 2:
                    errorMessage += 'Network error occurred while loading the video';
                    if (retryCount < MAX_RETRIES) {
                        retryTimeoutRef.current = window.setTimeout(() => {
                            retryPlayback();
                        }, 1000);
                        return;
                    }
                    break;
                case 3:
                    errorMessage += 'Error decoding video';
                    break;
                case 4:
                    errorMessage += 'Video format not supported';
                    break;
                default:
                    errorMessage += video.error.message;
            }
        } else {
            errorMessage += 'Unknown error occurred';
        }
        
        console.error('Video Error:', errorMessage);
        setError(errorMessage);
        setLoading(false);
        setIsBuffering(false);
    };

    const handleLoadStart = () => {
        console.log('Video load started');
        setLoading(true);
        setIsBuffering(true);
        setError(null);
    };

    const handleCanPlay = () => {
        console.log('Video can play');
        setLoading(false);
        setIsBuffering(false);
        setError(null);
        setRetryCount(0);
    };

    const handleWaiting = () => {
        console.log('Video is buffering');
        setIsBuffering(true);
    };

    const handlePlaying = () => {
        console.log('Video is playing');
        setIsBuffering(false);
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            console.log('Video metadata loaded:', {
                duration: videoRef.current.duration,
                videoWidth: videoRef.current.videoWidth,
                videoHeight: videoRef.current.videoHeight
            });
            setLoading(false);
        }
    };

    const retryPlayback = () => {
        if (videoRef.current && retryCount < MAX_RETRIES) {
            setError(null);
            setRetryCount(prev => prev + 1);
            console.log(`Retrying playback (attempt ${retryCount + 1}/${MAX_RETRIES})`);
            
            // Clear the video source and reload
            videoRef.current.src = '';
            videoRef.current.load();
            
            // Set new source with cache buster
            const timestamp = new Date().getTime();
            videoRef.current.src = `http://localhost:5001/api/videos/stream/${videoId}?t=${timestamp}`;
            
            videoRef.current.play().catch(err => {
                console.error('Error on retry:', err);
                setError('Failed to play video on retry');
            });
        } else {
            setError('Maximum retry attempts reached. Please try again later.');
        }
    };

    return (
        <Dialog
            open={true}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle sx={{ 
                m: 0, 
                p: 2, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
            }}>
                <Typography variant="h6" component="div">
                    {videoInfo?.original_filename || 'Video Player'}
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0, bgcolor: 'black' }}>
                <Box sx={{ width: '100%', position: 'relative' }}>
                    <video
                        ref={videoRef}
                        controls
                        style={{ width: '100%', maxHeight: '70vh' }}
                        playsInline
                        onError={handleError}
                        onLoadStart={handleLoadStart}
                        onCanPlay={handleCanPlay}
                        onWaiting={handleWaiting}
                        onPlaying={handlePlaying}
                        onLoadedMetadata={handleLoadedMetadata}
                        preload="auto"
                        src={`http://localhost:5001/api/videos/stream/${videoId}`}
                    >
                        Your browser does not support the video tag.
                    </video>
                    {(loading || isBuffering) && (
                        <Box sx={{ 
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                            p: 3,
                            borderRadius: 2
                        }}>
                            <CircularProgress />
                            <Typography color="white">
                                {loading ? 'Loading video...' : 'Buffering...'}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </DialogContent>

            {error && (
                <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', p: 2 }}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={onClose}>
                            Close
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={retryPlayback}
                        >
                            Retry Playback
                        </Button>
                    </Box>
                </DialogActions>
            )}
        </Dialog>
    );
};

export default VideoPlayer; 
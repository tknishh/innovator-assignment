import React, { useEffect, useState } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    Alert,
    CardActionArea,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import axios from 'axios';

interface Video {
    id: number;
    original_filename: string;
    content_type: string;
    file_size: number;
    created_at: string;
    status: string;
}

interface VideoListProps {
    refreshTrigger: number;
    onVideoSelect: (videoId: number) => void;
}

const VideoList: React.FC<VideoListProps> = ({ refreshTrigger, onVideoSelect }) => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('http://localhost:5001/api/videos');
            setVideos(response.data.videos);
        } catch (err) {
            setError('Failed to fetch videos');
            console.error('Error fetching videos:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, [refreshTrigger]);

    const handleDeleteClick = (video: Video, event: React.MouseEvent) => {
        event.stopPropagation();
        setSelectedVideo(video);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedVideo) return;

        try {
            await axios.delete(`http://localhost:5001/api/videos/${selectedVideo.id}`);
            setDeleteDialogOpen(false);
            setSelectedVideo(null);
            fetchVideos();
        } catch (err) {
            console.error('Error deleting video:', err);
            setError('Failed to delete video');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <>
            <Grid container spacing={3}>
                {videos.map((video) => (
                    <Grid item xs={12} sm={6} md={4} key={video.id}>
                        <Card 
                            sx={{ 
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4
                                }
                            }}
                        >
                            <CardActionArea onClick={() => onVideoSelect(video.id)}>
                                <CardMedia
                                    component="div"
                                    sx={{
                                        height: 140,
                                        bgcolor: 'grey.200',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <PlayArrowIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                                </CardMedia>
                                <CardContent>
                                    <Typography gutterBottom variant="h6" component="div" noWrap>
                                        {video.original_filename}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Size: {formatFileSize(video.file_size)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Uploaded: {formatDate(video.created_at)}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                            <Box sx={{ p: 1, mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                                <IconButton
                                    onClick={(e) => handleDeleteClick(video, e)}
                                    color="error"
                                    size="small"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete "{selectedVideo?.original_filename}"?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {videos.length === 0 && (
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    p: 4,
                    textAlign: 'center'
                }}>
                    <VideoLibraryIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        No videos uploaded yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Upload your first video to get started
                    </Typography>
                </Box>
            )}
        </>
    );
};

export default VideoList; 
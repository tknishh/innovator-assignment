import React, { useState } from 'react';
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  VideoLibrary as VideoLibraryIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import VideoList from './components/VideoList';
import VideoUpload from './components/VideoUpload';
import VideoPlayer from './components/VideoPlayer';

const drawerWidth = 240;

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1976d2',
          color: '#fff',
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#fff',
        },
      },
    },
  },
});

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentView, setCurrentView] = useState<'list' | 'upload'>('list');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('list');
  };

  const handleVideoSelect = (videoId: number) => {
    setSelectedVideo(videoId);
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" color="inherit">
          Video Stream
        </Typography>
      </Toolbar>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
      <List>
        <ListItemButton
          onClick={() => setCurrentView('list')}
          selected={currentView === 'list'}
          sx={{
            '&.Mui-selected': {
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
              },
            },
          }}
        >
          <ListItemIcon>
            <VideoLibraryIcon />
          </ListItemIcon>
          <ListItemText primary="My Videos" />
        </ListItemButton>
        <ListItemButton
          onClick={() => setCurrentView('upload')}
          selected={currentView === 'upload'}
          sx={{
            '&.Mui-selected': {
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
              },
            },
          }}
        >
          <ListItemIcon>
            <CloudUploadIcon />
          </ListItemIcon>
          <ListItemText primary="Upload Video" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
            bgcolor: 'white',
            color: 'text.primary',
            boxShadow: 'none',
            borderBottom: '1px solid rgba(0,0,0,0.12)',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              {currentView === 'list' ? 'My Videos' : 'Upload New Video'}
            </Typography>
          </Toolbar>
        </AppBar>

        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            bgcolor: 'background.default',
            minHeight: '100vh',
          }}
        >
          <Toolbar />
          
          {selectedVideo && (
            <VideoPlayer 
              videoId={selectedVideo} 
              onClose={() => setSelectedVideo(null)}
            />
          )}

          {currentView === 'list' ? (
            <VideoList
              refreshTrigger={refreshTrigger}
              onVideoSelect={handleVideoSelect}
            />
          ) : (
            <VideoUpload onUploadSuccess={handleUploadSuccess} />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;

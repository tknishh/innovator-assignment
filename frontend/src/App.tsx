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
  Stream as StreamIcon,
} from '@mui/icons-material';
import VideoList from './components/VideoList';
import VideoUpload from './components/VideoUpload';
import VideoPlayer from './components/VideoPlayer';

const drawerWidth = 240;

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#e3f2fd',
      dark: '#42a5f5',
    },
    secondary: {
      main: '#ce93d8',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#fff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
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
          backgroundColor: '#1e1e1e',
          borderRight: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(144, 202, 249, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(144, 202, 249, 0.16)',
            '&:hover': {
              backgroundColor: 'rgba(144, 202, 249, 0.24)',
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#90caf9',
          minWidth: 40,
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: '#fff',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#90caf9',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          borderRadius: 8,
          border: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e1e1e',
          borderRadius: 8,
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
        <StreamIcon sx={{ mr: 1.5, fontSize: 28 }} />
        <Typography variant="h6" noWrap component="div">
          Fluently Stream
        </Typography>
      </Toolbar>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
      <List>
        <ListItemButton
          onClick={() => setCurrentView('list')}
          selected={currentView === 'list'}
        >
          <ListItemIcon>
            <VideoLibraryIcon />
          </ListItemIcon>
          <ListItemText primary="My Videos" />
        </ListItemButton>
        <ListItemButton
          onClick={() => setCurrentView('upload')}
          selected={currentView === 'upload'}
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
            <StreamIcon sx={{ mr: 1.5, display: { xs: 'none', sm: 'block' } }} />
            <Typography variant="h6" noWrap component="div">
              Fluently Stream
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

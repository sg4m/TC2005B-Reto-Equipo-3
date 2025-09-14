import React, { useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Card, 
  CardContent, 
  TextField, 
  InputAdornment,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Popper,
  Paper,
  ClickAwayListener,
  Fade,
  Divider,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  AccountCircle as AccountCircleIcon,
  Notifications as NotificationsIcon,
  AttachFile as AttachFileIcon,
  Send as SendIcon,
  Dashboard as DashboardIcon,
  Rule as RuleIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
  History as HistoryIcon,
  Circle as CircleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  ExitToApp as ExitToAppIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { useNavigation } from '../hooks/useNavigation';

const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true); // Desktop sidebar toggle state
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [promptText, setPromptText] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { goToLogin } = useNavigation();
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  const drawerWidth = 240;

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopSidebarOpen(!desktopSidebarOpen);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, active: true },
    { text: 'Reglas', icon: <RuleIcon />, active: false },
    { text: 'Simulador', icon: <PsychologyIcon />, active: false },
    { text: 'Reportes', icon: <AssessmentIcon />, active: false },
    { text: 'Historial', icon: <HistoryIcon />, active: false },
  ];

  const handleMenuItemClick = (itemText) => {
    setActiveSection(itemText);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handlePromptSubmit = () => {
    if (promptText.trim()) {
      console.log('Prompt submitted:', promptText);
      // Here you would handle the business rule generation
      setPromptText('');
    }
  };

  const handleNotificationsToggle = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const handleNotificationsClose = () => {
    setNotificationsOpen(false);
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    // Add any logout logic here (clear session, tokens, etc.)
    goToLogin();
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleProfileToggle = () => {
    setProfileOpen(!profileOpen);
  };

  const handleProfileClose = () => {
    setProfileOpen(false);
  };

  // Sample user data
  const userData = {
    name: 'Santiago Gamborino',
    email: 'santiago.gamborino@banorte.com',
    lastLogin: '12 Sep 2025, 09:30 AM',
    userId: 'USR001234'
  };

  // Sample notifications data
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Regla Creada',
      message: 'Se creó la Regla 08320492 exitosamente',
      time: '2 min ago',
      read: false
    },
    {
      id: 2,
      type: 'info',
      title: 'Simulación Completada',
      message: 'La simulación del sistema de pagos ha terminado',
      time: '15 min ago',
      read: false
    },
    {
      id: 3,
      type: 'warning',
      title: 'Mantenimiento Programado',
      message: 'El sistema estará en mantenimiento mañana de 2:00 AM a 4:00 AM',
      time: '1 hour ago',
      read: true
    },
    {
      id: 4,
      type: 'error',
      title: 'Error de Validación',
      message: 'La regla 08320491 falló en la validación',
      time: '2 hours ago',
      read: true
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: '16px' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: '#FF9800', fontSize: '16px' }} />;
      case 'error':
        return <CircleIcon sx={{ color: '#F44336', fontSize: '16px' }} />;
      case 'info':
      default:
        return <InfoIcon sx={{ color: '#2196F3', fontSize: '16px' }} />;
    }
  };

  // Header component
  const AppHeader = () => (
    <Box sx={{ 
      backgroundImage: 'url(/src/assets/HeaderBanorte.svg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      width: '100%',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1201,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* Left side with hamburger and logo */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          sx={{ 
            mr: 2,
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)'
            }
          }}
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setActiveSection('Dashboard')}>
          <img 
            src="/src/assets/LogoBanorte.svg" 
            alt="Banorte"
            style={{
              height: '40px',
              width: 'auto',
              filter: 'brightness(0) invert(1)'
            }}
          />
        </Box>
      </Box>

      {/* Right side with icons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Profile Icon with Dropdown */}
        <Box sx={{ position: 'relative' }}>
          <IconButton 
            ref={profileRef}
            onClick={handleProfileToggle}
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
            size="large"
          >
            <AccountCircleIcon />
          </IconButton>

          {/* Profile Dropdown */}
          <Popper
            open={profileOpen}
            anchorEl={profileRef.current}
            placement="bottom-end"
            transition
            sx={{ zIndex: 1300 }}
          >
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={200}>
                <Paper
                  elevation={8}
                  sx={{
                    width: 320,
                    mt: 1,
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    overflow: 'hidden'
                  }}
                >
                  <ClickAwayListener onClickAway={handleProfileClose}>
                    <Box>
                      {/* Header */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 2,
                        borderBottom: '1px solid #e0e0e0',
                        backgroundColor: '#f8f9fa'
                      }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '16px',
                            color: '#333'
                          }}
                        >
                          Perfil de Usuario
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={handleProfileClose}
                          sx={{ color: '#666' }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      {/* User Info */}
                      <Box sx={{ p: 2 }}>
                        {/* Avatar and Name */}
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 3,
                          pb: 2,
                          borderBottom: '1px solid #f0f0f0'
                        }}>
                          <Box sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            backgroundColor: '#EB0029',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2
                          }}>
                            <PersonIcon sx={{ color: 'white', fontSize: '24px' }} />
                          </Box>
                          <Box>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 600,
                                fontSize: '16px',
                                color: '#333',
                                lineHeight: 1.2
                              }}
                            >
                              {userData.name}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontSize: '13px',
                                color: '#666'
                              }}
                            >
                              {userData.role}
                            </Typography>
                          </Box>
                        </Box>

                        {/* User Details */}
                        <Box sx={{ space: 2 }}>
                          {/* Email */}
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <EmailIcon sx={{ color: '#666', fontSize: '18px', mr: 2 }} />
                            <Box>
                              <Typography variant="body2" sx={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Email
                              </Typography>
                              <Typography variant="body2" sx={{ fontSize: '13px', color: '#333' }}>
                                {userData.email}
                              </Typography>
                            </Box>
                          </Box>

                          {/* User ID */}
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <BadgeIcon sx={{ color: '#666', fontSize: '18px', mr: 2 }} />
                            <Box>
                              <Typography variant="body2" sx={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                ID Usuario
                              </Typography>
                              <Typography variant="body2" sx={{ fontSize: '13px', color: '#333' }}>
                                {userData.userId}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Last Login */}
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ScheduleIcon sx={{ color: '#666', fontSize: '18px', mr: 2 }} />
                            <Box>
                              <Typography variant="body2" sx={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Último Acceso
                              </Typography>
                              <Typography variant="body2" sx={{ fontSize: '13px', color: '#333' }}>
                                {userData.lastLogin}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>

                      {/* Footer Actions */}
                      <Box sx={{ 
                        p: 2,
                        borderTop: '1px solid #e0e0e0',
                        backgroundColor: '#f8f9fa'
                      }}>

                        <Button
                          fullWidth
                          variant="text"
                          size="small"
                          onClick={() => {
                            handleProfileClose();
                            handleLogoutClick();
                          }}
                          sx={{
                            color: '#666',
                            textTransform: 'none',
                            fontSize: '13px',
                            fontWeight: 500,
                            '&:hover': {
                              backgroundColor: '#f0f0f0'
                            }
                          }}
                        >
                          Cerrar Sesión
                        </Button>
                      </Box>
                    </Box>
                  </ClickAwayListener>
                </Paper>
              </Fade>
            )}
          </Popper>
        </Box>
        
        {/* Clickable Notifications Icon with Dropdown */}
        <Box sx={{ position: 'relative' }}>
          <IconButton 
            ref={notificationsRef}
            onClick={handleNotificationsToggle}
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
            size="large"
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        
        {/* Logout Icon */}
        <IconButton 
          onClick={handleLogoutClick}
          sx={{ 
            color: 'white',
            ml: 1,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)'
            }
          }}
          size="large"
        >
          <ExitToAppIcon />
        </IconButton>

          {/* Notifications Dropdown */}
          <Popper
            open={notificationsOpen}
            anchorEl={notificationsRef.current}
            placement="bottom-end"
            transition
            sx={{ zIndex: 1300 }}
          >
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={200}>
                <Paper
                  elevation={8}
                  sx={{
                    width: 380,
                    maxHeight: 400,
                    mt: 1,
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    overflow: 'hidden'
                  }}
                >
                  <ClickAwayListener onClickAway={handleNotificationsClose}>
                    <Box>
                      {/* Header */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 2,
                        borderBottom: '1px solid #e0e0e0',
                        backgroundColor: '#f8f9fa'
                      }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '16px',
                            color: '#333'
                          }}
                        >
                          Notificaciones
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={handleNotificationsClose}
                          sx={{ color: '#666' }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      {/* Notifications List */}
                      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        {notifications.map((notification, index) => (
                          <Box key={notification.id}>
                            <Box sx={{ 
                              p: 2,
                              cursor: 'pointer',
                              backgroundColor: notification.read ? 'transparent' : '#f0f7ff',
                              '&:hover': {
                                backgroundColor: '#f5f5f5'
                              }
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                {getNotificationIcon(notification.type)}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                    <Typography 
                                      variant="subtitle2" 
                                      sx={{ 
                                        fontWeight: notification.read ? 400 : 600,
                                        fontSize: '14px',
                                        color: '#333',
                                        lineHeight: 1.2
                                      }}
                                    >
                                      {notification.title}
                                    </Typography>
                                    {!notification.read && (
                                      <Box sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: '#FF4444',
                                        flexShrink: 0,
                                        mt: 0.5
                                      }} />
                                    )}
                                  </Box>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      fontSize: '12px',
                                      color: '#666',
                                      lineHeight: 1.3,
                                      mb: 0.5
                                    }}
                                  >
                                    {notification.message}
                                  </Typography>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      fontSize: '11px',
                                      color: '#999'
                                    }}
                                  >
                                    {notification.time}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                            {index < notifications.length - 1 && (
                              <Divider sx={{ borderColor: '#f0f0f0' }} />
                            )}
                          </Box>
                        ))}
                      </Box>

                      {/* Footer */}
                      <Box sx={{ 
                        p: 2,
                        borderTop: '1px solid #e0e0e0',
                        backgroundColor: '#f8f9fa'
                      }}>
                        <Button
                          fullWidth
                          variant="text"
                          size="small"
                          sx={{
                            color: '#EB0029',
                            textTransform: 'none',
                            fontSize: '13px',
                            fontWeight: 500,
                            '&:hover': {
              backgroundColor: 'rgba(235, 0, 41, 0.04)'
                            }
                          }}
                        >
                          Ver todas las notificaciones
                        </Button>
                      </Box>
                    </Box>
                  </ClickAwayListener>
                </Paper>
              </Fade>
            )}
          </Popper>
        </Box>
      </Box>
    </Box>
  );

  // Sidebar content
  const SidebarContent = () => (
    <Box>
      <Box sx={{ height: '66px' }} /> {/* This creates space for the fixed header + separator */}
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1, px: 2 }}>
            <ListItemButton
              onClick={() => handleMenuItemClick(item.text)}
              sx={{
                backgroundColor: activeSection === item.text ? '#E0E0E0' : 'transparent',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: activeSection === item.text ? '#E0E0E0' : '#F5F5F5',
                },
                '& .MuiListItemText-primary': {
                  fontWeight: activeSection === item.text ? 600 : 400,
                  color: activeSection === item.text ? '#333' : '#666'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                {React.cloneElement(item.icon, { 
                  sx: { 
                    color: activeSection === item.text ? '#333' : '#666',
                    fontSize: '20px'
                  } 
                })}
                <ListItemText 
                  primary={item.text} 
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '14px',
                      fontFamily: 'Roboto, sans-serif'
                    }
                  }}
                />
              </Box>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'white' }}>
      <AppHeader />
      
      {/* Separator line */}
      <Box sx={{ 
        height: '2px',
        width: '100%',
        background: 'linear-gradient(90deg, #E0E0E0 0%, #BDBDBD 50%, #E0E0E0 100%)',
        opacity: 0.6,
        position: 'fixed',
        top: '64px',
        left: 0,
        right: 0,
        zIndex: 1200
      }} />
      
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ 
          width: { 
            xs: 'auto',
            md: desktopSidebarOpen ? drawerWidth : 0 
          }, 
          flexShrink: { md: 0 } 
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: '#ffffff',
              borderRight: '1px solid #e0e0e0'
            },
          }}
        >
          <SidebarContent />
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="persistent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: '#ffffff',
              borderRight: '1px solid #e0e0e0'
            },
          }}
          open={desktopSidebarOpen}
        >
          <SidebarContent />
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          position: 'absolute',
          top: '80px',
          left: desktopSidebarOpen ? `${drawerWidth + 100}px` : '8px', // Start right after sidebar with minimal gap
          right: '5px', // Minimal right margin
          bottom: '20px', // Use almost full height
          transition: theme.transitions.create(['left'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          backgroundColor: 'white'
        }}
      >
        {/* Main content grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: '2.2fr 0.8fr' }, // Give even more space to left column
          gap: 1, // Reasonable gap between columns
          height: '100%', // Use full container height
          width: '95%' // Use full container width
        }}>
          
          {/* Left column - Generador de Reglas de Negocio */}
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: '#D3D3D3',
            borderRadius: '16px',
            p: 4 // Use the same padding as when sidebar is closed
          }}>
            <Typography 
              variant="h6" 
              component="h2" 
              sx={{ 
                textAlign: 'center',
                mb: 3,
                fontWeight: 600,
                color: '#333',
                fontFamily: 'Roboto, sans-serif',
                fontSize: '18px'
              }}
            >
              Generador de Reglas de Negocio
            </Typography>
            
            {/* Main content area - takes up most space */}
            <Box sx={{ 
              flex: 1, 
              backgroundColor: 'white',
              borderRadius: '12px',
              mb: 4,
              p: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '450px' // Significantly increased minimum height
            }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#999',
                  textAlign: 'center',
                  fontSize: '14px'
                }}
              >
                Bienvenido al generador de reglas de negocio.
                <br />
                Para iniciar chatea con nuestro Banorbert
              </Typography>
            </Box>

            {/* Input area at bottom */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              backgroundColor: '#E8E8E8',
              borderRadius: '12px',
              p: 3 // Increased padding for larger input area
            }}>
                <TextField
                  fullWidth
                  placeholder="Escribe tu prompt y/o adjunta un archivo"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  variant="outlined"
                  size="small"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handlePromptSubmit();
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" sx={{ color: '#666' }}>
                          <AttachFileIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: '6px',
                      '& fieldset': {
                        border: 'none',
                      },
                      '&:hover fieldset': {
                        border: 'none',
                      },
                      '&.Mui-focused fieldset': {
                        border: '1px solid #EB0029',
                      },
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '14px',
                      fontFamily: 'Roboto, sans-serif',
                    }
                  }}
                />
                <IconButton 
                  onClick={handlePromptSubmit}
                  disabled={!promptText.trim()}
                  sx={{ 
                    backgroundColor: promptText.trim() ? '#EB0029' : '#ccc',
                    color: 'white',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: promptText.trim() ? '#D32F2F' : '#ccc',
                    },
                    '&:disabled': {
                      color: '#999'
                    }
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>

          {/* Right column - Últimos movimientos */}
          <Box sx={{ 
            height: '100%',
            backgroundColor: '#D3D3D3',
            borderRadius: '16px',
            p: 4, // Use the same padding as when sidebar is closed
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography 
              variant="h6" 
              component="h2" 
              sx={{ 
                textAlign: 'center',
                mb: 3,
                fontWeight: 600,
                color: '#333',
                fontFamily: 'Roboto, sans-serif',
                fontSize: '18px'
              }}
            >
              Últimos movimientos
            </Typography>
            
            {/* Single continuous white box */}
            <Box sx={{ 
              flex: 1,
              backgroundColor: 'white',
              borderRadius: '12px',
              p: 6,
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Sample movement */}
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '14px',
                  color: '#333',
                  lineHeight: 1.4,
                  fontFamily: 'Roboto, sans-serif',
                  mb: 4
                }}
              >
                • Se creó la Regla 08320492 el día 07-09-2025 a las 14:06
              </Typography>

              {/* Placeholder for more movements */}
              <Box sx={{ 
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#999',
                    textAlign: 'center',
                    fontSize: '14px'
                  }}
                >
                  Más movimientos aparecerán aquí
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: '12px',
            padding: '8px'
          }
        }}
      >
        <DialogTitle 
          id="logout-dialog-title"
          sx={{
            textAlign: 'center',
            fontWeight: 600,
            fontSize: '18px',
            color: '#333',
            fontFamily: 'Roboto, sans-serif'
          }}
        >
          Cerrar Sesión
        </DialogTitle>
        <DialogContent>
          <DialogContentText 
            id="logout-dialog-description"
            sx={{
              textAlign: 'center',
              fontSize: '16px',
              color: '#666',
              fontFamily: 'Roboto, sans-serif',
              mb: 2
            }}
          >
            ¿Seguro que quieres cerrar sesión?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
          <Button 
            onClick={handleLogoutCancel}
            sx={{
              color: '#666',
              borderColor: '#ddd',
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              py: 1,
              borderRadius: '6px',
              fontFamily: 'Roboto, sans-serif',
              '&:hover': {
                backgroundColor: '#f5f5f5',
                borderColor: '#ccc'
              }
            }}
            variant="outlined"
          >
            No
          </Button>
          <Button 
            onClick={handleLogoutConfirm}
            sx={{
              backgroundColor: '#EB0029',
              color: 'white',
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              py: 1,
              borderRadius: '6px',
              fontFamily: 'Roboto, sans-serif',
              '&:hover': {
                backgroundColor: '#D32F2F'
              }
            }}
            variant="contained"
            autoFocus
          >
            Sí
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;

import React, { useState, useRef, useEffect } from 'react';
import authService from '../services/authService';
import { useNotification } from '../hooks/useNotification';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  TextField, 
  InputAdornment,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery,
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
  DialogActions,
  FormControl,
  InputLabel,
  OutlinedInput,
  LinearProgress,
  Alert,
  Snackbar,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon,
  Notifications as NotificationsIcon,
  Key as KeyIcon,
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
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  ExitToApp as ExitToAppIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { useNavigation } from '../hooks/useNavigation';
import { useBusinessRules } from '../hooks/useBusinessRules';

const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [promptText, setPromptText] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  // Change password dialog states
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  
  // UI states - removed snackbar as we're using useNotification hook
  
  // Dynamic notifications state
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Regla Creada',
      message: 'Se creó una nueva regla exitosamente',
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      read: false
    },
    {
      id: 2,
      type: 'info',
      title: 'IA Conectada',
      message: 'Gemini AI está listo para generar reglas',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      read: false
    }
  ]);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { goToLogin } = useNavigation();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const fileInputRef = useRef(null);
  const welcomeShownRef = useRef(false);
  const lastErrorRef = useRef(null);
  const chatScrollRef = useRef(null);
  
  // Conversation mode state
  const [conversationMode, setConversationMode] = useState(false);
  const [conversationMessage, setConversationMessage] = useState('');
  
  // Business rules hook (using current user's ID)
  const {
    isLoading,
    isGenerating,
    currentRule,
    aiResponse,
    error,
    movements,
    generateRule,
    loadMovements,
    clearState
  } = useBusinessRules(authService.getCurrentUser()?.id_usuario || 1);

  const drawerWidth = 240;

  // Load movements on component mount
  useEffect(() => {
    loadMovements();
    
    // Load notifications from localStorage (from other pages like ForgotPassword)
    const storedNotifications = JSON.parse(localStorage.getItem('dashboardNotifications') || '[]');
    if (storedNotifications.length > 0) {
      setNotifications(prev => {
        // Merge stored notifications with existing ones, avoiding duplicates
        const existingIds = prev.map(n => n.id);
        const newNotifications = storedNotifications.filter(n => !existingIds.includes(n.id));
        return [...newNotifications, ...prev];
      });
      
      // Clear stored notifications after loading
      localStorage.removeItem('dashboardNotifications');
    }
  }, [loadMovements]);

  // Check authentication status on component mount
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      // User is not authenticated, redirect to login
      goToLogin();
    } else if (!welcomeShownRef.current) {
      // User is authenticated, show welcome message only once
      welcomeShownRef.current = true;
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        showSuccess(`¡Bienvenido, ${currentUser.usuario}!`, 4000);
        
        // Add welcome notification to bell system
        addNotification('info', 'Bienvenido', `¡Hola ${currentUser.usuario}! Listo para generar reglas de negocio.`);
      }
    }
  }, [goToLogin]);

  // Auto-refresh notification timestamps every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => [...prev]); // Force re-render to update timestamps
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Show error using notification hook
  useEffect(() => {
    if (error && error !== lastErrorRef.current) {
      lastErrorRef.current = error;
      showError(error);
      
      // Also add to the notification bell system
      addNotification('error', 'Error del Sistema', error);
    }
  }, [error, showError]);

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

  const handlePromptSubmit = async () => {
    if (!promptText.trim() && !selectedFile) {
      showWarning('Escribe un prompt o sube un archivo para generar una regla');
      return;
    }

    try {
      await generateRule({
        prompt_texto: promptText.trim(),
        archivo: selectedFile,
        descripcion: promptText.trim() || 'Regla generada desde archivo'
      });

      // Add notification for successful rule generation
      addNotification(
        'success',
        'Regla Creada',
        `Nueva regla de negocio generada: ${promptText.trim() || 'desde archivo'}`
      );

      showSuccess('¡Regla de negocio generada exitosamente!');
      setPromptText('');
      setSelectedFile(null);
    } catch (err) {
      console.error('Error generating rule:', err);
      
      // Add notification for error
      addNotification(
        'error',
        'Error en Generación',
        'No se pudo generar la regla de negocio. Intenta nuevamente.'
      );
      
      showError('Error al generar la regla. Intenta nuevamente.');
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
    // Clear user session
    authService.logout();
    
    // Add logout notification to bell system
    addNotification('info', 'Sesión Cerrada', 'Has cerrado sesión exitosamente');
    
    // Show immediate feedback
    showInfo('Sesión cerrada exitosamente');
    
    // Redirect to login
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

  // Change password handlers
  const handleChangePasswordOpen = () => {
    setChangePasswordOpen(true);
    setProfileOpen(false); // Close profile popup when opening change password
  };

  const handleChangePasswordClose = () => {
    setChangePasswordOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChangePasswordSubmit = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError('Por favor completa todos los campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (newPassword.length < 8) {
      showError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword === currentPassword) {
      showError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    setChangePasswordLoading(true);

    try {
      const result = await authService.changePassword(currentPassword, newPassword);
      
      if (result.success) {
        showSuccess('¡Contraseña cambiada exitosamente!');
        handleChangePasswordClose();
        
        // Add to notification bell system
        addNotification(
          'success',
          'Contraseña Actualizada',
          'Tu contraseña ha sido cambiada exitosamente por motivos de seguridad.'
        );
      } else {
        showError(result.message);
      }
    } catch (error) {
      showError('Error al cambiar la contraseña. Intenta nuevamente.');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  // File handling functions
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    validateAndSetFile(file);
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;

    const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
    const fileExtension = file.name.toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !fileExtension.endsWith('.csv')) {
      showError('Solo se permiten archivos CSV');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showError('El archivo debe ser menor a 10MB');
      return;
    }

    setSelectedFile(file);
    showSuccess(`Archivo "${file.name}" seleccionado`);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  // Get current user data from authentication service
  const currentUser = authService.getCurrentUser();
  const userData = currentUser ? {
    name: currentUser.usuario || 'Usuario',
    email: currentUser.correo || 'email@banorte.com',
    lastLogin: currentUser.fecha_registro ? new Date(currentUser.fecha_registro).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'No disponible',
    userId: currentUser.id_usuario || 'N/A',
  } : {
    name: 'Usuario Invitado',
    email: 'guest@banorte.com',
    lastLogin: 'No disponible',
    userId: 'GUEST',
    role: 'Invitado'
  };



  const unreadCount = notifications.filter(n => !n.read).length;

  // Time formatting function
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Hace unos segundos';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Hace ${minutes} min`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Hace ${hours} hr${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `Hace ${days} día${days > 1 ? 's' : ''}`;
    }
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  // Add new notification (for rule generation)
  const addNotification = (type, title, message) => {
    const newNotification = {
      id: Date.now(), // Simple ID generation
      type,
      title,
      message,
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

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

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'white' }}>
      {/* Header */}
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            sx={{ 
              mr: 2,
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
          </Box>
          
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
          </Box>
          
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
        </Box>
      </Box>
      
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
      <Box component="nav" sx={{ width: { xs: 'auto', md: desktopSidebarOpen ? drawerWidth : 0 }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
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
          <Box sx={{ height: '66px' }} />
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
                    <ListItemText primary={item.text} />
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
        
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
          <Box sx={{ height: '66px' }} />
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
                    <ListItemText primary={item.text} />
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          position: 'absolute',
          top: '80px',
          left: desktopSidebarOpen ? `${drawerWidth + 100}px` : '8px',
          right: '5px',
          bottom: '20px',
          transition: theme.transitions.create(['left'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          backgroundColor: 'white'
        }}
      >
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: '2.2fr 0.8fr' },
          gap: 1,
          height: '100%',
          width: '95%'
        }}>
          
          {/* Left column - AI Business Rule Generator */}
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: '#D3D3D3',
            borderRadius: '16px',
            p: 4
          }}>
            <Typography 
              variant="h6" 
              component="h2" 
              sx={{ 
                textAlign: 'center',
                mb: 3,
                fontWeight: 600,
                color: '#333',
                fontSize: '18px'
              }}
            >
              Generador de Reglas de Negocio - Gemini AI
            </Typography>
            
            {/* AI Response Display Area */}
            <Box sx={{ 
              flex: 1, 
              backgroundColor: 'white',
              borderRadius: '12px',
              mb: 4,
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              minHeight: '400px',
              overflow: 'hidden'
            }}>
              {isGenerating ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <LinearProgress sx={{ width: '100%', mb: 2 }} />
                  <Typography sx={{ color: '#666', textAlign: 'center' }}>
                    🤖 Generando regla de negocio con Gemini AI...
                  </Typography>
                </Box>
              ) : aiResponse ? (
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ color: '#333', fontWeight: 600 }}>
                      ✨ Regla Generada por IA
                    </Typography>
                    <Button
                      size="small"
                      onClick={clearState}
                      startIcon={<RefreshIcon />}
                      sx={{ color: '#666' }}
                    >
                      Nueva Regla
                    </Button>
                  </Box>

                  {aiResponse.rules && aiResponse.rules.map((rule, index) => (
                    <Accordion key={rule.id || index} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {rule.title}
                          </Typography>
                          <Chip 
                            label={rule.priority} 
                            size="small" 
                            color={rule.priority === 'high' ? 'error' : rule.priority === 'medium' ? 'warning' : 'default'}
                          />
                          <Chip 
                            label={rule.category} 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box>
                          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                            {rule.description}
                          </Typography>
                          
                          {rule.conditions && rule.conditions.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                Condiciones:
                              </Typography>
                              {rule.conditions.map((condition, i) => (
                                <Typography key={i} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                                  • {condition}
                                </Typography>
                              ))}
                            </Box>
                          )}

                          {rule.actions && rule.actions.length > 0 && (
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                Acciones:
                              </Typography>
                              {rule.actions.map((action, i) => (
                                <Typography key={i} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                                  • {action}
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}

                  {aiResponse.summary && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        📋 Resumen:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {aiResponse.summary}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#999', mb: 2 }}>
                      Bienvenido al Generador IA
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#bbb' }}>
                      Escribe un prompt o sube un archivo CSV para generar reglas de negocio
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Input and File Upload Area */}
            <Box sx={{ 
              backgroundColor: '#E8E8E8',
              borderRadius: '12px',
              p: 3
            }}>
              {selectedFile ? (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  mb: 2,
                  p: 2,
                  backgroundColor: 'rgba(235, 0, 41, 0.1)',
                  borderRadius: '8px'
                }}>
                  <AttachFileIcon sx={{ color: '#EB0029' }} />
                  <Typography sx={{ flex: 1, fontSize: '14px' }}>
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </Typography>
                  <IconButton size="small" onClick={handleFileRemove}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ) : (
                <Box 
                  sx={{
                    mb: 2,
                    p: 2,
                    border: `2px dashed ${dragOver ? '#EB0029' : '#ddd'}`,
                    borderRadius: '8px',
                    backgroundColor: dragOver ? 'rgba(235, 0, 41, 0.05)' : 'rgba(255, 255, 255, 0.5)',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <CloudUploadIcon sx={{ fontSize: '32px', color: dragOver ? '#EB0029' : '#999', mb: 1 }} />
                  <Typography sx={{ fontSize: '14px', color: '#666' }}>
                    Arrastra un archivo CSV o haz clic para seleccionar
                  </Typography>
                </Box>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".csv"
                style={{ display: 'none' }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  placeholder="Describe el tipo de regla de negocio que necesitas..."
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  disabled={isGenerating}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handlePromptSubmit();
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: '6px',
                      '& fieldset': { border: 'none' },
                      '&:hover fieldset': { border: 'none' },
                      '&.Mui-focused fieldset': { border: '1px solid #EB0029' },
                    }
                  }}
                />
                <IconButton 
                  onClick={handlePromptSubmit}
                  disabled={isGenerating || (!promptText.trim() && !selectedFile)}
                  sx={{ 
                    backgroundColor: (!isGenerating && (promptText.trim() || selectedFile)) ? '#EB0029' : '#ccc',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: (!isGenerating && (promptText.trim() || selectedFile)) ? '#D32F2F' : '#ccc',
                    }
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* Right column - Últimos movimientos */}
          <Box sx={{ 
            height: '100%',
            backgroundColor: '#D3D3D3',
            borderRadius: '16px',
            p: 4,
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
                fontSize: '18px'
              }}
            >
              Últimos Movimientos
            </Typography>
            
            <Box sx={{ 
              flex: 1,
              backgroundColor: 'white',
              borderRadius: '12px',
              p: 3,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Historial de Reglas
                </Typography>
                <IconButton size="small" onClick={loadMovements} disabled={isLoading}>
                  <RefreshIcon />
                </IconButton>
              </Box>

              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {isLoading ? (
                  <Box sx={{ py: 4 }}>
                    <LinearProgress />
                  </Box>
                ) : movements.length > 0 ? (
                  movements.map((movement, index) => (
                    <Box 
                      key={movement.id || index}
                      sx={{ 
                        py: 1.5, 
                        borderBottom: index < movements.length - 1 ? '1px solid #f0f0f0' : 'none'
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '13px', mb: 0.5 }}>
                        • {movement.description}
                      </Typography>
                      {movement.status && (
                        <Chip 
                          label={movement.status} 
                          size="small" 
                          sx={{ 
                            height: '18px',
                            fontSize: '10px',
                            backgroundColor: movement.status === 'Activa' ? '#e8f5e8' : '#f0f0f0'
                          }} 
                        />
                      )}
                    </Box>
                  ))
                ) : (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                    No hay movimientos recientes
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Profile Popup */}
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

                  <Box sx={{ p: 2 }}>
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

                    <Box sx={{ space: 2 }}>
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

                  <Box sx={{ 
                    p: 2,
                    borderTop: '1px solid #e0e0e0',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <Button
                      fullWidth
                      variant="text"
                      size="small"
                      startIcon={<KeyIcon />}
                      onClick={handleChangePasswordOpen}
                      sx={{
                        color: '#EB0029',
                        textTransform: 'none',
                        fontSize: '13px',
                        fontWeight: 500,
                        mb: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(235, 0, 41, 0.04)'
                        }
                      }}
                    >
                      Cambiar Contraseña
                    </Button>
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

      {/* Notifications Popup */}
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
                        }}
                        onClick={() => markNotificationAsRead(notification.id)}
                        >
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
                                {formatTimeAgo(notification.timestamp)}
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

      {/* Change Password Dialog */}
      <Dialog 
        open={changePasswordOpen} 
        onClose={handleChangePasswordClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          fontSize: '18px',
          fontWeight: 600
        }}>
          <KeyIcon sx={{ color: '#EB0029' }} />
          Cambiar Contraseña
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3, color: '#666' }}>
            Para tu seguridad, ingresa tu contraseña actual y luego la nueva contraseña.
          </DialogContentText>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel htmlFor="current-password">Contraseña Actual</InputLabel>
              <OutlinedInput
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={changePasswordLoading}
                label="Contraseña Actual"
                sx={{
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#EB0029',
                  }
                }}
              />
            </FormControl>
            
            <FormControl variant="outlined" fullWidth>
              <InputLabel htmlFor="new-password">Nueva Contraseña</InputLabel>
              <OutlinedInput
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={changePasswordLoading}
                label="Nueva Contraseña"
                sx={{
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#EB0029',
                  }
                }}
              />
            </FormControl>
            
            <FormControl variant="outlined" fullWidth>
              <InputLabel htmlFor="confirm-password">Confirmar Nueva Contraseña</InputLabel>
              <OutlinedInput
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={changePasswordLoading}
                label="Confirmar Nueva Contraseña"
                sx={{
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#EB0029',
                  }
                }}
              />
            </FormControl>
          </Box>
          
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <Typography variant="body2" sx={{ fontSize: '12px', color: '#666' }}>
              <strong>Requisitos de la contraseña:</strong>
              <br />• Mínimo 8 caracteres
              <br />• Diferente a tu contraseña actual
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleChangePasswordClose}
            disabled={changePasswordLoading}
            sx={{ 
              color: '#666',
              '&:hover': { backgroundColor: '#f0f0f0' }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleChangePasswordSubmit}
            variant="contained"
            disabled={changePasswordLoading || !currentPassword || !newPassword || !confirmPassword}
            sx={{ 
              bgcolor: '#EB0029',
              '&:hover': { bgcolor: '#D32F2F' },
              '&:disabled': { bgcolor: '#ccc' }
            }}
          >
            {changePasswordLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logout Dialog */}
      <Dialog open={logoutDialogOpen} onClose={handleLogoutCancel}>
        <DialogTitle>Cerrar Sesión</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Seguro que quieres cerrar sesión?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleLogoutCancel}
            sx={{ 
              color: '#EB0029',
              '&:hover': { 
                backgroundColor: 'rgba(235, 0, 41, 0.04)' 
              }
            }}
          >
            No
          </Button>
          <Button 
            onClick={handleLogoutConfirm} 
            variant="contained"
            sx={{ 
              bgcolor: '#EB0029',
              '&:hover': { 
                bgcolor: '#D32F2F' 
              }
            }}
          >
            Sí
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
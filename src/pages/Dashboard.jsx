import React, { useState, useRef, useEffect } from 'react';
import authService from '../services/authService';
import { useNotification } from '../hooks/useNotification';
import { useGlobalNotifications } from '../hooks/useGlobalNotifications.jsx';
import { Box, Typography, Button, IconButton, TextField, Drawer, List, ListItem, ListItemButton, ListItemText, useTheme,
useMediaQuery, Popper, Paper, ClickAwayListener, Fade, Divider, Badge, Dialog, DialogTitle, DialogContent, DialogContentText, 
DialogActions, FormControl, InputLabel, OutlinedInput, LinearProgress, Chip, Accordion, AccordionSummary, AccordionDetails,
Card, CardContent
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
  Schedule as ScheduleIcon,
  Badge as BadgeIcon,
  ChatBubbleOutline as ChatIcon,
} from '@mui/icons-material';
import { useNavigation } from '../hooks/useNavigation';
import { useBusinessRules } from '../hooks/useBusinessRules';
import { useConversation } from '../hooks/useConversation';
import { aiService } from '../services/api';

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
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { goToLogin, goToDashboard, goToReglas, goToSimulador, goToReports, goToHistorial } = useNavigation();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  
  // Global notifications hook
  const { notifications, unreadCount, markAsRead, markAllAsRead, addNotification } = useGlobalNotifications();
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const fileInputRef = useRef(null);
  const welcomeShownRef = useRef(false);
  const lastErrorRef = useRef(null);
  const chatScrollRef = useRef(null);
  const conversationScrollRef = useRef(null);
  
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

  // Conversation hook
  const {
    isConversationActive,
    isProcessing,
    conversationHistory,
    currentResponse,
    error: conversationError,
    isReadyToGenerate,
    startConversation,
    continueConversation,
    endConversation,
    resetConversation,
    getConversationSummary
  } = useConversation();

  const drawerWidth = 240;

  // Load movements on component mount
  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  // Check authentication status on component mount
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      // User is not authenticated, redirect to login
      goToLogin();
    } else if (!welcomeShownRef.current) {
      // User is authenticated - no need for welcome notifications on every page visit
      welcomeShownRef.current = true;
    }
  }, [goToLogin]);

  // Note: Timestamp updates now handled by global notifications context

  // Show error using notification hook
  useEffect(() => {
    if (error && error !== lastErrorRef.current) {
      lastErrorRef.current = error;
      showError(error);
      
      // Also add to the notification bell system
      addNotification({
        type: 'error',
        title: 'Error del Sistema',
        message: error
      });
    }
  }, [error, showError]);

  // Handle conversation errors
  useEffect(() => {
    if (conversationError) {
      showError(conversationError);
      addNotification({
        type: 'error',
        title: 'Error en Conversación',
        message: conversationError
      });
    }
  }, [conversationError, showError]);

  // Auto-scroll conversation to bottom when new messages are added
  useEffect(() => {
    if (conversationScrollRef.current && conversationHistory.length > 0) {
      const scrollElement = conversationScrollRef.current;
      setTimeout(() => {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }, 100);
    }
  }, [conversationHistory]);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopSidebarOpen(!desktopSidebarOpen);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, active: activeSection === 'Dashboard' },
    { text: 'Reglas', icon: <RuleIcon />, active: activeSection === 'Reglas' },
    { text: 'Simulador', icon: <PsychologyIcon />, active: activeSection === 'Simulador' },
    { text: 'Reportes', icon: <AssessmentIcon />, active: activeSection === 'Reportes' },
    { text: 'Historial', icon: <HistoryIcon />, active: activeSection === 'Historial' },
  ];

  const handleMenuItemClick = (itemText) => {
    setActiveSection(itemText);
    if (isMobile) {
      setMobileOpen(false);
    }
    
    // Navigate to the appropriate page
    switch (itemText) {
      case 'Dashboard':
        // Already on dashboard, no navigation needed
        break;
      case 'Reglas':
        goToReglas();
        break;
      case 'Simulador':
        goToSimulador();
        break;
      case 'Reportes':
        goToReports();
        break;
      case 'Historial':
        goToHistorial();
        break;
      default:
        break;
    }
  };

  // Handle conversation mode toggle
  const handleToggleConversationMode = () => {
    if (conversationMode) {
      // Exiting conversation mode - reset everything
      resetConversation();
      setConversationMessage('');
    }
    setConversationMode(!conversationMode);
  };

  // Handle starting conversation
  const handleStartConversation = async () => {
    if (!promptText.trim()) {
      showWarning('Escribe una descripción inicial de la regla que necesitas');
      return;
    }

    try {
      await startConversation(promptText.trim());
      showSuccess('¡Conversación iniciada con Gemini!');
    } catch (err) {
      console.error('Error starting conversation:', err);
      showError('Error al iniciar conversación. Intenta nuevamente.');
    }
  };

  // Handle continuing conversation
  const handleContinueConversation = async () => {
    if (!conversationMessage.trim()) {
      showWarning('Escribe una respuesta para continuar la conversación');
      return;
    }

    try {
      await continueConversation(conversationMessage.trim());
      setConversationMessage('');
    } catch (err) {
      console.error('Error continuing conversation:', err);
      showError('Error en la conversación. Intenta nuevamente.');
    }
  };

  // Handle generating rule from conversation
  const handleGenerateFromConversation = async () => {
    if (!isReadyToGenerate) {
      showWarning('La conversación aún no está lista para generar la regla');
      return;
    }

    try {
      // Create a summary prompt from the conversation
      const summary = getConversationSummary();
      const finalPrompt = `${summary?.summary || ''}\n\nDetalles adicionales de la conversación:\n${conversationHistory
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .join('\n')}`;

      await generateRule({
        prompt_texto: finalPrompt,
        archivo: selectedFile,
        descripcion: summary?.summary || 'Regla generada desde conversación con IA'
      });

      // Add notification for successful rule generation
      addNotification({
        type: 'success',
        title: 'Regla Creada',
        message: 'Nueva regla de negocio generada desde conversación con IA'
      });

      showSuccess('¡Regla de negocio generada exitosamente!');
      
      // Reset conversation and form
      resetConversation();
      setConversationMode(false);
      setPromptText('');
      setSelectedFile(null);
      
    } catch (err) {
      console.error('Error generating rule from conversation:', err);
      
      addNotification({
        type: 'error',
        title: 'Error en Generación',
        message: 'No se pudo generar la regla de negocio. Intenta nuevamente.'
      });
      
      showError('Error al generar la regla. Intenta nuevamente.');
    }
  };

  const handlePromptSubmit = async () => {
    if (!promptText.trim() && !selectedFile) {
      showWarning('Escribe un prompt o sube un archivo para generar una regla');
      return;
    }

    // If in conversation mode, start conversation instead of direct generation
    if (conversationMode) {
      return handleStartConversation();
    }

    try {
      await generateRule({
        prompt_texto: promptText.trim(),
        archivo: selectedFile,
        descripcion: promptText.trim() || 'Regla generada desde archivo'
      });

      // Add notification for successful rule generation
      addNotification({
        type: 'success',
        title: 'Regla Creada',
        message: `Nueva regla de negocio generada: ${promptText.trim() || 'desde archivo'}`
      });

      showSuccess('¡Regla de negocio generada exitosamente!');
      setPromptText('');
      setSelectedFile(null);
    } catch (err) {
      console.error('Error generating rule:', err);
      
      // Add notification for error
      addNotification({
        type: 'error',
        title: 'Error en Generación',
        message: 'No se pudo generar la regla de negocio. Intenta nuevamente.'
      });
      
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
    addNotification({
      type: 'info',
      title: 'Sesión Cerrada',
      message: 'Has cerrado sesión exitosamente'
    });
    
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
        addNotification({
          type: 'success',
          title: 'Contraseña Actualizada',
          message: 'Tu contraseña ha sido cambiada exitosamente por motivos de seguridad.'
        });
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

  // Note: markAsRead is now provided by useGlobalNotifications hook

  // Note: addNotification is now provided by useGlobalNotifications hook

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
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      width: '100vw',
      backgroundColor: '#f8f9fa',
      overflow: 'hidden'
    }}>
      {/* CSS Animations and Override Global Styles */}
      <style>
        {`
          @keyframes pulse {
            0%, 80%, 100% {
              opacity: 0.3;
              transform: scale(0.8);
            }
            40% {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          /* Override global dark theme styles */
          html, body, #root {
            background-color: #f8f9fa !important;
            color: #333 !important;
            overflow-x: hidden;
          }
          
          body {
            display: block !important;
            place-items: unset !important;
          }
        `}
      </style>
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
        width: '100vw',
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
        width: '100vw',
        background: 'linear-gradient(90deg, #E0E0E0 0%, #BDBDBD 50%, #E0E0E0 100%)',
        opacity: 0.6,
        position: 'fixed',
        top: '64px',
        left: 0,
        right: 0,
        zIndex: 1200
      }} />
      
      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: desktopSidebarOpen ? drawerWidth : 0 }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={isMobile ? mobileOpen : desktopSidebarOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          BackdropProps={{
            sx: {
              backgroundColor: isMobile ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
            }
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              top: '64px',
              height: 'calc(100vh - 64px)',
              borderRight: '1px solid #E0E0E0',
              backgroundColor: '#FAFAFA',
            },
          }}
        >
          <List sx={{ pt: 2 }}>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => handleMenuItemClick(item.text)}
                  sx={{
                    mx: 2,
                    mb: 1,
                    borderRadius: '8px',
                    backgroundColor: item.active ? 'rgba(235, 0, 41, 0.08)' : 'transparent',
                    color: item.active ? '#EB0029' : '#666',
                    '&:hover': {
                      backgroundColor: item.active ? 'rgba(235, 0, 41, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                  </Box>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '14px',
                      fontWeight: item.active ? 600 : 400
                    }}
                  />
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
          position: 'fixed',
          top: '80px',
          left: desktopSidebarOpen ? `${drawerWidth}px` : '0px',
          right: '0px',
          bottom: '0px',
          transition: theme.transitions.create(['left'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          backgroundColor: '#f8f9fa',
          padding: 3,
          overflow: 'auto'
        }}
      >
        {/* Dashboard Main Content */}
        <Box sx={{ 
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Header Section */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4,
            flexWrap: 'wrap',
            gap: 2
          }}>
          </Box>

          {/* Main Content Grid */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
            gap: 3,
            mb: 4
          }}>
            
            {/* AI Generator Card */}
            <Card sx={{ 
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: '#333', 
                  mb: 3
                }}>
                  Generador de Reglas de Negocio
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
              {/* Conversation Mode */}
              {isConversationActive ? (
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  backgroundColor: 'white',
                  height: '100%'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ color: '#333', fontWeight: 600 }}>
                      Conversación con Gemini
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => {
                        resetConversation();
                        setConversationMode(false);
                      }}
                      startIcon={<CloseIcon />}
                      sx={{ color: '#666' }}
                    >
                      Terminar Conversación
                    </Button>
                  </Box>

                  {/* Conversation History */}
                  <Box 
                    ref={conversationScrollRef}
                    sx={{ 
                      flex: 1, 
                      overflow: 'auto', 
                      mb: 3,
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      p: 2,
                      backgroundColor: '#f5f5f5',
                      maxHeight: '400px',
                      '&::-webkit-scrollbar': {
                        width: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        backgroundColor: '#f1f1f1',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#c1c1c1',
                        borderRadius: '4px',
                        '&:hover': {
                          backgroundColor: '#a8a8a8',
                        },
                      },
                    }}>
                    
                    {/* Welcome message when conversation starts but no history yet */}
                    {conversationHistory.length === 0 && (
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        minHeight: '200px'
                      }}>
                        <Box sx={{
                          textAlign: 'center',
                          p: 3,
                          backgroundColor: 'white',
                          borderRadius: '12px',
                          border: '1px solid #e0e0e0',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                        }}>
                          <Typography variant="h6" sx={{ color: '#333', mb: 1 }}>
                            Conversación Iniciada
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            Gemini te hará preguntas específicas para crear la regla perfecta
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {conversationHistory.map((message, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          mb: 2, 
                          display: 'flex',
                          justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                          width: '100%'
                        }}
                      >
                        <Box sx={{
                          maxWidth: '80%',
                          p: 2,
                          borderRadius: '12px',
                          backgroundColor: message.role === 'user' ? '#EB0029' : 'white',
                          color: message.role === 'user' ? 'white' : '#333',
                          boxShadow: message.role === 'user' ? 
                            '0 2px 8px rgba(235, 0, 41, 0.2)' : 
                            '0 2px 8px rgba(0, 0, 0, 0.1)',
                          border: message.role === 'assistant' ? '1px solid #e0e0e0' : 'none'
                        }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {message.content}
                          </Typography>
                          
                          {/* Show AI questions if available */}
                          {message.role === 'assistant' && message.data?.questions && message.data.questions.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, opacity: 0.8 }}>
                                Preguntas específicas:
                              </Typography>
                              {message.data.questions.map((question, qIndex) => (
                                <Typography key={qIndex} variant="body2" sx={{ mb: 0.5, opacity: 0.9 }}>
                                  • {question}
                                </Typography>
                              ))}
                            </Box>
                          )}
                          
                          {/* Show confidence level */}
                          {message.role === 'assistant' && message.data?.confidence_level && (
                            <Chip
                              label={`Confianza: ${message.data.confidence_level}`}
                              size="small"
                              sx={{ 
                                mt: 1,
                                backgroundColor: message.data.confidence_level === 'alta' ? '#4CAF50' : 
                                                message.data.confidence_level === 'media' ? '#FF9800' : '#f44336',
                                color: 'white',
                                fontSize: '10px'
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    ))}
                    
                    {isProcessing && (
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'flex-start',
                        mb: 2 
                      }}>
                        <Box sx={{
                          maxWidth: '80%',
                          p: 2,
                          borderRadius: '12px',
                          backgroundColor: 'white',
                          border: '1px solid #e0e0e0',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              gap: 0.5,
                              alignItems: 'center'
                            }}>
                              <Box sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: '#EB0029',
                                animation: 'pulse 1.5s ease-in-out infinite'
                              }} />
                              <Box sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: '#EB0029',
                                animation: 'pulse 1.5s ease-in-out infinite 0.2s'
                              }} />
                              <Box sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: '#EB0029',
                                animation: 'pulse 1.5s ease-in-out infinite 0.4s'
                              }} />
                            </Box>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              Gemini está analizando tu respuesta...
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Conversation Input */}
                  {!isReadyToGenerate ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        multiline
                        maxRows={2}
                        placeholder="Responde a las preguntas de Gemini..."
                        value={conversationMessage}
                        onChange={(e) => setConversationMessage(e.target.value)}
                        disabled={isProcessing}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleContinueConversation();
                          }
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            '& fieldset': { borderColor: '#e0e0e0' },
                            '&:hover fieldset': { borderColor: '#EB0029' },
                            '&.Mui-focused fieldset': { borderColor: '#EB0029' },
                          }
                        }}
                      />
                      <Button
                        onClick={handleContinueConversation}
                        disabled={isProcessing || !conversationMessage.trim()}
                        variant="contained"
                        sx={{ 
                          bgcolor: '#EB0029',
                          '&:hover': { bgcolor: '#D32F2F' },
                          minWidth: '100px'
                        }}
                      >
                        Responder
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      p: 3, 
                      backgroundColor: '#e8f5e8', 
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <Typography variant="h6" sx={{ color: '#2e7d32', mb: 2 }}>
                        ¡Listo para generar la regla!
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#388e3c', mb: 3 }}>
                        Gemini ha recopilado suficiente información. ¿Quieres generar la regla ahora?
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button
                          onClick={handleGenerateFromConversation}
                          variant="contained"
                          disabled={isGenerating}
                          sx={{ 
                            bgcolor: '#2e7d32',
                            '&:hover': { bgcolor: '#1b5e20' }
                          }}
                        >
                          {isGenerating ? 'Generando...' : 'Generar Regla'}
                        </Button>
                        <Button
                          onClick={() => setConversationMessage('')}
                          disabled={isGenerating}
                          sx={{ color: '#666' }}
                        >
                          Continuar Conversación
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              ) : isGenerating ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <LinearProgress sx={{ width: '100%', mb: 2 }} />
                  <Typography sx={{ color: '#666', textAlign: 'center' }}>
                    Generando regla de negocio con Gemini AI...
                  </Typography>
                </Box>
              ) : aiResponse ? (
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ color: '#333', fontWeight: 600 }}>
                      Regla Generada por IA
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
                        Resumen:
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

            {/* Mode Toggle */}
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              gap: 2
            }}>
              <Button
                variant={!conversationMode ? "contained" : "outlined"}
                onClick={() => !conversationMode || handleToggleConversationMode()}
                disabled={isConversationActive}
                sx={{ 
                  bgcolor: !conversationMode ? '#EB0029' : 'transparent',
                  borderColor: '#EB0029',
                  color: !conversationMode ? 'white' : '#EB0029',
                  '&:hover': { 
                    bgcolor: !conversationMode ? '#D32F2F' : 'rgba(235, 0, 41, 0.04)',
                    borderColor: '#EB0029'
                  }
                }}
              >
                Generación Directa
              </Button>
              
              <Typography sx={{ color: '#666', fontSize: '14px' }}>
                o
              </Typography>
              
              <Button
                variant={conversationMode ? "contained" : "outlined"}
                onClick={handleToggleConversationMode}
                disabled={isGenerating}
                startIcon={<ChatIcon />}
                sx={{ 
                  bgcolor: conversationMode ? '#EB0029' : 'transparent',
                  borderColor: '#EB0029',
                  color: conversationMode ? 'white' : '#EB0029',
                  '&:hover': { 
                    bgcolor: conversationMode ? '#D32F2F' : 'rgba(235, 0, 41, 0.04)',
                    borderColor: '#EB0029'
                  }
                }}
              >
                Conversación con IA
              </Button>
            </Box>

            {/* Input and File Upload Area */}
            <Box sx={{ 
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
              p: 3
            }}>
              {!conversationMode && selectedFile ? (
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
                  placeholder={
                    conversationMode 
                      ? "Describe brevemente qué tipo de regla necesitas para iniciar la conversación..."
                      : "Describe el tipo de regla de negocio que necesitas..."
                  }
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  disabled={isGenerating || isConversationActive}
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
                <Button 
                  onClick={handlePromptSubmit}
                  disabled={isGenerating || isConversationActive || (!promptText.trim() && !selectedFile)}
                  variant="contained"
                  sx={{ 
                    backgroundColor: (!isGenerating && !isConversationActive && (promptText.trim() || selectedFile)) ? '#EB0029' : '#ccc',
                    color: 'white',
                    minWidth: '120px',
                    '&:hover': {
                      backgroundColor: (!isGenerating && !isConversationActive && (promptText.trim() || selectedFile)) ? '#D32F2F' : '#ccc',
                    }
                  }}
                >
                  {conversationMode ? 'Iniciar Chat' : 'Generar'}
                </Button>
              </Box>
            </Box>
              </CardContent>
            </Card>

            {/* Right column - Últimos movimientos */}
            <Card sx={{ 
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#333',
                      fontSize: '18px'
                    }}
                  >
                    Últimos Movimientos
                  </Typography>
                  <IconButton size="small" onClick={loadMovements} disabled={isLoading}>
                    <RefreshIcon />
                  </IconButton>
                </Box>

                <Box sx={{ overflow: 'auto', maxHeight: '400px' }}>
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
              </CardContent>
            </Card>
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
                        onClick={() => markAsRead(notification.id)}
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
              {newPassword && newPassword.length < 8 && (
                <Typography variant="caption" sx={{ color: '#f44336', fontSize: '11px', mt: 0.5 }}>
                  La contraseña debe tener al menos 8 caracteres
                </Typography>
              )}
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
              {confirmPassword && newPassword && confirmPassword !== newPassword && (
                <Typography variant="caption" sx={{ color: '#f44336', fontSize: '11px', mt: 0.5 }}>
                  Las contraseñas no coinciden
                </Typography>
              )}
            </FormControl>
          </Box>
          
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <Typography variant="body2" sx={{ fontSize: '12px', color: '#666', mb: 1 }}>
              <strong>Requisitos de la contraseña:</strong>
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '11px', 
                  color: newPassword && newPassword.length >= 8 ? '#4caf50' : '#666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                {newPassword && newPassword.length >= 8 ? '✓' : '•'} Mínimo 8 caracteres
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '11px', 
                  color: newPassword && confirmPassword && newPassword === confirmPassword ? '#4caf50' : '#666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                {newPassword && confirmPassword && newPassword === confirmPassword ? '✓' : '•'} Las contraseñas deben coincidir
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '11px', 
                  color: newPassword && currentPassword && newPassword !== currentPassword ? '#4caf50' : '#666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                {newPassword && currentPassword && newPassword !== currentPassword ? '✓' : '•'} Diferente a tu contraseña actual
              </Typography>
            </Box>
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
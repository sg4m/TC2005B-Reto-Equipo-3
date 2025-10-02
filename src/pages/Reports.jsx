import React, { useState, useRef, useEffect } from 'react';
import authService from '../services/authService';
import { useNotification } from '../hooks/useNotification';
import { useReports } from '../hooks/useReports';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
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
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon,
  Notifications as NotificationsIcon,
  Key as KeyIcon,
  Dashboard as DashboardIcon,
  Rule as RuleIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  ExitToApp as ExitToAppIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  Badge as BadgeIcon,
  GetApp as GetAppIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  PlayCircleOutline as PlayCircleIcon,
  PauseCircleOutline as PauseCircleIcon
} from '@mui/icons-material';
import { useNavigation } from '../hooks/useNavigation';

const Reports = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('Reportes');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  // Change password dialog states
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  
  // Dynamic notifications state
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Reporte Generado',
      message: 'El reporte se generó exitosamente',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      read: false
    },
    {
      id: 2,
      type: 'info',
      title: 'Datos Actualizados',
      message: 'Los datos del reporte han sido actualizados',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false
    }
  ]);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { goToLogin, goToDashboard } = useNavigation();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const { reportsData, loading, error, refreshData, exportToPDF, exportToCSV } = useReports();
  
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const welcomeShownRef = useRef(false);

  // Handle exports
  const handleExportPDF = async () => {
    const result = await exportToPDF();
    if (result.success) {
      showSuccess('PDF descargado exitosamente');
    } else {
      showError('Error al descargar PDF');
    }
  };

  const handleExportCSV = async () => {
    const result = await exportToCSV();
    if (result.success) {
      showSuccess('CSV descargado exitosamente');
    } else {
      showError('Error al descargar CSV');
    }
  };

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await authService.isAuthenticated();
        if (!isAuthenticated) {
          goToLogin();
          return;
        }
      } catch (error) {
        console.error('Auth check error:', error);
        goToLogin();
      }
    };
    
    checkAuth();
  }, [goToLogin]);

  // Show welcome notification once
  useEffect(() => {
    if (!welcomeShownRef.current) {
      welcomeShownRef.current = true;
      setTimeout(() => {
        showInfo('Bienvenido a los Reportes de Banorte');
      }, 1000);
    }
  }, [showInfo]);

  // Auto-refresh notification timestamps every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => [...prev]);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Show error using notification hook
  useEffect(() => {
    if (error && error !== lastErrorRef.current) {
      lastErrorRef.current = error;
      showError(error);
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
    { text: 'Dashboard', icon: <DashboardIcon />, active: activeSection === 'Dashboard' },
    { text: 'Reglas', icon: <RuleIcon />, active: activeSection === 'Reglas' },
    { text: 'Simulador', icon: <PsychologyIcon />, active: activeSection === 'Simulador' },
    { text: 'Reportes', icon: <AssessmentIcon />, active: activeSection === 'Reportes' },
    { text: 'Historial', icon: <HistoryIcon />, active: activeSection === 'Historial' },
  ];

  const handleMenuItemClick = (itemText) => {
    if (itemText === 'Dashboard') {
      goToDashboard();
      return;
    }
    
    setActiveSection(itemText);
    if (isMobile) {
      setMobileOpen(false);
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
    authService.logout()
      .then(() => {
        goToLogin();
        showSuccess('Sesión cerrada exitosamente');
      })
      .catch((error) => {
        showError('Error al cerrar sesión');
      })
      .finally(() => {
        setLogoutDialogOpen(false);
      });
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
    if (newPassword !== confirmPassword) {
      showError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 8) {
      showError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword === currentPassword) {
      showError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    try {
      setChangePasswordLoading(true);
      
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      // Here you would call the change password API
      // await authService.changePassword(currentPassword, newPassword);
      
      showSuccess('Contraseña cambiada exitosamente');
      handleChangePasswordClose();
    } catch (error) {
      showError(error.message || 'Error al cambiar contraseña');
    } finally {
      setChangePasswordLoading(false);
    }
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

  const drawerWidth = 240;
  const unreadCount = notifications.filter(n => !n.read).length;

  // Time formatting function
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Add new notification (for reports generation)
  const addNotification = (type, title, message) => {
    const newNotification = {
      id: Date.now(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />;
      case 'warning':
        return <WarningIcon sx={{ color: '#ff9800', fontSize: 20 }} />;
      case 'error':
        return <WarningIcon sx={{ color: '#f44336', fontSize: 20 }} />;
      case 'info':
      default:
        return <Info sx={{ color: '#2196f3', fontSize: 20 }} />;
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '80px',
          backgroundImage: 'url(/src/assets/HeaderBanorte.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          zIndex: theme.zIndex.appBar,
          borderBottom: '1px solid #E0E0E0'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2,
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            Reportes - Banorte Business Rules
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            ref={notificationsRef}
            onClick={handleNotificationsToggle}
            sx={{ 
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <IconButton 
            ref={profileRef}
            onClick={handleProfileToggle}
            sx={{ 
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
            }}
          >
            <AccountCircleIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : desktopSidebarOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              top: '80px',
              height: 'calc(100vh - 80px)',
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
        {/* Reports Main Content */}
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
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 600, 
                color: '#333', 
                mb: 1 
              }}>
                Reportes de reglas de negocio
              </Typography>
              <Typography variant="body1" sx={{ color: '#666' }}>
                Análisis y estadísticas del sistema de reglas
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Tooltip title="Actualizar datos">
                <IconButton 
                  onClick={refreshData}
                  disabled={loading}
                  sx={{ 
                    backgroundColor: '#f5f5f5',
                    '&:hover': { backgroundColor: '#e0e0e0' }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                sx={{
                  borderColor: '#EB0029',
                  color: '#EB0029',
                  '&:hover': {
                    backgroundColor: 'rgba(235, 0, 41, 0.04)',
                    borderColor: '#D32F2F'
                  }
                }}
              >
                Filtrar
              </Button>
              
              <Button
                variant="contained"
                startIcon={<GetAppIcon />}
                onClick={handleExportPDF}
                disabled={loading}
                sx={{
                  bgcolor: '#EB0029',
                  '&:hover': { bgcolor: '#D32F2F' }
                }}
              >
                Exportar PDF/CSV
              </Button>
            </Box>
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Active Rules Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '140px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #e0e0e0',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                },
                transition: 'all 0.3s ease'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 24, mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                      Reglas activas:
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                    {loading ? <CircularProgress size={24} /> : reportsData.activeRules || 19}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Inactive Rules Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '140px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #e0e0e0',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                },
                transition: 'all 0.3s ease'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PauseCircleIcon sx={{ color: '#ff9800', fontSize: 24, mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                      Reglas inactivas:
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {loading ? <CircularProgress size={24} /> : reportsData.inactiveRules || 8}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Simulation Rules Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '140px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #e0e0e0',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                },
                transition: 'all 0.3s ease'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PlayCircleIcon sx={{ color: '#2196f3', fontSize: 24, mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                      Reglas en simulación:
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                    {loading ? <CircularProgress size={24} /> : reportsData.simulationRules || 1}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Total Users Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '140px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #e0e0e0',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                },
                transition: 'all 0.3s ease'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <GroupIcon sx={{ color: '#9c27b0', fontSize: 24, mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                      Usuarios totales:
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                    {loading ? <CircularProgress size={24} /> : reportsData.totalUsers || 121304}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Active Users Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '140px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #e0e0e0',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                },
                transition: 'all 0.3s ease'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 24, mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                      Usuarios Activos:
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                    {loading ? <CircularProgress size={24} /> : reportsData.activeUsers || 34678}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Detailed Information Cards */}
          <Grid container spacing={3}>
            {/* Rule Usage Statistics */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '12px'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: '#333', 
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <AssessmentIcon sx={{ mr: 1, color: '#EB0029' }} />
                    Estadísticas de Uso
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                      ID Regla más usada:
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#EB0029', fontWeight: 600 }}>
                      {loading ? '...' : reportsData.mostUsedRuleId || '97389273'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                      ID Regla menos usada:
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#666', fontWeight: 600 }}>
                      {loading ? '...' : reportsData.leastUsedRuleId || '73892747'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Rules Activity */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '12px'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: '#333', 
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <HistoryIcon sx={{ mr: 1, color: '#EB0029' }} />
                    Actividad Reciente
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                      Última regla creada:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                      • 98403298
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Creada el 08/09/2025 - 17:13
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
                      Publicada el 11/09/2025 - usuarios afectados: 12567
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                      Última regla modificada:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                      • ID de usuario: 123443
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Modificada el 07/09/2025 - 12:02
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
                      ID regla: 09738982
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Success Rate */}
            <Grid item xs={12}>
              <Card sx={{ 
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '12px'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      color: '#333',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <TrendingUpIcon sx={{ mr: 1, color: '#EB0029' }} />
                      Regla más exitosa
                    </Typography>
                    
                    <Button
                      variant="contained"
                      startIcon={<GetAppIcon />}
                      onClick={handleExportCSV}
                      disabled={loading}
                      sx={{
                        bgcolor: '#666',
                        '&:hover': { bgcolor: '#555' }
                      }}
                    >
                      Exportar PDF/CSV
                    </Button>
                  </Box>
                  
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                          ID de la regla:
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 600, mb: 2 }}>
                          87329839
                        </Typography>
                        
                        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                          Detalles:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#333', mb: 1 }}>
                          • Creada el 237/02/2025 - 11:33
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#333', mb: 1 }}>
                          • Publicada el 28/02/2025
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#333' }}>
                          • Usuarios afectados: 90321
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          Tasa de éxito
                        </Typography>
                        <Typography variant="h3" sx={{ 
                          color: '#4caf50', 
                          fontWeight: 700,
                          display: 'block'
                        }}>
                          95.2%
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
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
                      <Close />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          backgroundColor: '#EB0029',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}
                      >
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: 'white', 
                            fontWeight: 600 
                          }}
                        >
                          {userData.name.charAt(0).toUpperCase()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600,
                            color: '#333' 
                          }}
                        >
                          {userData.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#666',
                            fontSize: '12px'
                          }}
                        >
                          ID: {userData.userId}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <EmailIcon sx={{ fontSize: 16, mr: 1, color: '#666' }} />
                        <Typography variant="body2" sx={{ color: '#333' }}>
                          {userData.email}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <ScheduleIcon sx={{ fontSize: 16, mr: 1, color: '#666' }} />
                        <Typography variant="body2" sx={{ color: '#333' }}>
                          Último acceso: {userData.lastLogin}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BadgeIcon sx={{ fontSize: 16, mr: 1, color: '#666' }} />
                        <Typography variant="body2" sx={{ color: '#333' }}>
                          Rol: Administrador
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        fullWidth
                        startIcon={<KeyIcon />}
                        onClick={handleChangePasswordOpen}
                        sx={{
                          justifyContent: 'flex-start',
                          color: '#666',
                          '&:hover': { backgroundColor: '#f0f0f0' }
                        }}
                      >
                        Cambiar Contraseña
                      </Button>
                      
                      <Button
                        fullWidth
                        startIcon={<ExitToAppIcon />}
                        onClick={handleLogoutClick}
                        sx={{
                          justifyContent: 'flex-start',
                          color: '#d32f2f',
                          '&:hover': { backgroundColor: '#ffebee' }
                        }}
                      >
                        Cerrar Sesión
                      </Button>
                    </Box>
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
                maxHeight: 500,
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
                      <Close />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {notifications.length === 0 ? (
                      <Box sx={{ p: 4, textAlign: 'center', color: '#666' }}>
                        <NotificationsIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                        <Typography>No hay notificaciones</Typography>
                      </Box>
                    ) : (
                      notifications.map((notification) => (
                        <Box
                          key={notification.id}
                          sx={{
                            p: 2,
                            borderBottom: '1px solid #f0f0f0',
                            cursor: 'pointer',
                            backgroundColor: notification.read ? 'transparent' : 'rgba(235, 0, 41, 0.02)',
                            '&:hover': { backgroundColor: '#f8f9fa' },
                            '&:last-child': { borderBottom: 'none' }
                          }}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <Box sx={{ mr: 2, mt: 0.5 }}>
                              {getNotificationIcon(notification.type)}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography 
                                  variant="subtitle2" 
                                  sx={{ 
                                    fontWeight: 600,
                                    color: '#333'
                                  }}
                                >
                                  {notification.title}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: '#999',
                                    fontSize: '11px'
                                  }}
                                >
                                  {formatTimeAgo(notification.timestamp)}
                                </Typography>
                              </Box>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: '#666',
                                  fontSize: '13px',
                                  lineHeight: 1.4
                                }}
                              >
                                {notification.message}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onClose={handleChangePasswordClose} maxWidth="sm" fullWidth>
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
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

export default Reports;
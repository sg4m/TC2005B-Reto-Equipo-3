import React, { useState, useRef, useEffect } from 'react';
import authService from '../services/authService';
import { useNotification } from '../hooks/useNotification';
import { useGlobalNotifications } from '../hooks/useGlobalNotifications.jsx';
import { useHistorial } from '../hooks/useHistorial';
import {
  Box, Typography, Button, IconButton, 
  Drawer, List, ListItem, ListItemButton, ListItemText,
  useTheme, useMediaQuery, Badge, Popper, Paper, 
  ClickAwayListener, Fade, Divider, Dialog, DialogTitle, 
  DialogContent, DialogContentText, DialogActions, 
  FormControl, InputLabel, OutlinedInput, Container,
  Card, CardContent, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, TextField,
  InputAdornment, Tooltip, CircularProgress, TablePagination,
  Select, MenuItem
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
  Close as CloseIcon,
  ExitToApp as ExitToAppIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  Badge as BadgeIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  AccessTime as AccessTimeIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useNavigation } from '../hooks/useNavigation';

const Historial = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('Historial');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  // Change password dialog states
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  
  // Historial page states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Historial hook for backend integration
  const { 
    historialData, 
    filteredData, 
    stats, 
    loading, 
    error: historialError, 
    fetchFilteredData, 
    refreshData 
  } = useHistorial();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { goToLogin, goToDashboard, goToReglas, goToSimulador, goToReports, goToHistorial } = useNavigation();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  
  // Global notifications hook
  const { notifications, unreadCount, markAsRead, markAllAsRead, addNotification } = useGlobalNotifications();
  
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const welcomeShownRef = useRef(false);
  const lastErrorRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  


  // Check authentication status on component mount
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      goToLogin();
    } else if (!welcomeShownRef.current) {
      // Welcome notifications removed - no longer needed on each page visit
      welcomeShownRef.current = true;
    }
    // Data loading is now handled by useHistorial hook automatically
  }, [goToLogin]);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);


  
  // Load historial data (now connected to backend)
  const loadHistorialData = () => {
    refreshData();
  };
  
  // Handle search with simple debouncing
  const handleSearchChange = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    setPage(0); // Reset to first page when search changes
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      if (fetchFilteredData && !loading) {
        fetchFilteredData(newSearchTerm, filterBy);
      }
    }, 300);
  };
  
  // Handle filter change
  const handleFilterChange = (event) => {
    const newFilterBy = event.target.value;
    setFilterBy(newFilterBy);
    setPage(0); // Reset to first page when filter changes
    
    // Apply filter immediately
    if (fetchFilteredData && !loading) {
      fetchFilteredData(searchTerm, newFilterBy);
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    loadHistorialData();
    addNotification({
      type: 'success',
      title: 'Datos Actualizados',
      message: 'El historial de reglas ha sido actualizado'
    });
  };
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Use filtered data from backend
  const filteredRules = filteredData || [];
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    // Handle both Date objects and date strings
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return 'Fecha inválida';
    
    return dateObj.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Note: Timestamp updates now handled by global notifications context

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
    
    switch (itemText) {
      case 'Dashboard':
        goToDashboard();
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
        break;
      default:
        break;
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
    authService.logout();
    addNotification({
      type: 'info',
      title: 'Sesión Cerrada',
      message: 'Has cerrado sesión exitosamente'
    });
    showInfo('Sesión cerrada exitosamente');
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

  const handleChangePasswordOpen = () => {
    setChangePasswordOpen(true);
    setProfileOpen(false);
  };

  const handleChangePasswordClose = () => {
    setChangePasswordOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChangePasswordSubmit = async () => {
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
    role: 'Administrador'
  } : {
    name: 'Usuario Invitado',
    email: 'guest@banorte.com',
    lastLogin: 'No disponible',
    userId: 'GUEST',
    role: 'Invitado'
  };

  const drawerWidth = 240;

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
        return <WarningIcon sx={{ color: '#F44336', fontSize: '16px' }} />;
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
          
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setActiveSection('Historial')}>
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
          BackdropProps={{
            sx: {
              backgroundColor: isMobile ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
            }
          }}
          ModalProps={{
            keepMounted: true,
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
        {/* Historial Main Content */}
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
                Historial de reglas de negocio
              </Typography>
              <Typography variant="body1" sx={{ color: '#666' }}>
                Registro de todas las reglas creadas en el sistema
              </Typography>
            </Box>
            
            <Tooltip title="Actualizar datos">
              <span>
                <IconButton 
                  onClick={handleRefresh}
                  disabled={loading}
                  sx={{ 
                    backgroundColor: '#f5f5f5',
                    '&:hover': { backgroundColor: '#e0e0e0' }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          {/* Search and Filter Section */}
          <Box sx={{ 
            mb: 3,
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ 
                color: '#666',
                '&.Mui-focused': { color: '#EB0029' }
              }}>
                Filtrar por
              </InputLabel>
              <Select
                value={filterBy}
                onChange={handleFilterChange}
                label="Filtrar por"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ddd',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#EB0029',
                  },
                }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="id">ID</MenuItem>
                <MenuItem value="time">Tiempo</MenuItem>
                <MenuItem value="summary">Resumen</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              placeholder={
                filterBy === 'all' ? 'Buscar en todos los campos...' :
                filterBy === 'id' ? 'Buscar por ID...' :
                filterBy === 'time' ? 'Buscar por fecha/hora...' :
                filterBy === 'summary' ? 'Buscar por resumen...' :
                'Buscar...'
              }
              value={searchTerm}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              sx={{
                flexGrow: 1,
                minWidth: '300px',
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#EB0029',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#666' }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <Typography variant="body2" sx={{ color: '#666' }}>
              {filteredRules.length} reglas encontradas
            </Typography>
          </Box>

          {/* Show "No information" message when no data */}
          {!loading && historialData.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8, 
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #e0e0e0'
            }}>
              <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>
                {historialError ? 'Error al cargar datos' : 'No hay información por mostrar'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>
                {historialError ? historialError : 'El historial de reglas aparecerá aquí cuando esté disponible'}
              </Typography>
            </Box>
          ) : (
            /* Rules History Table */
            <Card sx={{ overflow: 'hidden', border: '1px solid #e0e0e0' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#333' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#333' }}>Tiempo</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#333' }}>Resumen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ textAlign: 'center', py: 4 }}>
                        <CircularProgress size={32} sx={{ color: '#EB0029' }} />
                        <Typography variant="body2" sx={{ mt: 2, color: '#666' }}>
                          Cargando historial de reglas...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredRules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" sx={{ color: '#666' }}>
                          {searchTerm ? 'No se encontraron reglas que coincidan con la búsqueda' : 'No hay reglas en el historial'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRules
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((rule) => (
                        <TableRow key={rule.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#EB0029' }}>
                              {rule.id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              {formatDate(rule.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: '#333' }}>
                              {rule.summary}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination */}
            {!loading && filteredRules.length > 0 && (
              <TablePagination
                component="div"
                count={filteredRules.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                sx={{
                  borderTop: '1px solid #e0e0e0',
                  backgroundColor: '#f8f9fa'
                }}
              />
            )}
          </Card>
          )}
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

export default Historial;
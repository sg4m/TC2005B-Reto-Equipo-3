import React, { useState, useRef, useEffect } from 'react';
import authService from '../services/authService';
import { rulesService } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import { useGlobalNotifications } from '../hooks/useGlobalNotifications.jsx';
import { useBusinessRules } from '../hooks/useBusinessRules';
import { generateTrama } from '../services/tramaService';
import {
  Box, Typography, Button, IconButton,
  Drawer, List, ListItem, ListItemButton, ListItemText,
  useTheme, useMediaQuery, Badge, Popper, Paper,
  ClickAwayListener, Fade, Divider, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions,
  FormControl, InputLabel, OutlinedInput, Container, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  CircularProgress, Chip, TextField, Grid, MenuItem, Select, Tooltip
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
  Download as DownloadIcon,
  TableChart as CsvIcon,
  PictureAsPdf as PdfIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigation } from '../hooks/useNavigation';

const Reglas = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('Reglas');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Change password dialog states
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { goToLogin, goToDashboard, goToReglas, goToSimulador, goToReports, goToHistorial } = useNavigation();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  // Global notifications hook
  const { notifications, unreadCount, markAsRead, markAllAsRead, addNotification } = useGlobalNotifications();

  // Rules management states
  const [businessRules, setBusinessRules] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [rulesError, setRulesError] = useState(null);

  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const welcomeShownRef = useRef(false);
  const lastErrorRef = useRef(null);
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Estado para el modal de detalles y edición
  const [openModal, setOpenModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [editedRule, setEditedRule] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  
  // Estado para el modal de confirmación de eliminación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Function to load all rules for management
  const refreshRules = async () => {
    setRulesLoading(true);
    setRulesError(null);
    try {
      const currentUser = authService.getCurrentUser?.();
      const userId = currentUser?.id || null;
      const rules = await rulesService.getAllRules(userId);
      setBusinessRules(rules || []);
    } catch (error) {
      console.error('Error loading rules:', error);
      setRulesError(error.message);
      setBusinessRules([]);
    } finally {
      setRulesLoading(false);
    }
  };

  // Check authentication status and load rules on component mount
  useEffect(() => {
    //if (!authService.isAuthenticated()) {
    // User is not authenticated, redirect to login
    //goToLogin();
    //} else if (!welcomeShownRef.current) {
    // User is authenticated - no need for welcome notifications on every page visit
    //welcomeShownRef.current = true;
    //}
    
    // Load all rules for management
    refreshRules();
  }, []);

  // Auto-refresh notification timestamps every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => [...prev]);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

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

  // Funciones para el modal de detalles
  const handleViewDetails = (rule) => {
    setSelectedRule(rule);
    setEditedRule({
      regla_estandarizada: rule.regla_estandarizada?.xml || '', // Set XML content for editing
      monto_minimo: rule.monto_minimo,
      monto_maximo: rule.monto_maximo,
      region: rule.region,
      tipo_transaccion: rule.tipo_transaccion
    });
    setIsEditing(false);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRule(null);
    setEditedRule({});
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedRule({ ...selectedRule });
    }
  };

  const handleInputChange = (field, value) => {
    setEditedRule(prev => {
      if (field === 'regla_estandarizada') {
        return {
          ...prev,
          regla_estandarizada: {
            ...prev.regla_estandarizada,
            xml: value // Update only the XML content
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleSaveChanges = async () => {
    try {
      // Validar y estructurar el objeto editedRule antes de enviarlo
      const formattedRule = {
        ...editedRule,
        regla_estandarizada: {
          xml: editedRule.regla_estandarizada?.xml || ''
        }
      };

      // Llamar al API para actualizar la regla
      await rulesService.updateRule(selectedRule.id_regla, formattedRule);
      
      // Actualizar la regla seleccionada
      setSelectedRule({ ...formattedRule });
      setIsEditing(false);
      
      // Refrescar la lista de reglas
      refreshRules();
      
      showSuccess('Regla actualizada exitosamente');
    } catch (error) {
      console.error('Error updating rule:', error);
      showError('Error al actualizar la regla');
    }
  };

  // Funciones para eliminar regla
  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      // Llamar al API para eliminar la regla
      await rulesService.deleteRule(selectedRule.id_regla);
      
      // Cerrar todos los modales
      setDeleteConfirmOpen(false);
      setOpenModal(false);
      setSelectedRule(null);
      setEditedRule({});
      setIsEditing(false);
      
      // Refrescar la lista de reglas
      refreshRules();
      
      showSuccess('Regla eliminada exitosamente');
      addNotification({
        type: 'info',
        title: 'Regla Eliminada',
        message: `La regla ${selectedRule.id_display} ha sido eliminada del sistema`
      });
    } catch (error) {
      console.error('Error deleting rule:', error);
      showError('Error al eliminar la regla');
    } finally {
      setIsDeleting(false);
    }
  };

  // Export Gemini returned rule (prefer XML). Small utility to download the XML returned by Gemini.
  const handleExportGeminiXML = () => {
    if (!selectedRule?.regla_estandarizada) {
      showWarning?.('No hay contenido para exportar');
      return;
    }

    let content = '';
    const g = selectedRule.regla_estandarizada;
    try {
      if (typeof g === 'string') {
        content = g;
      } else if (typeof g === 'object') {
        // Prefer an 'xml' property if present
        if (g.xml) content = g.xml;
        else content = JSON.stringify(g, null, 2);
      } else {
        content = String(g);
      }
    } catch (e) {
      content = String(g || '');
    }

    // Remove code fence if present
    content = content.replace(/```(?:xml)?\n([\s\S]*?)```/i, '$1').trim();

    // Try to extract only the XML part. Prefer <MappedPayment>...</MappedPayment>
    let xmlOnly = '';
    const mappedMatch = content.match(/<MappedPayment[\s\S]*?<\/MappedPayment>/i);
    if (mappedMatch) {
      xmlOnly = mappedMatch[0];
    } else {
      // Fallback: extract the first well-formed XML element (simple heuristic)
      const anyXmlMatch = content.match(/<([A-Za-z][A-Za-z0-9:_-]*)(?:\s[^>]*)?>[\s\S]*?<\/\1>/);
      if (anyXmlMatch) xmlOnly = anyXmlMatch[0];
      else xmlOnly = '';
    }

    if (!xmlOnly) {
      showWarning?.('No se encontró contenido XML en la respuesta de la IA');
      return;
    }

    content = xmlOnly.trim();

    const blob = new Blob([content], { type: 'application/xml' });
    const filename = `regla_${selectedRule?.id_regla || selectedRule?.id || selectedRule?.id_display || 'export'}_gemini.xml`;

    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }

    showSuccess?.('Descarga iniciada');
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
    userId: currentUser.id || 'N/A',
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

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Fecha inválida';
    
    return dateObj.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'activa':
        return 'success';
      case 'inactiva':
        return 'default';
      case 'simulacion':
        return 'warning';
      default:
        return 'info';
    }
  };

  // Paginated data
  const paginatedRules = businessRules.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleDownloadTrama = () => {
    try {
      // Validar que selectedRule.regla_estandarizada tenga la estructura esperada
      if (!selectedRule || !selectedRule.regla_estandarizada) {
        throw new Error('La regla seleccionada no contiene datos válidos para generar la trama.');
      }

      const trama = generateTrama(selectedRule.regla_estandarizada);
      const blob = new Blob([trama], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `trama_${selectedRule.id_regla || 'export'}.txt`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating trama:', error);
      showError(error.message || 'Error al generar la trama');
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

          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setActiveSection('Reglas')}>
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
          padding: 2,
          overflow: 'auto'
        }}
      >
        <Box sx={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <Box sx={{
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
                Gestión de reglas de negocio
              </Typography>
              <Typography variant="body1" sx={{ color: '#666' }}>
                Manejo y gestion de todas las reglas del negocio
              </Typography>
            </Box>
            <Box sx={{ mt: 2, mb: 3 }}>
              {rulesError && (
                <Box sx={{ 
                  p: 2, 
                  mb: 2, 
                  backgroundColor: '#ffebee', 
                  borderRadius: '8px',
                  border: '1px solid #ffcdd2'
                }}>
                  <Typography color="error">
                    Error: {rulesError}
                  </Typography>
                </Box>
              )}

              {rulesLoading ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  py: 8 
                }}>
                  <CircularProgress sx={{ color: '#EB0029' }} />
                  <Typography sx={{ ml: 2, color: '#666' }}>
                    Cargando reglas de negocio...
                  </Typography>
                </Box>
              ) : (
                <>
                  <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <Table sx={{ minWidth: 650 }}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#333' }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333' }}>Usuario</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333' }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333' }}>Empresa</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333' }}>Fecha Creación</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333' }}>Estado</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333' }}>Descripción</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {businessRules.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                              <Typography sx={{ color: '#666' }}>
                                No hay reglas de negocio disponibles
                              </Typography>
                              <Button 
                                variant="outlined" 
                                onClick={refreshRules}
                                sx={{ mt: 2, color: '#EB0029', borderColor: '#EB0029' }}
                              >
                                Recargar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedRules.map((rule) => (
                            <TableRow 
                              key={rule.id_regla}
                              onMouseEnter={() => setHoveredRow(rule.id_regla)}
                              onMouseLeave={() => setHoveredRow(null)}
                              sx={{ 
                                '&:hover': { backgroundColor: '#f9f9f9' },
                                position: 'relative'
                              }}
                            >
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {rule.id_display}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {rule.usuario}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                  {rule.email}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {rule.empresa}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {formatDate(rule.fecha_creacion)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={rule.status}
                                  size="small"
                                  color={getStatusColor(rule.status)}
                                  sx={{ fontWeight: 500 }}
                                />
                              </TableCell>
                              <TableCell sx={{ position: 'relative' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      maxWidth: '200px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}>
                                    {rule.descripcion}
                                  </Typography>
                                  {hoveredRow === rule.id_regla && (
                                    <Tooltip title="Ver detalles">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleViewDetails(rule)}
                                        sx={{
                                          ml: 1,
                                          bgcolor: 'primary.main',
                                          color: 'white',
                                          '&:hover': {
                                            bgcolor: 'primary.dark'
                                          },
                                          transition: 'all 0.2s ease-in-out'
                                        }}
                                      >
                                        <VisibilityIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {businessRules.length > 0 && (
                    <TablePagination
                      component="div"
                      count={businessRules.length}
                      page={page}
                      onPageChange={handleChangePage}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      rowsPerPageOptions={[5, 10, 25, 50]}
                      labelRowsPerPage="Filas por página:"
                      labelDisplayedRows={({ from, to, count }) => 
                        `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                      }
                      sx={{
                        '& .MuiTablePagination-select': {
                          color: '#EB0029'
                        },
                        '& .MuiTablePagination-actions button': {
                          color: '#EB0029'
                        }
                      }}
                    />
                  )}
                </>
              )}
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

      {/* Modal de detalles de regla */}
      <Dialog 
        open={openModal} 
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            minHeight: '600px',
            maxHeight: '90vh',
            m: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#EB0029', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
          px: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <RuleIcon sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                {isEditing ? 'Editar Regla' : 'Detalles de Regla'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                ID: {selectedRule?.id_display}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isEditing && (
              <>
                <Tooltip title="Editar">
                  <IconButton 
                    onClick={handleEditToggle}
                    sx={{ 
                      color: 'white', 
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton 
                    onClick={handleDeleteClick}
                    sx={{ 
                      color: 'white', 
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '&:hover': { bgcolor: 'rgba(255,0,0,0.3)' }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <IconButton 
              onClick={handleCloseModal}
              sx={{ 
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, overflow: 'auto' }}>
          {selectedRule && (
            <Box sx={{ p: 4, pb: 10 }}>
              {/* Header Info Section */}
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                bgcolor: '#f8f9fa', 
                borderRadius: 2,
                border: '1px solid #e9ecef'
              }}>
                <Typography variant="h6" sx={{ color: '#EB0029', mb: 2, fontWeight: 600 }}>
                  Información General
                </Typography>
                <Grid container spacing={3}>
                  {/* ID de la regla (no editable) */}
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 500 }}>
                        ID de Regla
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        p: 2, 
                        bgcolor: '#e9ecef', 
                        borderRadius: 1, 
                        fontFamily: 'monospace',
                        fontWeight: 600
                      }}>
                        {selectedRule.id_display}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Estado */}
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 500 }}>
                        Estado
                      </Typography>
                      {isEditing ? (
                        <TextField
                          fullWidth
                          select
                          value={editedRule.status || selectedRule.status}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          variant="outlined"
                          size="small"
                        >
                          <MenuItem value="Activa">Activa</MenuItem>
                          <MenuItem value="Inactiva">Inactiva</MenuItem>
                        </TextField>
                      ) : (
                        <Chip 
                          label={selectedRule.status}
                          size="medium"
                          color={selectedRule.status === 'Activa' ? 'success' : 
                                selectedRule.status === 'Pendiente' ? 'warning' : 'error'}
                          sx={{ fontWeight: 500, px: 2 }}
                        />
                      )}
                    </Box>
                  </Grid>

                  {/* Fecha de creación */}
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 500 }}>
                        Fecha de Creación
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        p: 2, 
                        bgcolor: '#e9ecef', 
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <ScheduleIcon sx={{ fontSize: 18, color: '#666' }} />
                        {formatDate(selectedRule.fecha_creacion)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* User Details Section */}
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                bgcolor: '#fff', 
                borderRadius: 2,
                border: '1px solid #e9ecef',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h6" sx={{ color: '#EB0029', mb: 3, fontWeight: 600 }}>
                  Detalles del Usuario
                </Typography>
                <Grid container spacing={3}>
                  {/* Usuario */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Usuario"
                      value={isEditing ? editedRule.usuario || '' : selectedRule.usuario}
                      onChange={(e) => isEditing && handleInputChange('usuario', e.target.value)}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: <PersonIcon sx={{ color: '#666', mr: 1 }} />
                      }}
                    />
                  </Grid>

                  {/* Email */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={isEditing ? editedRule.email || '' : selectedRule.email}
                      onChange={(e) => isEditing && handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ color: '#666', mr: 1 }} />
                      }}
                    />
                  </Grid>

                  {/* Empresa */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Empresa"
                      value={isEditing ? editedRule.empresa || '' : selectedRule.empresa}
                      onChange={(e) => isEditing && handleInputChange('empresa', e.target.value)}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: <BadgeIcon sx={{ color: '#666', mr: 1 }} />
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Description Section */}
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                bgcolor: '#fff', 
                borderRadius: 2,
                border: '1px solid #e9ecef',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h6" sx={{ color: '#EB0029', mb: 3, fontWeight: 600 }}>
                  Descripción de la Regla
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Descripción"
                  value={isEditing ? editedRule.regla_estandarizada?.xml || '' : (
                    selectedRule?.regla_estandarizada?.xml || ''
                  )}
                  onChange={(e) => {
                    if (isEditing) {
                      const updatedXML = e.target.value;
                      handleInputChange('regla_estandarizada', updatedXML);
                    }
                  }}
                  disabled={!isEditing}
                  variant="outlined"
                  sx={{ 
                    '& .MuiInputBase-root': {
                      fontSize: '0.95rem',
                      lineHeight: 1.3,
                      fontFamily: 'monospace'
                    }
                  }}
                />
              </Box>

              {/* Optional Fields Section - Only show if data exists or in edit mode */}
              {(selectedRule.monto_minimo || selectedRule.monto_maximo || selectedRule.region || 
                selectedRule.tipo_transaccion || isEditing) && (
                <Box sx={{ 
                  p: 3, 
                  bgcolor: '#fff', 
                  borderRadius: 2,
                  border: '1px solid #e9ecef',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <Typography variant="h6" sx={{ color: '#EB0029', mb: 3, fontWeight: 600 }}>
                    Configuración Adicional
                  </Typography>
                  <Grid container spacing={3}>
                    {(selectedRule.monto_minimo || isEditing) && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Monto Mínimo"
                          type="number"
                          value={isEditing ? editedRule.monto_minimo || '' : selectedRule.monto_minimo}
                          onChange={(e) => isEditing && handleInputChange('monto_minimo', e.target.value)}
                          disabled={!isEditing}
                          variant="outlined"
                          size="small"
                          InputProps={{
                            startAdornment: <Typography sx={{ color: '#666', mr: 1 }}>$</Typography>
                          }}
                        />
                      </Grid>
                    )}

                    {(selectedRule.monto_maximo || isEditing) && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Monto Máximo"
                          type="number"
                          value={isEditing ? editedRule.monto_maximo || '' : selectedRule.monto_maximo}
                          onChange={(e) => isEditing && handleInputChange('monto_maximo', e.target.value)}
                          disabled={!isEditing}
                          variant="outlined"
                          size="small"
                          InputProps={{
                            startAdornment: <Typography sx={{ color: '#666', mr: 1 }}>$</Typography>
                          }}
                        />
                      </Grid>
                    )}

                    {(selectedRule.region || isEditing) && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Región"
                          value={isEditing ? editedRule.region || '' : selectedRule.region}
                          onChange={(e) => isEditing && handleInputChange('region', e.target.value)}
                          disabled={!isEditing}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                    )}

                    {(selectedRule.tipo_transaccion || isEditing) && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Tipo de Transacción"
                          value={isEditing ? editedRule.tipo_transaccion || '' : selectedRule.tipo_transaccion}
                          onChange={(e) => isEditing && handleInputChange('tipo_transaccion', e.target.value)}
                          disabled={!isEditing}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          gap: 2, 
          borderTop: '1px solid #e9ecef',
          bgcolor: '#f8f9fa'
        }}>
          {isEditing ? (
            <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={handleEditToggle}
                startIcon={<CancelIcon />}
                variant="outlined"
                sx={{
                  color: '#666',
                  borderColor: '#ccc',
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    borderColor: '#999'
                  }
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveChanges}
                variant="contained"
                startIcon={<SaveIcon />}
                sx={{
                  bgcolor: '#EB0029',
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(235, 0, 41, 0.3)',
                  '&:hover': {
                    bgcolor: '#D32F2F',
                    boxShadow: '0 4px 12px rgba(235, 0, 41, 0.4)'
                  }
                }}
              >
                Guardar Cambios
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'flex-end' }}>
              {selectedRule?.regla_estandarizada && (
                <Button
                  onClick={handleExportGeminiXML}
                  startIcon={<DownloadIcon />}
                  variant="outlined"
                  sx={{
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    px: 3,
                    py: 1.5,
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(25,118,210,0.04)'
                    }
                  }}
                >
                  Exportar XML
                </Button>
              )}
              <Button
                onClick={handleDownloadTrama}
                variant="contained"
                startIcon={<DownloadIcon />}
                sx={{
                  bgcolor: '#1976D2',
                  px: 2,
                  py: 1,
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    bgcolor: '#1565C0',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)'
                  }
                }}
              >
                Descargar Trama
              </Button>
              <Button
                onClick={handleCloseModal}
                variant="outlined"
                sx={{
                  borderColor: '#EB0029',
                  color: '#EB0029',
                  px: 3,
                  py: 1.5,
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: '#D32F2F',
                    backgroundColor: 'rgba(235, 0, 41, 0.04)'
                  }
                }}
              >
                Cerrar
              </Button>
            </Box>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          color: '#d32f2f',
          pb: 2
        }}>
          <DeleteIcon sx={{ color: '#d32f2f' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Confirmar Eliminación
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
              Esta acción no se puede deshacer
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pb: 3 }}>
          <Box sx={{ 
            p: 3, 
            bgcolor: '#fff3e0', 
            borderRadius: 2, 
            border: '1px solid #ffb74d',
            mb: 3
          }}>
            <Typography variant="body1" sx={{ color: '#e65100', fontWeight: 500, mb: 1 }}>
              ⚠️ Advertencia
            </Typography>
            <Typography variant="body2" sx={{ color: '#bf360c' }}>
              Estás a punto de eliminar permanentemente esta regla de negocio del sistema.
            </Typography>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 2, color: '#333' }}>
            ¿Estás seguro de que deseas eliminar la siguiente regla?
          </Typography>
          
          {selectedRule && (
            <Box sx={{ 
              p: 3, 
              bgcolor: '#f5f5f5', 
              borderRadius: 2, 
              border: '1px solid #e0e0e0'
            }}>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                <strong>ID:</strong> {selectedRule.id_display}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                <strong>Usuario:</strong> {selectedRule.usuario}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                <strong>Empresa:</strong> {selectedRule.empresa}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                <strong>Descripción:</strong> {selectedRule.descripcion?.substring(0, 100)}...
              </Typography>
            </Box>
          )}
          
          <Typography variant="body2" sx={{ mt: 3, color: '#666', fontStyle: 'italic' }}>
            Esta regla será eliminada de la base de datos y no podrá ser recuperada.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          gap: 2, 
          borderTop: '1px solid #e0e0e0' 
        }}>
          <Button
            onClick={handleDeleteCancel}
            disabled={isDeleting}
            variant="outlined"
            sx={{
              color: '#666',
              borderColor: '#ccc',
              px: 3,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                borderColor: '#999'
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            variant="contained"
            startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            sx={{
              bgcolor: '#d32f2f',
              px: 3,
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#b71c1c'
              },
              '&:disabled': {
                bgcolor: '#ffcdd2',
                color: '#666'
              }
            }}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar Regla'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reglas;
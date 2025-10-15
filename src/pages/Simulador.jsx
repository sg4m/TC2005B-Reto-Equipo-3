import React, { useState, useRef, useEffect } from 'react';
import authService from '../services/authService';
import { rulesService, aiService } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import { useGlobalNotifications } from '../hooks/useGlobalNotifications.jsx';
import simulationService from '../services/simulationService';
import {
  Box, Typography, Button, IconButton,
  Drawer, List, ListItem, ListItemButton, ListItemText,
  useTheme, useMediaQuery, Badge, Popper, Paper,
  ClickAwayListener, Fade, Divider, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions,
  FormControl, InputLabel, OutlinedInput, Container,
  Tooltip, Card, CardContent, CardActions, Stack, TextField,
  Select, MenuItem, CircularProgress, Tabs, Tab, Alert,
  Chip, LinearProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Accordion,
  AccordionSummary, AccordionDetails, Grid
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
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Backup as BackupIcon,
  SimCardDownloadOutlined as SimCardDownloadOutlinedIcon,
  CloudUpload as CloudUploadIcon,
  TextSnippet as TextSnippetIcon,
  PlayArrow as PlayArrowIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useNavigation } from '../hooks/useNavigation';

const Simulador = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('Simulador');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Change password dialog states
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  // Business rule selection states
  const [selectedRuleId, setSelectedRuleId] = useState('');
  const [selectedRule, setSelectedRule] = useState(null);

  // Simulation states
  const [testInputType, setTestInputType] = useState(0); // 0 = text, 1 = file
  const [testText, setTestText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [simulationError, setSimulationError] = useState(null);

  // Simulation history modal states
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [simulationHistory, setSimulationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedSimulationDetails, setSelectedSimulationDetails] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { goToLogin, goToDashboard, goToReglas, goToSimulador, goToReports, goToHistorial } = useNavigation();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  // Global notifications hook
  const { notifications, unreadCount, markAsRead, markAllAsRead, addNotification } = useGlobalNotifications();

  // Rules management states - load ALL rules for simulation selection
  const [businessRules, setBusinessRules] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [rulesError, setRulesError] = useState(null);

  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const welcomeShownRef = useRef(false);
  const lastErrorRef = useRef(null);
  const fileInputRef = useRef(null);

  // Function to load all rules for simulation selection
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
    //goToLogin();
    //} else if (!welcomeShownRef.current) {
    // Welcome notifications removed - no longer needed on each page visit
    //welcomeShownRef.current = true;
    //}
    
    // Load all rules for simulation selection
    refreshRules();
  }, []);

  // Show error if rules failed to load
  useEffect(() => {
    if (rulesError && rulesError !== lastErrorRef.current) {
      showError('Error al cargar las reglas de negocio');
      lastErrorRef.current = rulesError;
    }
  }, [rulesError, showError]);

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

  // Handle rule selection
  const handleRuleSelection = (event) => {
    const ruleId = event.target.value;
    setSelectedRuleId(ruleId);
    
    // Find the selected rule details
    const rule = businessRules.find(rule => rule.id_regla === ruleId);
    setSelectedRule(rule);
  };

  // Handle refresh rules
  const handleRefreshRules = () => {
    refreshRules();
    showInfo('Actualizando lista de reglas...');
  };

  // Handle test input type change
  const handleTestInputTypeChange = (event, newValue) => {
    setTestInputType(newValue);
    // Reset simulation states when changing input type
    setSimulationResults(null);
    setSimulationError(null);
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

    // Validate file type (TXT, XML)
    const allowedTypes = ['text/plain', 'text/xml', 'application/xml'];
    const allowedExtensions = ['.txt', '.xml'];
    const hasValidType = allowedTypes.includes(file.type);
    const hasValidExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidType && !hasValidExtension) {
      showError('Solo se permiten archivos TXT o XML');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('El archivo no puede ser mayor a 5MB');
      return;
    }

    setSelectedFile(file);
    setSimulationResults(null);
    setSimulationError(null);
    showSuccess(`Archivo "${file.name}" cargado exitosamente`);
  showSuccess(`Archivo "${file.name}" cargado exitosamente`);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  // Handle simulation execution
  const handleRunSimulation = async () => {
    if (!selectedRule) {
      showError('Por favor selecciona una regla primero');
      return;
    }

    if (testInputType === 0 && !testText.trim()) {
      showError('Por favor ingresa datos de prueba');
      return;
    }

    if (testInputType === 1 && !selectedFile) {
      showError('Por favor selecciona un archivo');
      return;
    }

    setIsSimulating(true);
    setSimulationResults(null);
    setSimulationError(null);

    try {
      let result;
      
      if (testInputType === 0) {
        // Use AI mapping endpoint for text input (treat as file content)
        const currentUser = authService.getCurrentUser?.();
        const fileContent = testText;
        const fileType = 'txt';
        const aiResp = await aiService.processPaymentMapping({ fileContent, fileType, fileName: 'input_text' });
        setSimulationResults({ xml: aiResp?.xml, validation: aiResp?.validation, processing_notes: aiResp?.processing_notes });

        // Persist simulation to history
        try {
          await simulationService.saveSimulation({
            ruleId: selectedRule?.id_regla,
            inputType: 'text',
            inputData: fileContent,
            fileName: 'input_text',
            aiResponse: aiResp
          });
          addNotification({ type: 'success', title: 'Simulación guardada', message: `Simulación de regla ${selectedRule?.id_display || selectedRule?.id_regla} guardada en el historial` });
        } catch (saveErr) {
          console.error('Error saving simulation:', saveErr);
          showWarning('La simulación no pudo guardarse en el historial');
        }

      } else {
        // File simulation: read file content and call AI mapping
        const fileText = await selectedFile.text();
        const ext = selectedFile.name.split('.').pop().toLowerCase();
        const fileType = ext === 'xml' ? 'xml' : 'txt';
        const aiResp = await aiService.processPaymentMapping({ fileContent: fileText, fileType, fileName: selectedFile.name });
        setSimulationResults({ xml: aiResp?.xml, validation: aiResp?.validation, processing_notes: aiResp?.processing_notes });

        // Persist simulation to history
        try {
          await simulationService.saveSimulation({
            ruleId: selectedRule?.id_regla,
            inputType: 'file',
            inputData: fileText,
            fileName: selectedFile.name,
            aiResponse: aiResp
          });
          addNotification({ type: 'success', title: 'Simulación guardada', message: `Simulación de regla ${selectedRule?.id_display || selectedRule?.id_regla} guardada en el historial` });
        } catch (saveErr) {
          console.error('Error saving simulation:', saveErr);
          showWarning('La simulación no pudo guardarse en el historial');
        }
      }

      showSuccess('Simulación completada exitosamente');
      
      addNotification({
        type: 'success',
        title: 'Simulación Completada',
        message: `Regla ${selectedRule.id_display} simulada exitosamente`
      });

    } catch (error) {
      console.error('Simulation error:', error);
      setSimulationError(error.message);
      showError('Error en la simulación: ' + error.message);
    } finally {
      setIsSimulating(false);
    }
  };

  // Handle simulation history modal
  const handleViewHistory = async () => {
    if (!selectedRule) {
      showError('Por favor selecciona una regla primero');
      return;
    }

    setHistoryModalOpen(true);
    setLoadingHistory(true);
    
    try {
      const history = await simulationService.getSimulationHistory(selectedRule.id_regla);
      setSimulationHistory(history.simulations || []);
    } catch (error) {
      console.error('Error loading simulation history:', error);
      showError('Error al cargar el historial: ' + error.message);
      setSimulationHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCloseHistoryModal = () => {
    setHistoryModalOpen(false);
    setSimulationHistory([]);
    setSelectedSimulationDetails(null);
  };

  const handleViewSimulationDetails = async (simulationId) => {
    try {
      const details = await simulationService.getSimulationDetails(simulationId);
      setSelectedSimulationDetails(details.simulation || null);
    } catch (error) {
      console.error('Error loading simulation details:', error);
      showError('Error al cargar detalles: ' + error.message);
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

          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setActiveSection('Simulador')}>
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
                Simulador de reglas de negocio
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Tooltip title="Actualizar lista de reglas">
                <span>
                  <IconButton
                    onClick={handleRefreshRules}
                    disabled={rulesLoading}
                    sx={{
                      backgroundColor: '#f5f5f5',
                      '&:hover': { backgroundColor: '#e0e0e0' }
                    }}
                  >
                    {rulesLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
          <Container maxWidth="lg">
            <Paper sx={{ p: 4, mt: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ 
                color: '#EB0029', 
                fontWeight: 600,
                textAlign: 'center',
                mb: 4 
              }}>
                Simulador de Reglas de Negocio
              </Typography>

              {rulesError && (
                <Box sx={{ 
                  mb: 3, 
                  p: 3, 
                  bgcolor: '#fff3cd', 
                  border: '1px solid #ffeaa7',
                  borderRadius: 2,
                  textAlign: 'center'
                }}>
                  <Typography variant="body1" sx={{ color: '#856404', mb: 2 }}>
                    ⚠️ Error al cargar las reglas de negocio
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handleRefreshRules}
                    sx={{
                      borderColor: '#EB0029',
                      color: '#EB0029',
                      '&:hover': {
                        borderColor: '#D32F2F',
                        backgroundColor: 'rgba(235, 0, 41, 0.04)'
                      }
                    }}
                  >
                    Reintentar
                  </Button>
                </Box>
              )}

              {/* Rule Selection Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ 
                  color: '#333', 
                  fontWeight: 600, 
                  mb: 3,
                  textAlign: 'center'
                }}>
                  Seleccionar Regla a Simular
                </Typography>

                <Box sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="rule-select-label">
                      Selecciona una regla de negocio
                    </InputLabel>
                    <Select
                      labelId="rule-select-label"
                      value={selectedRuleId}
                      onChange={handleRuleSelection}
                      label="Selecciona una regla de negocio"
                      disabled={rulesLoading}
                      sx={{
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#EB0029',
                        }
                      }}
                    >
                      {rulesLoading ? (
                        <MenuItem disabled>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={20} />
                            <Typography>Cargando reglas...</Typography>
                          </Box>
                        </MenuItem>
                      ) : businessRules.length === 0 ? (
                        <MenuItem disabled>
                          <Typography color="textSecondary">No hay reglas disponibles</Typography>
                        </MenuItem>
                      ) : (
                        businessRules.map((rule) => (
                          <MenuItem key={rule.id_regla} value={rule.id_regla}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {rule.id_display}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: '#666', 
                                fontSize: '0.85rem',
                                maxWidth: '400px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {rule.descripcion}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Box>

                {/* Selected Rule Details */}
                {selectedRule && (
                  <Box sx={{ 
                    maxWidth: 600, 
                    mx: 'auto', 
                    p: 3, 
                    bgcolor: '#f8f9fa', 
                    borderRadius: 2,
                    border: '1px solid #e9ecef'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#EB0029', fontWeight: 600 }}>
                        Detalles de la Regla Seleccionada
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={handleViewHistory}
                        sx={{
                          borderColor: '#EB0029',
                          color: '#EB0029',
                          '&:hover': {
                            backgroundColor: 'rgba(235, 0, 41, 0.04)',
                            borderColor: '#D32F2F'
                          }
                        }}
                      >
                        Ver Historial
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 80 }}>
                          ID:
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {selectedRule.id_display}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 80 }}>
                          Estado:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: selectedRule.status === 'Activa' ? '#28a745' : '#dc3545',
                          fontWeight: 500
                        }}>
                          {selectedRule.status}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 80 }}>
                          Usuario:
                        </Typography>
                        <Typography variant="body2">
                          {selectedRule.usuario}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 80 }}>
                          Descripción:
                        </Typography>
                        <Typography variant="body2" sx={{ flex: 1, lineHeight: 1.4 }}>
                          {selectedRule.descripcion}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Test Input Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ 
                  color: '#333', 
                  fontWeight: 600, 
                  mb: 3,
                  textAlign: 'center'
                }}>
                  Datos de Prueba
                </Typography>

                {/* Input Type Tabs */}
                <Box sx={{ maxWidth: 800, mx: 'auto', mb: 3 }}>
                  <Tabs
                    value={testInputType}
                    onChange={handleTestInputTypeChange}
                    centered
                    sx={{
                      '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 500
                      },
                      '& .Mui-selected': {
                        color: '#EB0029 !important'
                      },
                      '& .MuiTabs-indicator': {
                        backgroundColor: '#EB0029'
                      }
                    }}
                  >
                    <Tab
                      icon={<TextSnippetIcon />}
                      label="Texto de Prueba"
                      iconPosition="start"
                    />
                    <Tab
                      icon={<CloudUploadIcon />}
                      label="Archivo de Datos"
                      iconPosition="start"
                    />
                  </Tabs>
                </Box>

                {/* Text Input Tab */}
                {testInputType === 0 && (
                  <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                    <Paper sx={{ p: 3, border: '1px solid #e9ecef' }}>
                      <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                        Ingresa los datos de prueba en formato JSON o texto estructurado:
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={8}
                        placeholder={`Ejemplo de datos de prueba:

{
  "monto": 1000,
  "tipo_transaccion": "Transferencia",
  "ubicacion": "México",
  "historial_crediticio": "Bueno",
  "fecha": "2025-10-07",
  "usuario_id": "123456"
}

O en formato texto:
Monto: $1000, Tipo: Transferencia, País: México, Historial: Bueno`}
                        value={testText}
                        onChange={(e) => setTestText(e.target.value)}
                        variant="outlined"
                        sx={{
                          '& .MuiInputBase-root': {
                            fontFamily: 'monospace',
                            fontSize: '0.9rem'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#EB0029',
                          }
                        }}
                      />
                      <Typography variant="body2" sx={{ mt: 1, color: '#666', fontStyle: 'italic' }}>
                        Puedes usar formato JSON o texto libre. La IA interpretará automáticamente los datos.
                      </Typography>
                    </Paper>
                  </Box>
                )}

                {/* File Upload Tab */}
                {testInputType === 1 && (
                  <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                    <Paper sx={{ p: 3, border: '1px solid #e9ecef' }}>
                      <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
                        Sube un archivo con datos de prueba (CSV, JSON, TXT):
                      </Typography>

                      {/* File Drop Zone */}
                      <Box
                        onDrop={handleFileDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        sx={{
                          border: `2px dashed ${dragOver ? '#EB0029' : '#ccc'}`,
                          borderRadius: 2,
                          p: 4,
                          textAlign: 'center',
                          backgroundColor: dragOver ? '#fff5f5' : '#f9f9f9',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#EB0029',
                            backgroundColor: '#fff5f5'
                          }
                        }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept=".csv,.json,.txt"
                          style={{ display: 'none' }}
                        />
                        
                        {selectedFile ? (
                          <Box>
                            <AttachFileIcon sx={{ fontSize: 48, color: '#EB0029', mb: 2 }} />
                            <Typography variant="h6" sx={{ mb: 1, color: '#EB0029' }}>
                              Archivo Seleccionado
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                              {selectedFile.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                              {(selectedFile.size / 1024).toFixed(1)} KB
                            </Typography>
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFileRemove();
                              }}
                              sx={{ mt: 1 }}
                            >
                              Remover Archivo
                            </Button>
                          </Box>
                        ) : (
                          <Box>
                            <CloudUploadIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                            <Typography variant="h6" sx={{ mb: 1 }}>
                              Arrastra y suelta tu archivo aquí
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                              o haz clic para seleccionar
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#999' }}>
                              Formatos soportados: CSV, JSON, TXT (máximo 5MB)
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  </Box>
                )}
              </Box>
              {/* Simulation Button and Progress */}
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                {isSimulating && (
                  <Box sx={{ mb: 3 }}>
                    <LinearProgress 
                      sx={{ 
                        mb: 2,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#EB0029'
                        }
                      }} 
                    />
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Procesando con Gemini AI... Esto puede tomar unos momentos.
                    </Typography>
                  </Box>
                )}

                <Button
                  variant="contained"
                  disabled={!selectedRule || selectedRule.status !== 'Activa' || isSimulating || 
                    (testInputType === 0 && !testText.trim()) || 
                    (testInputType === 1 && !selectedFile)}
                  onClick={handleRunSimulation}
                  startIcon={isSimulating ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    bgcolor: '#EB0029',
                    '&:hover': { bgcolor: '#D32F2F' },
                    '&:disabled': { 
                      bgcolor: '#ccc',
                      color: '#666'
                    }
                  }}
                >
                  {isSimulating ? 'Simulando...' : 
                   !selectedRule ? 'Selecciona una Regla' :
                   selectedRule.status !== 'Activa' ? 'Regla Inactiva' :
                   (testInputType === 0 && !testText.trim()) ? 'Ingresa Datos de Prueba' :
                   (testInputType === 1 && !selectedFile) ? 'Selecciona un Archivo' :
                   'Ejecutar Simulación'
                  }
                </Button>

                {selectedRule && selectedRule.status !== 'Activa' && (
                  <Typography variant="body2" sx={{ 
                    color: '#dc3545', 
                    mt: 2, 
                    fontStyle: 'italic' 
                  }}>
                    Solo se pueden simular reglas con estado "Activa"
                  </Typography>
                )}
              </Box>

              {/* Simulation Results Section */}
              {(simulationResults || simulationError) && (
                <Box sx={{ mt: 4, maxWidth: 900, mx: 'auto' }}>
                  <Typography variant="h6" sx={{ 
                    color: '#333', 
                    fontWeight: 600, 
                    mb: 3,
                    textAlign: 'center'
                  }}>
                    Resultados de la Simulación
                  </Typography>

                  {simulationError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>Error en la Simulación</Typography>
                      <Typography variant="body2">{simulationError}</Typography>
                    </Alert>
                  )}

                  {simulationResults && (
                    <Paper sx={{ p: 4, border: '1px solid #e9ecef' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <CheckCircleIcon sx={{ color: '#28a745', mr: 2 }} />
                        <Typography variant="h6" sx={{ color: '#28a745', fontWeight: 600 }}>
                          Simulación Completada
                        </Typography>
                      </Box>

                      {/* Rule Applied */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                          Regla Aplicada:
                        </Typography>
                        <Chip 
                          label={`${selectedRule.id_display} - ${selectedRule.descripcion}`}
                          variant="outlined"
                          sx={{ 
                            maxWidth: '100%',
                            height: 'auto',
                            '& .MuiChip-label': {
                              whiteSpace: 'normal',
                              padding: '8px 12px'
                            }
                          }}
                        />
                      </Box>

                      {/* AI Analysis Results */}
                      {simulationResults.analysis && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                            Análisis de Gemini AI:
                          </Typography>
                          <Paper sx={{ p: 3, bgcolor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                            <Typography variant="body2" sx={{ 
                              whiteSpace: 'pre-wrap',
                              lineHeight: 1.6,
                              fontFamily: 'inherit'
                            }}>
                              {simulationResults.analysis}
                            </Typography>
                          </Paper>
                        </Box>
                      )}

                      {/* Test Results */}
                      {simulationResults.results && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                            Resultados de Validación:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            <Chip 
                              label={`Estado: ${simulationResults.results.status || 'N/A'}`}
                              color={simulationResults.results.status === 'PASS' ? 'success' : 
                                     simulationResults.results.status === 'FAIL' ? 'error' : 'default'}
                            />
                            {simulationResults.results.confidence && (
                              <Chip 
                                label={`Confianza: ${simulationResults.results.confidence}%`}
                                variant="outlined"
                              />
                            )}
                          </Box>
                          {simulationResults.results.details && (
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              {simulationResults.results.details}
                            </Typography>
                          )}
                        </Box>
                      )}

                      {/* Recommendations */}
                        {simulationResults.recommendations && (
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                            Recomendaciones:
                          </Typography>
                          <Alert severity="info">
                            <Typography variant="body2">
                              {simulationResults.recommendations}
                            </Typography>
                          </Alert>
                        </Box>
                      )}

                      {/* Mapped XML (if returned) */}
                      {simulationResults.xml && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                            XML mapeado por IA:
                          </Typography>
                          <Paper sx={{ p: 3, bgcolor: '#fff', border: '1px solid #e9ecef', overflowX: 'auto' }}>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                              {simulationResults.xml}
                            </Typography>
                          </Paper>
                        </Box>
                      )}
                    </Paper>
                  )}
                </Box>
              )}
            </Paper>
          </Container>
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

      {/* Simulation History Modal */}
      <Dialog
        open={historyModalOpen}
        onClose={handleCloseHistoryModal}
        maxWidth="lg"
        fullWidth
        scroll="body"
      >
        <DialogTitle sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          fontSize: '20px',
          fontWeight: 600,
          borderBottom: '1px solid #e0e0e0',
          pb: 2
        }}>
          <AssignmentIcon sx={{ color: '#EB0029' }} />
          Historial de Simulaciones
          {selectedRule && (
            <Chip 
              label={selectedRule.id_display}
              variant="outlined"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {loadingHistory ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress sx={{ color: '#EB0029', mb: 2 }} />
              <Typography variant="body1" sx={{ color: '#666' }}>
                Cargando historial de simulaciones...
              </Typography>
            </Box>
          ) : simulationHistory.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                Sin simulaciones previas
              </Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>
                Esta regla aún no ha sido simulada. ¡Ejecuta tu primera simulación!
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              {/* Simulation History List */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: '#333', 
                  mb: 2,
                  px: 2
                }}>
                  Simulaciones Realizadas ({simulationHistory.length})
                </Typography>
                
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Archivo</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Resumen</TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {simulationHistory.map((simulation, index) => (
                        <TableRow 
                          key={simulation.id}
                          sx={{ 
                            '&:hover': { backgroundColor: '#f5f5f5' },
                            '&:nth-of-type(odd)': { backgroundColor: '#fafafa' }
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccessTimeIcon sx={{ fontSize: 16, color: '#666' }} />
                              <Typography variant="body2">
                                {new Date(simulation.date).toLocaleDateString('es-MX', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={simulation.type === 'text' ? 'Texto' : 'Archivo'}
                              size="small"
                              color={simulation.type === 'text' ? 'primary' : 'secondary'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {simulation.file_name ? (
                              <Typography variant="body2" sx={{ 
                                fontFamily: 'monospace',
                                fontSize: '0.8rem',
                                color: '#666'
                              }}>
                                {simulation.file_name}
                              </Typography>
                            ) : (
                              <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>
                                N/A
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ 
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {simulation.summary || 'Simulación completada'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<VisibilityIcon />}
                              onClick={() => handleViewSimulationDetails(simulation.id)}
                              sx={{
                                borderColor: '#EB0029',
                                color: '#EB0029',
                                '&:hover': {
                                  backgroundColor: 'rgba(235, 0, 41, 0.04)',
                                  borderColor: '#D32F2F'
                                }
                              }}
                            >
                              Detalles
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Simulation Details Section */}
              {selectedSimulationDetails && (
                <Accordion sx={{ mt: 2 }}>
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                      backgroundColor: '#f8f9fa',
                      '&.Mui-expanded': { backgroundColor: '#e8f5e8' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CheckCircleIcon sx={{ color: '#28a745' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Detalles de Simulación #{selectedSimulationDetails.id}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#EB0029' }}>
                          Información General
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>Fecha de Simulación:</Typography>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            {new Date(selectedSimulationDetails.date).toLocaleString('es-MX')}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>Tipo de Entrada:</Typography>
                          <Chip 
                            label={selectedSimulationDetails.input_type === 'text' ? 'Texto' : 'Archivo'}
                            size="small"
                            color={selectedSimulationDetails.input_type === 'text' ? 'primary' : 'secondary'}
                          />
                        </Box>
                        {selectedSimulationDetails.file_name && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>Archivo:</Typography>
                            <Typography variant="body2" sx={{ 
                              fontFamily: 'monospace',
                              color: '#666',
                              fontSize: '0.9rem'
                            }}>
                              {selectedSimulationDetails.file_name}
                            </Typography>
                          </Box>
                        )}
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#EB0029' }}>
                          Datos de Entrada
                        </Typography>
                        <Paper sx={{ 
                          p: 2, 
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #e9ecef',
                          maxHeight: 200,
                          overflow: 'auto'
                        }}>
                          <Typography variant="body2" sx={{ 
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            whiteSpace: 'pre-wrap',
                            color: '#333'
                          }}>
                            {typeof selectedSimulationDetails.input_data === 'object' ? 
                              JSON.stringify(selectedSimulationDetails.input_data, null, 2) :
                              selectedSimulationDetails.input_data
                            }
                          </Typography>
                        </Paper>
                      </Grid>

                      {/* AI Results Section */}
                      {selectedSimulationDetails.results && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#EB0029' }}>
                            Resultados de Gemini AI
                          </Typography>
                          
                          {selectedSimulationDetails.results.analysis && (
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                                Análisis:
                              </Typography>
                              <Paper sx={{ 
                                p: 2, 
                                backgroundColor: '#f0f7ff',
                                border: '1px solid #b3d9ff'
                              }}>
                                <Typography variant="body2" sx={{ 
                                  whiteSpace: 'pre-wrap',
                                  lineHeight: 1.5
                                }}>
                                  {selectedSimulationDetails.results.analysis}
                                </Typography>
                              </Paper>
                            </Box>
                          )}

                          {selectedSimulationDetails.results.results && (
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                                Resultados de Validación:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {Object.entries(selectedSimulationDetails.results.results).map(([key, value]) => (
                                  <Chip 
                                    key={key}
                                    label={`${key}: ${value}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}

                          {selectedSimulationDetails.results.recommendations && (
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                                Recomendaciones:
                              </Typography>
                              <Alert severity="info">
                                <Typography variant="body2">
                                  {selectedSimulationDetails.results.recommendations}
                                </Typography>
                              </Alert>
                            </Box>
                          )}
                        </Grid>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, borderTop: '1px solid #e0e0e0' }}>
          <Button
            onClick={handleCloseHistoryModal}
            variant="contained"
            sx={{
              bgcolor: '#EB0029',
              '&:hover': { bgcolor: '#D32F2F' }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Simulador;
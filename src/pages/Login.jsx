import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import DrawIcon from '@mui/icons-material/Draw';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { IconButton, InputAdornment, Snackbar, Alert } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigation } from '../hooks/useNavigation';
import { useNotification } from '../hooks/useNotification';
import authService from '../services/authService';

import './Login.css'



const Login = () => {
    const { goToDashboard, goToRegister, goToForgotPassword } = useNavigation();
    const { notification, showSuccess, showError, showWarning } = useNotification();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            showError('Por favor, completa todos los campos');
            return;
        }

        setLoading(true);
        
        try {
            // Call real authentication API
            const result = await authService.login({
                usuario: email, // Can be username or email
                contrasenia: password
            });

            if (result.success) {
                // Check if user is logging in with temporary password
                if (password === 'password123') {
                    showWarning('¡Estás usando una contraseña temporal! Por seguridad, cámbiala después de iniciar sesión.', 7000);
                    
                    // Add notification to Dashboard system
                    const dashboardNotification = {
                        id: Date.now(),
                        type: 'warning',
                        title: 'Contraseña Temporal Detectada',
                        message: 'Iniciaste sesión con una contraseña temporal. Cámbiala desde tu perfil.',
                        timestamp: new Date(),
                        read: false
                    };
                    
                    const existingNotifications = JSON.parse(localStorage.getItem('dashboardNotifications') || '[]');
                    existingNotifications.unshift(dashboardNotification);
                    localStorage.setItem('dashboardNotifications', JSON.stringify(existingNotifications));
                } else {
                    showSuccess('¡Bienvenido! Iniciando sesión...', 2000);
                }
                
                // User is now logged in and data is stored in localStorage
                setTimeout(() => {
                    goToDashboard();
                }, 1500);
            } else {
                showError(result.message || 'Error al iniciar sesión');
            }
        } catch (error) {
            showError('Error de conexión. Intenta nuevamente.');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <React.Fragment>
            <CssBaseline />
            <Box className="fondo-login"
                sx={{
                    position: 'fixed',
                    top: 30,
                    left: 0,
                    backgroundImage: "url('/src/assets/FondoLogin.svg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '55vh',
                    width: '100vw',
                    zIndex: 1
                }}
            />
            <AppBar position="fixed" sx={{ bgcolor: '#EB0029', boxShadow: 0, backgroundImage: "url('/src/assets/HeaderBanorte.svg')", backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 1001, cursor: 'pointer' }} onClick={() => setActiveSection('Login')}>
                <Toolbar>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <img 
                            src="/src/assets/LogoBanorte.svg" 
                            alt="Banorte"
                            style={{
                                height: '30px',
                                width: 'auto',
                                filter: 'brightness(0) invert(1)'
                            }}
                        />
                    </Box>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton >
                        <MenuIcon sx={{ color: '#ffffffff'}}/>
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Box sx={{
                position: 'fixed',
                width: 400,
                height: 380,
                borderRadius: '8px',
                bgcolor: 'white',
                zIndex: 10,
                left: '80px',
                top: '120px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                padding: '20px',
                border: '1px solid #e0e0e0'
            
            }}>
                <Typography variant="h5" align="center" sx={{ mb: 1, fontWeight: 500, color: '#333', fontFamily: 'Roboto' }}>
                    Ingresa aquí
                </Typography>
                <TextField
                    required
                    label="Correo electrónico o nombre de usuario"
                    type="email"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    sx={{ 
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            '& fieldset': {
                                borderColor: '#ddd',
                            },
                            '&:hover fieldset': {
                                borderColor: '#bbb',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#EB0029',
                            }
                        }
                    }}
                />
                <TextField
                    required
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleLogin(e);
                        }
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handleTogglePasswordVisibility}
                                    edge="end"
                                    disabled={loading}
                                    sx={{ color: '#666' }}
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{ 
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            '& fieldset': {
                                borderColor: '#ddd',
                            },
                            '&:hover fieldset': {
                                borderColor: '#bbb',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#EB0029',
                            }
                        }
                    }}
                />
                <Box sx={{ textAlign: 'left', mb: 2, borderRadius: '4px' }}>
                    <Link 
                        onClick={(e) => {
                            e.preventDefault();
                            goToForgotPassword();
                        }}
                        underline="hover" 
                        sx={{ 
                            color: '#EB0029', 
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                    <Button 
                        variant="contained"
                        disableElevation
                        disabled={loading}
                        onClick={handleLogin}
                        sx={{ 
                            bgcolor: '#EB0029', 
                            py: 1.5,
                            px: 3,
                            fontSize: '14px',
                            fontWeight: 600,
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            '&:hover': { bgcolor: '#d4002a' },
                            '&:disabled': { bgcolor: '#ccc' }
                        }}
                    >
                        {loading ? 'Iniciando...' : 'INICIAR SESIÓN'}
                    </Button>
                </Box>
                <Typography variant="body2" align="left" sx={{ color: '#666' }}>
                    ¿No tienes cuenta? <Link 
                        onClick={(e) => {
                            e.preventDefault();
                            goToRegister();
                        }}
                        underline="hover" 
                        sx={{ 
                            color: '#EB0029', 
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Regístrate aquí
                    </Link>
                </Typography>
            </Box>
            {/* White background section for steps */}
            <Box sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100vw',
                height: '45vh',
                backgroundColor: 'white',
                zIndex: 5
            }} />
            
            <Stack direction="row" spacing={20} sx={{ 
                justifyContent: "center", 
                alignItems: "center", 
                position: "fixed", 
                bottom: 0, 
                left: 0,
                right: 0,
                height: '45vh',
                zIndex: 10,
                paddingY: 6,
                paddingX: 8
            }}>
                <Stack direction="column" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: '#E5E5E5', width: 180, height: 180, boxShadow: 3 }}>
                        <AccountBoxIcon sx={{ color: '#333', width: 90, height: 90 }} />
                    </Avatar>
                    <Typography variant="h3" align="center" sx={{ fontWeight: 700, color: '#333', fontSize: '2.5rem' }}>
                        Primeros Pasos
                    </Typography>
                    <Typography variant="h6" align="center" sx={{ color: '#666', maxWidth: '220px', fontWeight: 400, lineHeight: 1.4 }}>
                        Crea tu cuenta o inicia sesión
                    </Typography>
                </Stack>
                <Stack direction="column" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: '#E5E5E5', width: 180, height: 180, boxShadow: 3 }}>
                        <DrawIcon sx={{ color: '#333', width: 90, height: 90 }} />
                    </Avatar>
                    <Typography variant="h3" align="center" sx={{ fontWeight: 700, color: '#333', fontSize: '2.5rem' }}>
                        Construye
                    </Typography>
                    <Typography variant="h6" align="center" sx={{ color: '#666', maxWidth: '220px', fontWeight: 400, lineHeight: 1.4 }}>
                        Habla con nuestra IA para generar las reglas de negocio
                    </Typography>
                </Stack>
                <Stack direction="column" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: '#E5E5E5', width: 180, height: 180, boxShadow: 3 }}>
                        <CheckBoxIcon sx={{ color: '#333', width: 90, height: 90 }} />
                    </Avatar>
                    <Typography variant="h3" align="center" sx={{ fontWeight: 700, color: '#333', fontSize: '2.5rem' }}>
                        Regla Finalizada
                    </Typography>
                    <Typography variant="h6" align="center" sx={{ color: '#666', maxWidth: '220px', fontWeight: 400, lineHeight: 1.4 }}>
                        Revisa tus reglas de negocio
                    </Typography>
                </Stack>
            </Stack>

            {/* Notification Snackbar */}
            <Snackbar
                open={notification.show}
                autoHideDuration={notification.duration}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    severity={notification.type}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </React.Fragment>
    )
}

export default Login;

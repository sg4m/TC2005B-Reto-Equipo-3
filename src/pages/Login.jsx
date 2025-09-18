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
import { IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigation } from '../hooks/useNavigation';

import './Login.css'



const Login = () => {
    const { goToDashboard, goToRegister, goToForgotPassword } = useNavigation();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            alert('Por favor, completa todos los campos');
            return;
        }

        setLoading(true);
        
        try {
            // Here you would normally make an API call to authenticate
            // For now, we'll simulate a successful login
            setTimeout(() => {
                setLoading(false);
                goToDashboard();
            }, 1000);
        } catch (error) {
            setLoading(false);
            alert('Error al iniciar sesión. Intenta nuevamente.');
        }
    };
    return (
        <React.Fragment>
            <CssBaseline />
            <Box className="fondo-login"
                sx={{
                    position: 'fixed',
                    top: 64,
                    left: 0,
                    backgroundImage: "url('/src/assets/FondoLogin.svg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '60vh',
                    width: '100vw',
                    zIndex: 0
                }}
            />
            <AppBar position="fixed" sx={{ bgcolor: '#EB0029', boxShadow: 0, backgroundImage: "url('/src/assets/HeaderBanorte.svg')", backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 1300 }}>
                <Toolbar>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                borderRadius: '16px',
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                zIndex: 10,
                left: '80px',
                top: '120px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                padding: 3,
            }}>
                <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 600, color: '#333', fontFamily: 'Roboto' }}>
                    Ingresa Aquí
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
                    sx={{ mb: 2 }}
                />
                <TextField
                    required
                    label="Contraseña"
                    type="password"
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
                    sx={{ mb: 2 }}
                />
                <Box sx={{ textAlign: 'center', mb: 2, borderRadius: '4px' }}>
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
                <Button 
                    variant="contained" 
                    fullWidth
                    disableElevation
                    disabled={loading}
                    onClick={handleLogin}
                    sx={{ 
                        bgcolor: '#EB0029', 
                        py: 1.5, 
                        mb: 2,
                        fontSize: '16px',
                        fontWeight: 600,
                        borderRadius: '8px',
                        '&:hover': { bgcolor: '#dd2a2aff' },
                        '&:disabled': { bgcolor: '#ccc' }
                    }}
                >
                    {loading ? 'Iniciando...' : 'Iniciar sesión'}
                </Button>
                <Typography variant="body2" align="center" sx={{ color: '#666' }}>
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
                height: '40vh',
                backgroundColor: 'white',
                zIndex: 5
            }} />
            
            <Stack direction="row" spacing={12} sx={{ 
                justifyContent: "center", 
                alignItems: "center", 
                position: "fixed", 
                bottom: 0, 
                left: 0,
                right: 0,
                height: '40vh',
                zIndex: 10,
                paddingY: 4
            }}>
                <Stack direction="column" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: '#E5E5E5', width: 120, height: 120, boxShadow: 2 }}>
                        <AccountBoxIcon sx={{ color: '#333', width: 60, height: 60 }} />
                    </Avatar>
                    <Typography variant="h6" align="center" sx={{ fontWeight: 700, color: '#333' }}>
                        Paso 1
                    </Typography>
                    <Typography variant="body2" align="center" sx={{ color: '#666', maxWidth: '120px' }}>
                        Crea tu cuenta / Inicia sesión
                    </Typography>
                </Stack>
                <Stack direction="column" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: '#E5E5E5', width: 120, height: 120, boxShadow: 2 }}>
                        <DrawIcon sx={{ color: '#333', width: 60, height: 60 }} />
                    </Avatar>
                    <Typography variant="h6" align="center" sx={{ fontWeight: 700, color: '#333' }}>
                        Paso 2
                    </Typography>
                    <Typography variant="body2" align="center" sx={{ color: '#666', maxWidth: '120px' }}>
                        Ingresa tu prompt en nuestra IA
                    </Typography>
                </Stack>
                <Stack direction="column" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: '#E5E5E5', width: 120, height: 120, boxShadow: 2 }}>
                        <CheckBoxIcon sx={{ color: '#333', width: 60, height: 60 }} />
                    </Avatar>
                    <Typography variant="h6" align="center" sx={{ fontWeight: 700, color: '#333' }}>
                        Paso 3
                    </Typography>
                    <Typography variant="body2" align="center" sx={{ color: '#666', maxWidth: '120px' }}>
                        Revisa tu regla de negocio
                    </Typography>
                </Stack>
            </Stack>
        </React.Fragment>
    )
}

export default Login;

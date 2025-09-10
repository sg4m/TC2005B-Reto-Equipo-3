import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button } from '@mui/material';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleContinue = (e) => {
    e.preventDefault();

    console.log('Reset password for:', email);

    navigate('/login');
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 999
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
        width: '100%',
        position: 'relative',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1001,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Banorte Logo */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {/* Logo Image */}
            <img 
              src="/src/assets/LogoBanorte.svg" 
              alt="Banorte"
              onClick={() => navigate('/login')}
              style={{
                height: '40px',
                width: 'auto',
                filter: 'brightness(0) invert(1)',
                cursor: 'pointer'
              }}
            />
          </Box>
        </Box>
        
      </Box>

      {/* Separator line */}
      <Box sx={{ 
        height: '2px',
        width: '100%',
        background: 'linear-gradient(90deg, #E0E0E0 0%, #BDBDBD 50%, #E0E0E0 100%)',
        opacity: 0.6
      }} />

      {/* Main Content */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: '20px', sm: '40px 20px' },
        backgroundColor: '#ffffff',
        minHeight: 'calc(100vh - 66px)' // Account for header height
      }}>
        <Box sx={{ 
          width: '100%',
          maxWidth: '420px',
          textAlign: 'center',
          padding: { xs: '20px', sm: '40px' }
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              marginBottom: '40px',
              fontWeight: '400',
              color: '#333333',
              fontSize: '28px',
              fontFamily: 'Roboto, sans-serif'
            }}
          >
            Restablecer Contraseña
          </Typography>

          <form onSubmit={handleContinue}>
            <TextField
              fullWidth
              type="email"
              placeholder="Correo electronico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{
                marginBottom: '30px',
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#D3D3D3',
                  borderRadius: '6px',
                  height: '50px',
                  fontFamily: 'Roboto, sans-serif',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover fieldset': {
                    border: 'none',
                  },
                  '&.Mui-focused fieldset': {
                    border: '2px solid #E53935',
                  },
                },
                '& .MuiInputBase-input': {
                  padding: '15px 16px',
                  fontSize: '16px',
                  color: '#333',
                  fontFamily: 'Roboto, sans-serif',
                },
                '& .MuiInputBase-input::placeholder': {
                  color: '#666',
                  opacity: 1,
                  fontSize: '16px',
                  fontFamily: 'Roboto, sans-serif'
                }
              }}
            />

            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#EB0029',
                color: 'white',
                paddingX: '40px',
                paddingY: '12px',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: '500',
                fontFamily: 'Roboto, sans-serif',
                textTransform: 'none',
                marginBottom: '30px',
                minWidth: '120px',
                '&:hover': {
                  backgroundColor: '#EB0029',
                },
              }}
            >
              Continuar
            </Button>
          </form>

          <Typography 
            variant="body2" 
            sx={{ 
              color: '#666666',
              fontSize: '14px',
              fontFamily: 'Roboto, sans-serif'
            }}
          >
            ¿Ya tienes una cuenta?{' '}
            <Typography
              component="span"
              onClick={handleBackToLogin}
              sx={{
                color: '#EB0029',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '14px',
                fontFamily: 'Roboto, sans-serif',
                '&:hover': {
                  color: '#EB0029',
                }
              }}
            >
              Inicia Sesión Aquí.
            </Typography>
          </Typography>
        </Box>
      </Box>

      {/* Back to Login Button - Bottom Right */}
      <Box sx={{ 
        position: 'fixed',
        bottom: '24px',
        right: '24px'
      }}>
        <Button
          onClick={handleBackToLogin}
          sx={{
            backgroundColor: '#D3D3D3',
            color: '#333333',
            paddingX: '20px',
            paddingY: '10px',
            borderRadius: '6px',
            textTransform: 'none',
            fontSize: '14px',
            fontWeight: '400',
            fontFamily: 'Roboto, sans-serif',
            '&:hover': {
              backgroundColor: '#BDBDBD',
            },
          }}
        >
          Regresar a inicio de sesión
        </Button>
      </Box>
    </Box>
  );
};

export default ForgotPassword;

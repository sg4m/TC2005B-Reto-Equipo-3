import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Checkbox, FormControlLabel, Alert, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useFormValidation } from '../hooks/useFormValidation';
import { useNavigation } from '../hooks/useNavigation';
import { useNotification } from '../hooks/useNotification';
import { formHelpers, constants, utilityHelpers } from '../helpers';

const Register = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Custom hooks
  const { goToLogin } = useNavigation();
  const { notification, showSuccess, showError } = useNotification();
  const {
    formData,
    errors,
    handleInputChange,
    resetForm,
    validateForm
  } = useFormValidation({
    email: '',
    password: '',
    username: '',
    country: '',
    acceptPromotions: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      showError('Por favor corrige los errores en el formulario');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Clean form data before submission
      const cleanedData = utilityHelpers.cleanFormData(formData);
      
      // Submit to backend (simulated)
      const result = await formHelpers.submitRegistration(cleanedData);
      
      if (result.success) {
        showSuccess(result.message);
        resetForm();
        
        // Redirect after success
        setTimeout(() => {
          goToLogin();
        }, 2000);
      } else {
        showError(result.message);
      }
    } catch (error) {
      showError('Error inesperado al registrar usuario');
    } finally {
      setIsSubmitting(false);
    }
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
        height: '55px',
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
            gap: '4px'
          }}>
            {/* Logo Image */}
            <img 
              src="/src/assets/LogoBanorte.svg" 
              alt="Banorte"
              onClick={goToLogin}
              style={{
                height: '25px',
                width: 'auto',
                filter: 'brightness(0) invert(1)',
                cursor: 'pointer'
              }}
            />
          </Box>
        </Box>
        
        {/* Search Icon */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.1)'
          }
        }}>
          <SearchIcon sx={{ 
            color: 'white', 
            fontSize: '32px' 
          }} />
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
        padding: { xs: '20px', sm: '20px' },
        backgroundColor: '#ffffff',
        minHeight: 'calc(100vh - 66px)',
        overflowY: 'auto'
      }}>
        <Box sx={{ 
          width: '100%',
          maxWidth: '450px',
          textAlign: 'center',
          padding: { xs: '20px', sm: '30px' }
        }}>
          {notification.show && (
            <Alert 
              severity={notification.type} 
              sx={{ 
                marginBottom: '20px',
                fontFamily: 'Roboto, sans-serif',
                '& .MuiAlert-message': {
                  fontFamily: 'Roboto, sans-serif'
                }
              }}
            >
              {notification.message}
            </Alert>
          )}

          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              marginBottom: '30px',
              fontWeight: '400',
              color: '#333333',
              fontSize: '28px',
              fontFamily: 'Roboto, sans-serif'
            }}
          >
            Registro
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <Box sx={{ textAlign: 'left', marginBottom: '20px' }}>
              <Typography sx={{ 
                marginBottom: '8px', 
                fontSize: '14px', 
                color: '#333',
                fontFamily: 'Roboto, sans-serif',
                fontWeight: '500'
              }}>
                Correo electrónico*
              </Typography>
              <TextField
                fullWidth
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleInputChange}
                error={!!errors.email}
                helperText={errors.email}
                required
                sx={{
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
            </Box>

            {/* Password Field */}
            <Box sx={{ textAlign: 'left', marginBottom: '20px' }}>
              <Typography sx={{ 
                marginBottom: '8px', 
                fontSize: '14px', 
                color: '#333',
                fontFamily: 'Roboto, sans-serif',
                fontWeight: '500'
              }}>
                Contraseña*
              </Typography>
              <TextField
                fullWidth
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleInputChange}
                error={!!errors.password}
                helperText={errors.password}
                required
                sx={{
                  marginBottom: '10px',
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
              <Typography sx={{ 
                fontSize: '12px', 
                color: '#666',
                fontFamily: 'Roboto, sans-serif',
                lineHeight: '1.3',
                marginBottom: '15px'
              }}>
                La contraseña debe contener al menos 8 caracteres, incluir una letra mayúscula, una letra minúscula, un número y un carácter especial. No debe contener espacios en blanco.
              </Typography>
            </Box>

            {/* Username Field */}
            <Box sx={{ textAlign: 'left', marginBottom: '20px' }}>
              <Typography sx={{ 
                marginBottom: '8px', 
                fontSize: '14px', 
                color: '#333',
                fontFamily: 'Roboto, sans-serif',
                fontWeight: '500'
              }}>
                Usuario*
              </Typography>
              <TextField
                fullWidth
                type="text"
                name="username"
                placeholder="Usuario"
                value={formData.username}
                onChange={handleInputChange}
                error={!!errors.username}
                helperText={errors.username}
                required
                sx={{
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
            </Box>

            {/* Country/Region Field */}
            <Box sx={{ textAlign: 'left', marginBottom: '20px' }}>
              <Typography sx={{ 
                marginBottom: '8px', 
                fontSize: '14px', 
                color: '#333',
                fontFamily: 'Roboto, sans-serif',
                fontWeight: '500'
              }}>
                País o región*
              </Typography>
              <TextField
                fullWidth
                select
                name="country"
                placeholder="País o región"
                value={formData.country}
                onChange={handleInputChange}
                error={!!errors.country}
                helperText={errors.country}
                required
                sx={{
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
              >
                {constants.COUNTRIES.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Checkbox for promotions */}
            <FormControlLabel
              control={
                <Checkbox
                  name="acceptPromotions"
                  checked={formData.acceptPromotions}
                  onChange={handleInputChange}
                  sx={{
                    color: '#666',
                    '&.Mui-checked': {
                      color: '#E53935',
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ 
                  fontSize: '12px', 
                  color: '#666',
                  fontFamily: 'Roboto, sans-serif'
                }}>
                  Recibe habitualmente promociones, noticias y beneficios exclusivos al registrarte
                </Typography>
              }
              sx={{ 
                alignItems: 'flex-start',
                marginBottom: '30px',
                marginLeft: '0'
              }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
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
                minWidth: '200px',
                width: '100%',
                '&:hover': {
                  backgroundColor: '#D32F2F',
                },
                '&:disabled': {
                  backgroundColor: '#ccc',
                  color: '#666'
                }
              }}
            >
              {isSubmitting ? 'Registrando...' : 'Registrate'}
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
            ¿Ya estas registrado?{' '}
            <Typography
              component="span"
              onClick={goToLogin}
              sx={{
                color: '#EB0029',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '14px',
                fontFamily: 'Roboto, sans-serif',
                '&:hover': {
                  color: '#D32F2F',
                }
              }}
            >
              Inicia Sesión
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Register

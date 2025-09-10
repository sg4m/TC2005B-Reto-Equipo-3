// Validation helpers
export const validationHelpers = {
  email: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    validate: (email) => validationHelpers.email.regex.test(email),
    message: 'Por favor ingresa un email válido'
  },
  
  password: {
    minLength: 8,
    regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    validate: (password) => {
      if (password.length < validationHelpers.password.minLength) {
        return { isValid: false, message: `La contraseña debe tener al menos ${validationHelpers.password.minLength} caracteres` };
      }
      if (!validationHelpers.password.regex.test(password)) {
        return { isValid: false, message: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial' };
      }
      return { isValid: true, message: '' };
    }
  },

  required: {
    validate: (value) => value && value.trim().length > 0,
    message: 'Este campo es requerido'
  },

  username: {
    minLength: 3,
    maxLength: 20,
    regex: /^[a-zA-Z0-9_]+$/,
    validate: (username) => {
      if (!username || username.length < validationHelpers.username.minLength) {
        return { isValid: false, message: `El nombre de usuario debe tener al menos ${validationHelpers.username.minLength} caracteres` };
      }
      if (username.length > validationHelpers.username.maxLength) {
        return { isValid: false, message: `El nombre de usuario no puede tener más de ${validationHelpers.username.maxLength} caracteres` };
      }
      if (!validationHelpers.username.regex.test(username)) {
        return { isValid: false, message: 'El nombre de usuario solo puede contener letras, números y guiones bajos' };
      }
      return { isValid: true, message: '' };
    }
  }
};

// Form submission helpers
export const formHelpers = {
  // Simulate API call for registration
  submitRegistration: async (formData) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log the data (in real app, this would be sent to backend)
      console.log('Datos de registro enviados:', formData);
      
      // Simulate success response
      return { 
        success: true, 
        message: 'Usuario registrado exitosamente',
        userId: Date.now() // Simulated user ID
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Error al registrar usuario: ' + error.message 
      };
    }
  },

  // Simulate API call for password reset
  submitPasswordReset: async (email) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('Solicitud de restablecimiento enviada para:', email);
      
      return { 
        success: true, 
        message: 'Se ha enviado un enlace de restablecimiento a tu correo electrónico' 
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Error al enviar solicitud: ' + error.message 
      };
    }
  },

  // Simulate API call for login
  submitLogin: async (credentials) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      console.log('Intento de login:', credentials);
      
      // Simple validation for demo
      if (credentials.email === 'test@banorte.com' && credentials.password === 'Test123!') {
        return { 
          success: true, 
          message: 'Login exitoso',
          user: { email: credentials.email, name: 'Usuario Test' }
        };
      } else {
        return { 
          success: false, 
          message: 'Credenciales incorrectas' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: 'Error de conexión: ' + error.message 
      };
    }
  }
};

// Utility helpers
export const utilityHelpers = {
  // Format date for display
  formatDate: (date) => {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  },

  // Generate random ID
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Capitalize first letter
  capitalize: (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Format currency
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  },

  // Clean form data
  cleanFormData: (data) => {
    const cleaned = {};
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'string') {
        cleaned[key] = data[key].trim();
      } else {
        cleaned[key] = data[key];
      }
    });
    return cleaned;
  }
};

// Constants
export const constants = {
  ROUTES: {
    LOGIN: '/',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    DASHBOARD: '/dashboard'
  },
  
  NOTIFICATION_TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  },
  
  FORM_FIELDS: {
    EMAIL: 'email',
    PASSWORD: 'password',
    USERNAME: 'username',
    COUNTRY: 'country'
  },
  
  COUNTRIES: [
    'México',
    'Estados Unidos',
    'Canadá',
    'España',
    'Argentina',
    'Colombia',
    'Chile',
    'Perú'
  ]
};

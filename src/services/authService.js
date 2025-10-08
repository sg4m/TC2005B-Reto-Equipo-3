// Authentication service for handling login and registration API calls

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class AuthService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Register new user
  async register(userData) {
    try {
      console.log('📝 Frontend register attempt:', { 
        correo: userData.email, 
        usuario: userData.username, 
        contrasenia: '***',
        pais_region: userData.country 
      });
      console.log('🌐 API URL:', `${this.baseURL}/auth/register`);
      
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: userData.email,
          usuario: userData.username,
          contrasenia: userData.password,
          pais_region: userData.country
        }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Error en el registro');
      }

      return {
        success: true,
        message: data.message || 'Usuario registrado exitosamente',
        user: data.user
      };
    } catch (error) {
      console.error('❌ Register error:', error);
      return {
        success: false,
        message: error.message || 'Error de conexión'
      };
    }
  }

  // Login user
  async login(credentials) {
    try {
      console.log('🔐 Frontend login attempt:', { usuario: credentials.usuario, contrasenia: '***' });
      console.log('🌐 API URL:', `${this.baseURL}/auth/login`);
      
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: credentials.usuario, // Can be username or email
          contrasenia: credentials.contrasenia
        }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Error en el login');
      }

      // Store user data in localStorage for persistent session
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isLoggedIn', 'true');
      }

      return {
        success: true,
        message: data.message || 'Login exitoso',
        user: data.user
      };
    } catch (error) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        message: error.message || 'Error de conexión'
      };
    }
  }

  // Logout user
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    return {
      success: true,
      message: 'Sesión cerrada exitosamente'
    };
  }

  // Get current user from localStorage
  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      
      if (isLoggedIn === 'true' && user) {
        return JSON.parse(user);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Check if user is logged in
  isAuthenticated() {
    return localStorage.getItem('isLoggedIn') === 'true' && localStorage.getItem('user') !== null;
  }

  // Change password for current user
  async changePassword(currentPassword, newPassword) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No hay usuario autenticado');
      }

      console.log('🔐 Frontend change password attempt for user:', currentUser.id_usuario);
      console.log('🌐 API URL:', `${this.baseURL}/auth/change-password`);
      
      const response = await fetch(`${this.baseURL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id_usuario,
          currentPassword: currentPassword,
          newPassword: newPassword
        }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar la contraseña');
      }

      return {
        success: true,
        message: data.message || 'Contraseña cambiada exitosamente'
      };
    } catch (error) {
      console.error('❌ Change password error:', error);
      return {
        success: false,
        message: error.message || 'Error de conexión'
      };
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
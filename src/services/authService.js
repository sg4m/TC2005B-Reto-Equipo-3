// Authentication service for handling login and registration API calls

const API_BASE_URL = 'http://localhost:5000/api';

class AuthService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Register new user
  async register(userData) {
    try {
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en el registro');
      }

      return {
        success: true,
        message: data.message || 'Usuario registrado exitosamente',
        user: data.user
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error de conexión'
      };
    }
  }

  // Login user
  async login(credentials) {
    try {
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

      const data = await response.json();

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
}

// Create singleton instance
const authService = new AuthService();

export default authService;
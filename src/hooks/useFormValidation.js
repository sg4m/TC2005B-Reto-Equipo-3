import { useState } from 'react';

export const useFormValidation = (initialState, validationRules = {}) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  const validateField = (name, value) => {
    if (validationRules[name]) {
      const rule = validationRules[name];
      
      // Required validation
      if (rule.required && !value.trim()) {
        return `${rule.fieldName || name} es requerido`;
      }
      
      // Email validation
      if (rule.email && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Por favor ingresa un email válido';
        }
      }
      
      // Password validation
      if (rule.password && value) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(value)) {
          return 'La contraseña debe contener al menos 8 caracteres, incluir una letra mayúscula, una letra minúscula, un número y un carácter especial';
        }
      }
      
      // Minimum length validation
      if (rule.minLength && value.length < rule.minLength) {
        return `${rule.fieldName || name} debe tener al menos ${rule.minLength} caracteres`;
      }
    }
    
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Validate field on change
    if (validationRules[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let formIsValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName] || '');
      if (error) {
        newErrors[fieldName] = error;
        formIsValid = false;
      }
    });

    setErrors(newErrors);
    setIsValid(formIsValid);
    return formIsValid;
  };

  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
    setIsValid(false);
  };

  return {
    formData,
    errors,
    isValid,
    handleInputChange,
    validateForm,
    resetForm,
    setFormData
  };
};

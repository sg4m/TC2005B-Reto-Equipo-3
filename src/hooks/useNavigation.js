import { useNavigate } from 'react-router-dom';

export const useNavigation = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/');
  };

  const goToRegister = () => {
    navigate('/register');
  };

  const goToForgotPassword = () => {
    navigate('/forgot-password');
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  const goBack = () => {
    navigate(-1);
  };

  const goTo = (path) => {
    navigate(path);
  };

  return {
    goToLogin,
    goToRegister,
    goToForgotPassword,
    goToDashboard,
    goBack,
    goTo
  };
};

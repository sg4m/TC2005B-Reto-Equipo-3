import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

const Login = () => {
  const navigate = useNavigate();

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Login Page (Temporary)</h1>
      <Button
        variant="contained"
        onClick={handleForgotPassword}
        sx={{
          backgroundColor: '#E53935',
          color: 'white',
          '&:hover': {
            backgroundColor: '#D32F2F',
          },
        }}
      >
        Go to Forgot Password (Test)
      </Button>
    </div>
  );
};

export default Login;

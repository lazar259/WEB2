import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './UserLogin.css';
import authService from '../../services/authService';
import { LoginRequest } from '../../services/types';
import { getUserTypeFromToken } from '../../utils/jwt';

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginFormErrors {
  username?: string;
  password?: string;
}

const UserLogin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name as keyof LoginFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      setErrors({});

      try {
        const loginData: LoginRequest = {
          username: formData.username,
          password: formData.password,
        };

        const response = await authService.login(loginData);
        console.log(response);
        if (response.success) {
          // Save token and redirect based on user type
          console.log("success")
          if (response.token) {
            authService.saveAuthToken(response.token);
            
            // Get user type from token and redirect accordingly
            const userType = getUserTypeFromToken(response.token);
            console.log(userType);
            if (userType === 'admin') {
              navigate('/admin/dashboard');
            } else if (userType === 'student') {
              console.log("here");
              navigate('/student/dashboard');
            } else {
              // Fallback to main page if user type is unknown
              navigate('/');
            }
          }
          console.log('Login successful:', response);
        } else {
          // Handle login error - response is ApiError type here
          console.log("error?")
          if ('errors' in response && response.errors) {
            setErrors(response.errors);
          } else {
            setErrors({ username: response.message });
          }
        }
      } catch (error) {
        setErrors({ username: 'An unexpected error occurred. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="auth-container login-container">
      <div className="auth-card">
        <Link to="/" className="back-button">
          ← Back to Home
        </Link>
        <div className="welcome-section">
          <h1 className="welcome-title login">Welcome Back to QuizHub</h1>
          <p className="welcome-subtitle">Continue your learning journey!</p>
        </div>
        <h2 className="auth-title">Sign In</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`form-input ${errors.username ? 'error' : ''}`}
              placeholder="Enter your username"
            />
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
          
        </form>
        
        <div className="auth-switch">
          <p>Don't have an account? 
            <Link to="/register" className="switch-link">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
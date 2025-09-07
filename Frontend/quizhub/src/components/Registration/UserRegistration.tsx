import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './UserRegistration.css';
import authService from '../../services/authService';
import { RegisterRequest } from '../../services/types';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  profilePicture: File | null;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  profilePicture?: string;
}

const UserRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePicture: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          profilePicture: 'File size must be less than 5MB'
        }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          profilePicture: 'Please select an image file'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      setErrors(prev => ({
        ...prev,
        profilePicture: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.profilePicture) {
      newErrors.profilePicture = 'Profile picture is required';
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
        // Convert file to base64
        const profilePictureBase64 = await authService.fileToBase64(formData.profilePicture!);
        
        const registerData: RegisterRequest = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          profilePicture: profilePictureBase64,
          profilePictureName: formData.profilePicture!.name,
        };

        const response = await authService.register(registerData);

        if (response.success) {
          console.log('Registration successful:', response);
          console.log('Redirecting to login page...');
          // Redirect to login page after successful registration
          navigate('/login');
        } else {
          console.log('Registration failed:', response);
          // Handle registration error - response is ApiError type here
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
    <div className="auth-container registration-container">
      <div className="auth-card">
        <Link to="/" className="back-button">
          ← Back to Home
        </Link>
        <div className="welcome-section">
          <h1 className="welcome-title register">Welcome to QuizHub</h1>
          <p className="welcome-subtitle">Join our community of learners and test your knowledge!</p>
        </div>
        <h2 className="auth-title">Create Your Account</h2>
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
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
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

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="profilePicture" className="form-label">Profile Picture</label>
            <div className="file-upload-container">
              <input
                type="file"
                id="profilePicture"
                name="profilePicture"
                onChange={handleFileChange}
                className="file-input"
                accept="image/*"
              />
              <label htmlFor="profilePicture" className="file-upload-label">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="image-preview" />
                ) : (
                  <div className="upload-placeholder">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L13.09 8.26L19.5 7L18.5 13.74L21 12L16.74 18.26L17 18.74L7 12L12 2Z" fill="currentColor"/>
                    </svg>
                    <span>Click to upload image</span>
                  </div>
                )}
              </label>
            </div>
            {errors.profilePicture && <span className="error-message">{errors.profilePicture}</span>}
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
          
        </form>
        
        <div className="auth-switch">
          <p>Already have an account? 
            <Link to="/login" className="switch-link">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;
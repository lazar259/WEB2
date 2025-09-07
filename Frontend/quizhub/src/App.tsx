import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import UserRegistration from './components/Registration/UserRegistration';
import UserLogin from './components/Login/UserLogin';
import LandingPage from './components/LandingPage/LandingPage';
import AdminDashboard from './components/Admin/AdminDashboard';
import StudentDashboard from './components/Student/StudentDashboard';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/register" element={<UserRegistration />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requiredUserType="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute requiredUserType="student">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

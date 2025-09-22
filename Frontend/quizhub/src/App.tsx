import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import UserRegistration from './components/Registration/UserRegistration';
import UserLogin from './components/Login/UserLogin';
import LandingPage from './components/LandingPage/LandingPage';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserDashboard from './components/User/UserDashboard';
import QuizManagement from './components/Admin/QuizManagement/QuizManagement';
import ResultsManagement from './components/Admin/ResultsManagement';
import QuizTaking from './components/Quiz/QuizTaking';
import QuizResults from './components/Quiz/QuizResults';
import MyResults from './components/User/MyResults';
import GlobalRankings from './components/User/GlobalRankings';
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
            path="/admin/quiz-management"
            element={
              <ProtectedRoute requiredUserType="admin">
                <QuizManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/results-management"
            element={
              <ProtectedRoute requiredUserType="admin">
                <ResultsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute requiredUserType="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:quizId/take"
            element={
              <ProtectedRoute requiredUserType="user">
                <QuizTaking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:quizId/results/:attemptId"
            element={
              <ProtectedRoute>
                <QuizResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/my-results"
            element={
              <ProtectedRoute requiredUserType="user">
                <MyResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rankings"
            element={
              <ProtectedRoute requiredUserType="user">
                <GlobalRankings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import React, { useState } from 'react';
import './App.css';
import UserRegistration from './components/Registration/UserRegistration';
import UserLogin from './components/Login/UserLogin';

type ViewType = 'login' | 'register';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('login');

  const switchToLogin = () => setCurrentView('login');
  const switchToRegister = () => setCurrentView('register');

  return (
    <div className="App">
      {currentView === 'login' ? (
        <UserLogin onSwitchToRegister={switchToRegister} />
      ) : (
        <UserRegistration onSwitchToLogin={switchToLogin} />
      )}
    </div>
  );
}

export default App;

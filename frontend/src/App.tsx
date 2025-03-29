import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';

const App : React.FC = () => {
  return (
    <BrowserRouter>
      <AppRoutes />    
    </BrowserRouter>
  );
};

export default App;